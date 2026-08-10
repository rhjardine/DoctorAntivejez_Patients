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
- El replay asume **endpoints idempotentes**. Si `PATCH /protocols/{id}/status` no lo es, un
  reintento podría duplicar registros. **Sin confirmar con el backend** — requisito recogido en
  [ADR-005](ADR-005-ids-inestables-adherencia.md).
- IndexedDB puede no estar disponible en modo privado de algunos navegadores; la cola degrada
  a no persistir, sin romper la app.

## Pendiente

- Métricas de longitud de cola y tiempo medio de drenaje (R-P2-3), para detectar acumulación
  antes de que el paciente la note.
- Confirmar la idempotencia de los endpoints de mutación.
