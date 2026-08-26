# ADR-005 — IDs inestables de ítems de protocolo y su efecto en la adherencia

- **Estado:** Aceptado (solución parcial — la raíz depende del backend)
- **Fecha:** 2026-08-09
- **Contexto normativo:** R-P0-1 del Informe de Gobernanza Pre-Beta. Decisión D-4: *"no es negociable"*.
- **Componentes:** `clinicalPayloadNormalizer.ts`, `protocolService.ts`, `PatientGuidePage.tsx`, `PatientGuideView.tsx`

---

## Contexto

El backend (`mobile-profile-v1`) devuelve ítems del protocolo clínico que **no siempre incluyen
un identificador propio**. Cuando falta, `stableId()` genera un hash local a partir de
`categoria:index:nombre` y lo prefija con `UNSTABLE_HASH_`.

Ese hash **no existe en el backend**. Por tanto un `PATCH /protocols/{id}/status` con ese ID
nunca puede registrar la adherencia del paciente.

### El fallo real, antes de este cambio

`updateItemStatus()` escribía el estado optimista en el caché de sesión **antes** de comprobar
si el ID era estable, y `PatientGuidePage.handleToggleItem()` **descartaba el valor de retorno**.
El resultado observable era:

1. El paciente marcaba "tomé mi tratamiento".
2. La casilla quedaba marcada, y persistía en `sessionStorage`.
3. La sincronización se abortaba con `return false`.
4. **Nadie se enteraba.** El médico nunca recibía el dato.

En una aplicación clínica esto no es un bug de UI: es un **evento adverso documentable**. El
paciente cree haber registrado adherencia; el médico toma decisiones sobre datos ausentes.

---

## Decisión

### Lo que se hizo (frontend, este repositorio)

1. **El guard `UNSTABLE_HASH_` se movió antes de cualquier escritura en caché.** Un ítem no
   sincronizable ya no queda marcado como completado en `sessionStorage`.
2. **La UI revierte el estado optimista** cuando `updateItemStatus()` devuelve `false`, y muestra
   un banner rojo explícito: *"No pudimos registrar este cambio. Tu médico no lo verá todavía."*
3. **Telemetría** vía `logger.audit('adherence_rejected_unstable_id')` para medir la frecuencia
   real del problema en el piloto y dimensionar la deuda del backend con datos, no con estimaciones.
4. **Se cerró una fuga de PHI colateral**: `stableId()` hacía
   `console.warn('...', item)`, volcando a consola el nombre del tratamiento y la dosis. Ahora usa
   `logger.warn` con metadatos no identificatorios (`category`, `index`).

### Lo que se descartó explícitamente

El TASK SPEC original proponía **hacer `stableId()` determinista** (ID compuesto
`categoria|slot|nombre`) para "estabilizar" los IDs. **Se rechazó por análisis de la traza real:**

```
ID compuesto → PATCH /protocols/{id}/status → el backend no conoce ese ID → 404
  → catch → offlineQueue.enqueue() → reintento indefinido → return TRUE
```

Un ID determinista en el cliente **no es un ID conocido por el servidor**. El cambio habría
convertido un fallo ruidoso y honesto (`return false`) en un **fallo silencioso que reporta
éxito**, con la casilla marcada y una cola de reintentos que nunca drena. Habría satisfecho el
criterio de éxito escrito mientras empeoraba la seguridad del paciente.

Se aplicó en su lugar el §6.3 del informe: *"la deuda queda documentada, no ocultada"*.

---

## Consecuencias

**Positivas**
- El paciente nunca ve una adherencia registrada que su médico no vaya a recibir.
- La frecuencia del problema pasa a ser medible.
- El caché de sesión deja de contener estado falso.

**Negativas / aceptadas**
- **La adherencia de ítems sin ID de backend sigue sin registrarse.** No es reparable desde el
  frontend. El paciente ve un aviso, pero el dato clínico se pierde.
- Se requiere un **canal manual de respaldo** durante el piloto: el paciente reporta la adherencia
  en consulta o por el canal de soporte hasta que el backend cierre la deuda.

---

## Segunda causa: el endpoint tampoco existe

Auditando el inventario de endpoints apareció un segundo motivo, **independiente del primero**.

La adherencia de la guía escribe en `PATCH /protocols/{itemId}/status`. Esa ruta pertenece a una
familia REST (`/patients/{id}/guide`, `/patients/{id}/metrics`, `/protocols/...`) que **el
backend no expone**: en la PWA, todo lo que funciona usa la familia `mobile-*-v1`.

Prueba de ello es que las 5A sí registran actividad, y lo hacen contra otro endpoint:

```ts
// ActivityView.tsx y AttitudeView.tsx — este SÍ funciona
await apiClient.post('/mobile-adherence-v1', { type, points, notes, metadata });
```

**Implicación práctica:** aunque mañana el backend empezara a emitir IDs estables, la adherencia
de la guía **seguiría sin registrarse**, porque apunta a una ruta inexistente. Son dos arreglos,
no uno, y conviene planificarlos juntos.

