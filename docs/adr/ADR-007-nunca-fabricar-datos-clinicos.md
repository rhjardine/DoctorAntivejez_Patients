# ADR-007 — Nunca fabricar datos clínicos ante un fallo del backend

- **Estado:** Aceptado
- **Fecha:** 2026-08-09
- **Contexto normativo:** R-P0-5 del Informe de Gobernanza Pre-Beta; §6.2 ("estrategias de
  fallback inconsistentes")
- **Componentes:** `patientDataService.ts`, `nutritionService.ts`

---

## Contexto

`patientDataService` aplicaba una estrategia *local-first* mal calibrada: cuando el backend
fallaba o el endpoint aún no existía, devolvía **datos clínicos inventados** en lugar de fallar.

**1. Pauta de tratamiento fabricada** (`getOfflineGuideFallback`):

```
"Aceite de ricino — 4 cucharadas — En la noche antes de dormir"
"Complejo B Avanzado — 1 cápsula — Después del desayuno"
```

Dosis y horarios hardcodeados, con la misma forma que una prescripción real. Un paciente podía
seguir una pauta que **ningún médico le recetó**.

**2. Plan nutrigenómico demo** (`fetchNutrigenomicPlan`): devolvía tipo de sangre `'O'` y una
lista de alimentos prohibidos (`Trigo`, `Cerdo`, `Azúcar refinada`) marcada con
`isDemoTemplate: true`. **Ninguna vista consumía ese flag** (verificado: cero referencias en
`.tsx`), así que el plan demo se pintaba idéntico a uno real. El paciente podía evitar alimentos
por una restricción inventada, o ignorar una que sí le aplicaba.

**3. Stub engañoso** (`toggleGuideItemCompletion`): `return true` sin llamar al backend.
Reportaba éxito por una adherencia que nunca se registraba — el mismo defecto corregido en
ADR-005, en una segunda ruta.

### Mitigante y riesgo real

Toda esta superficie estaba **muerta en el momento de la auditoría**: `fetchPatientGuide` y
`fetchNutrigenomicPlan` no tenían consumidores, y `fetchMetrics` / `fetchConsultationHistory`
solo se invocaban desde `MetricsView` y `ConsultationHistoryView`, componentes que nunca se
renderizan (la ruta `/history` muestra `FeatureGateView`).

El riesgo era por tanto **latente, no activo**: bastaba con que alguien conectara `/history` o
`MetricsView` para empezar a despachar prescripciones inventadas sin que nada lo señalara.
Un riesgo latente en una app clínica no es un riesgo menor: es uno que aparecerá sin revisión.

---

## Decisión

**Ante un fallo del backend, el frontend falla de forma explícita. Nunca inventa.**

Se adopta como criterio único el que `nutritionService.getSmartNutritionPlan()` ya aplicaba
correctamente: lanzar un error con un mensaje accionable para el paciente.

- `fetchPatientGuide` → lanza *"No pudimos cargar tu guía de tratamiento. Consulta con tu médico."*
- `fetchNutrigenomicPlan` → lanza *"No hay un plan de nutrición configurado por tu médico."*
- `getOfflineGuideFallback` → eliminada.
- `toggleGuideItemCompletion` → eliminada. La ruta real de adherencia es
  `ProtocolService.updateItemStatus` (ADR-005); mantener un duplicado que devuelve `true` sin
  hacer nada solo reintroduce el defecto por otra puerta.

`fetchMetrics` y `fetchConsultationHistory` ya fallaban correctamente (dataset vacío + flag de
error, sin fabricar) y se conservan como estaban.

---

## Consecuencias

**Positivas**
- Desaparece la posibilidad de que un paciente reciba una prescripción o una restricción
  alimentaria que nadie emitió.
- Un solo criterio de fallback en toda la capa de datos clínicos.
- Las funciones siguen existiendo como puntos de integración: cuando el backend exponga los
  endpoints, solo hay que conectarlos.

**Negativas / aceptadas**
- Las vistas que consuman estas funciones **deben manejar el rechazo**. Hoy ninguna las consume,
  pero quien conecte `/history` o `MetricsView` tendrá que implementar el estado de error.
  Es deliberado: obliga a decidir qué ve el paciente, en vez de heredar un relleno silencioso.

---

## Verificación

`src/test/patientDataService.test.ts` fija el contrato:

- `fetchPatientGuide` **rechaza** en vez de devolver una pauta fabricada;
- `fetchNutrigenomicPlan` **rechaza** en vez de devolver un plan demo;
- `fetchConsultationHistory` devuelve `[]`, nunca consultas inventadas.

Los dos primeros fallarían si alguien reintrodujera un fallback fabricado.
