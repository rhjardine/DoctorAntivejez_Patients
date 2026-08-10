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

## Contrato pendiente del backend (bloquea Gate 1)

Para cerrar R-P0-1 de raíz, `mobile-profile-v1` debe garantizar:

1. **Todo ítem de protocolo lleva un identificador propio y persistente** (`id`, `_id`,
   `protocolItemId`, `itemId` o `treatmentId` — `stableId()` ya acepta cualquiera de ellos).
2. **El identificador sobrevive a las reediciones de la guía por parte del médico.** No puede
   derivarse de la posición en el array ni del nombre del tratamiento.
3. **`PATCH /protocols/{itemId}/status` existe y es idempotente**, para que el drenaje de la cola
   offline no duplique registros.

Cuando se cumpla, `stableId()` dejará de emitir el prefijo `UNSTABLE_HASH_` por sí solo, la rama
de rechazo quedará inerte y podrá eliminarse junto con este ADR.

**Verificación de cierre:** la métrica `adherence_rejected_unstable_id` debe caer a cero en el
piloto durante dos semanas consecutivas.

---

## Referencias

- Informe de Gobernanza Pre-Beta — R-P0-1, D-4, §6.2 ("nunca inventar datos clínicos"), §6.3.
- Tests: `src/test/authService.test.ts` — *"NO marca el ítem como completado en caché si el ID es
  inestable"* y *"sí actualiza el caché cuando el ID es estable"*.