---

## Especificación para el Backend Lead

### 1. Identificadores estables en el protocolo

`GET /mobile-profile-v1` debe garantizar, para cada ítem dentro de `guides[].selections`:

```jsonc
{
  "id": "uuid-o-id-persistente",   // obligatorio
  "nombre": "Complejo B Avanzado",
  "dosis": "1 cápsula",
  "frecuencia": "Después del desayuno"
}
```

- El `id` **sobrevive a las reediciones de la guía**. No puede derivarse de la posición en el
  array ni del nombre del tratamiento: si el médico reordena o renombra, el histórico de
  adherencia debe seguir apuntando al mismo ítem.
- `stableId()` ya acepta `id`, `_id`, `protocolItemId`, `itemId` o `treatmentId`; cualquiera vale.

### 2. Registrar la adherencia de un ítem

**Recomendación: extender `mobile-adherence-v1`** en lugar de construir la familia REST entera.
Ya existe, ya está autenticado y ya lo consume la app.

```jsonc
POST /mobile-adherence-v1
{
  "type": "protocol_item",
  "status": "completed",           // | "pending"
  "metadata": { "itemId": "<id estable del paso 1>" }
}
```

Requisitos:
- **Idempotente por `(patientId, itemId, día)`**: la cola offline reintenta, y un reintento no
  debe duplicar el registro. Devolver `409` ante un duplicado ya aplicado — el drenaje ya trata
  el `409` como éxito (`useSyncQueue.ts`).
- **Derivar el paciente del token, nunca del cuerpo.** Un `patientId` enviado por el cliente es
  una vía directa a escribir en la historia de otra persona.
- Responder `404` si el `itemId` no pertenece a ese paciente.

Si se prefiere la ruta REST, el contrato equivalente es `PATCH /protocols/{itemId}/status` con
las mismas garantías. Lo que no puede quedar es la situación actual: una ruta declarada en el
cliente que el servidor no atiende.

### 3. Autorización a nivel de fila (RLS)

La PWA **no accede a la base de datos**: no hay Supabase ni cliente SQL, solo la API REST
(verificado). Por tanto **RLS no se configura ni se activa desde este repositorio** — vive
íntegramente en el backend, y allí debe verificarse:

- Toda consulta de datos clínicos filtra por el paciente derivado **del token**, no de un
  parámetro de la petición.
- Si la base es PostgreSQL/Supabase, activar RLS en las tablas de pacientes, protocolos,
  adherencia, biometrías y consentimiento, con políticas basadas en el id autenticado.
- Probar explícitamente el caso negativo: con el token del paciente A, pedir el recurso del
  paciente B debe devolver `403`/`404`, nunca datos.
- La clave `service_role` (u equivalente) **jamás** puede salir al cliente. El CI ya falla si
  aparece en el bundle (`scripts/check-secrets.mjs`).

### 4. Gestión de claves de cifrado

Cierra la limitación descrita en [ADR-001](ADR-001-cifrado-phi-device-bound.md): la semilla de
cifrado viaja en el bundle y es pública.

Propuesta: tras autenticar, devolver un **secreto de envoltura por usuario** que la PWA
mantenga **solo en memoria** y use para derivar la clave del caché local.

```jsonc
POST /mobile-auth-v1
{ "token": "...", "refreshToken": "...", "patient": {...},
  "encryptionKey": "<secreto de 32+ bytes, por usuario>" }
```

Efecto: el contenido cifrado en el dispositivo deja de ser descifrable sin una sesión válida,
que es la garantía que ADR-001 describía y hoy no ofrece.

### 5. Rate limiting en autenticación

`POST /mobile-auth-v1` recibe cédulas numéricas cortas. Sin limitación es enumerable por fuerza
bruta. Aplicar límite por IP **y** por documento, con bloqueo temporal progresivo.

### 6. Validar en el servidor

`src/utils/validation.ts` define las reglas de cliente (documento, correo, teléfono, nombre,
texto libre) con sus límites en la constante `LIMITS`. **Son de experiencia de usuario, no una
barrera**: cualquiera puede saltárselas. El servidor debe aplicar las mismas y rechazar lo que
no cumpla.

---

## Verificación de cierre

1. La métrica `adherence_rejected_unstable_id` cae a cero durante dos semanas del piloto.
2. Un paciente marca un ítem, recarga la app y el estado persiste.
3. El médico ve esa adherencia en su panel.

Hasta que los tres se cumplan, el porcentaje de adherencia del panel
(`HomePage.tsx`) sub-reporta y no debe leerse como indicador clínico.

---

## Referencias

- Informe de Gobernanza Pre-Beta — R-P0-1, D-4, §6.2 ("nunca inventar datos clínicos"), §6.3.
- Tests: `src/test/authService.test.ts` — *"NO marca el ítem como completado en caché si el ID es
  inestable"* y *"sí actualiza el caché cuando el ID es estable"*.
