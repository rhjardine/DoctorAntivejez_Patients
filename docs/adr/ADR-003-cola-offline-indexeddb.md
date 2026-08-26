# ADR-003 — Cola offline en IndexedDB con sanitización de credenciales

- **Estado:** Aceptado
- **Fecha:** 2026-08-09 (documenta una decisión anterior, ya implementada)
- **Componentes:** `offlineQueue.ts`, `useSyncQueue.ts`, `protocolService.ts`

---

## Contexto

Los pacientes registran adherencia en condiciones de conectividad variable (zonas con mala
cobertura, modo avión, transporte). Perder un registro porque la red falló en ese instante
degrada el dato clínico que ve el médico.

Hace falta persistir las mutaciones fallidas y reintentarlas al recuperar conexión.

## Decisión

Cola de peticiones en **IndexedDB** (`offlineQueue.ts`), drenada por `useSyncQueue` cuando
vuelve la conectividad.

**Dos garantías de diseño:**

1. **La cabecera `Authorization` nunca se persiste.** `enqueue()` la elimina del objeto antes de
   escribir en IndexedDB (`delete safeHeaders['Authorization']`, y su variante en minúsculas).
   Persistir un Bearer token en IndexedDB equivaldría a guardarlo en disco, contradiciendo
   [ADR-002](ADR-002-access-token-solo-en-memoria.md). En el *replay*, `useSyncQueue` inyecta un
   token fresco desde `tokenStore`.

2. **TTL de 7 días** (`pruneExpired`). Una petición encolada durante semanas ya no representa el
   estado real del paciente: reproducirla podría sobrescribir información más reciente con datos
   obsoletos. Vencido el plazo, se descarta.

3. **Cada escritura se sella con su `patientId`** y el drenaje solo reproduce las del paciente
   con sesión abierta (`dequeueForCurrentPatient`).

   Se añadió tras detectar un fallo de atribución clínica. La cola vive en IndexedDB, que
   `clearPatientScopedStorage()` **no** borra —solo alcanza localStorage y sessionStorage—, y
   `useSyncQueue` inyecta el token de la sesión activa en el momento del replay. En un
   dispositivo compartido la secuencia era:

   1. El paciente A escribe su diario sin conexión → se encola.
   2. A cierra sesión; la cola sobrevive.
   3. B inicia sesión y el drenaje reenvía la entrada de A **con el token de B**.
   4. El texto de A queda en la historia clínica de B.

   Afectaba también al **registro de consentimiento** (`/mobile-profile-v1/consent`), que usa
   la misma cola: un consentimiento atribuido al paciente equivocado es un problema legal, no
   solo de privacidad.

   Las entradas de otros pacientes **no se descartan** —su dueño puede volver a entrar en el
   mismo dispositivo— y caducan por el TTL.

Se eligió IndexedDB sobre `localStorage` por capacidad y por ser asíncrono, sin bloquear el hilo
principal al drenar la cola.

## Consecuencias

**Positivas**
- La adherencia registrada sin conexión no se pierde.
- Ninguna credencial queda en reposo en IndexedDB.
- La cola no crece de forma indefinida.

**Negativas / aceptadas**
- **Se descartan peticiones con más de 7 días.** Es deliberado, pero implica pérdida silenciosa
  de datos si el paciente estuvo desconectado más tiempo. No hay aviso al respecto: es una mejora
  pendiente.
- **El cuerpo de las peticiones se guarda sin cifrar en IndexedDB.** Puede contener texto de
  salud —el diario de gratitud viaja como `notes`—, a diferencia del perfil clínico, que sí se
  cifra (ADR-001). El aislamiento por paciente evita la atribución cruzada, pero no protege
  frente a un volcado del almacenamiento del dispositivo. Cifrar el cuerpo con `cryptoService`
  antes de encolar es la mejora pendiente.
- El replay asume **endpoints idempotentes**. Si `PATCH /protocols/{id}/status` no lo es, un
  reintento podría duplicar registros. **Sin confirmar con el backend** — requisito recogido en
  [ADR-005](ADR-005-ids-inestables-adherencia.md).
- IndexedDB puede no estar disponible en modo privado de algunos navegadores; la cola degrada
  a no persistir, sin romper la app.

## Pendiente

- Métricas de longitud de cola y tiempo medio de drenaje (R-P2-3), para detectar acumulación
  antes de que el paciente la note.
- Confirmar la idempotencia de los endpoints de mutación.
