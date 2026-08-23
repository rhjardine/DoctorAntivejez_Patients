import { logger } from '../utils/logger';

/**
 * Clasificación de las categorías del protocolo en las dos pestañas que pidió
 * el médico:
 *
 *   ORAL      — Terapia Oral: nutracéuticos, suplementos y cosmecéuticos que el
 *               paciente toma o se aplica por su cuenta. Admite marcar adherencia.
 *   CLINICAL  — Terapéutica: procedimientos que se realizan en consulta (sueros,
 *               shots, quelaciones, nebulizaciones, pediluvio, terapia celular).
 *               Es solo lectura: funciona como receta médica oficial.
 *
 * ⚠️ ESTA ES UNA CLASIFICACIÓN CLÍNICA, NO UNA DECISIÓN DE INTERFAZ.
 * Debe validarla el médico. Está aislada en este archivo justamente para que
 * corregirla sea cambiar una línea, sin tocar componentes.
 */

export type TherapyGroup = 'ORAL' | 'CLINICAL';

/**
 * Procedimientos que se aplican en consulta.
 * Todo lo que no esté aquí se considera de toma oral (ver `groupForCategory`).
 */
const CLINICAL_CATEGORIES: ReadonlySet<string> = new Set([
  'ANTI_AGING_SERUMS', // Sueros — Shot Antivejez
  'ANTI_AGING_THERAPIES', // Terapias Antienvejecimiento
  'BIO_NEURAL_THERAPY', // Terapia BioNeural
  'THERAPY_CONTROL', // Control de Terapia
]);

/**
 * Categorías conocidas de toma oral.
 *
 * Las cuatro fases 4R (`REMOVAL_`, `REVITALIZATION_`, `REGENERATION_` y
 * `RESTORATION_PHASE`) se incluyen aquí porque sus ítems son de toma oral
 * —p. ej. "Aceite de ricino, 4 cucharadas"—. **Pendiente de confirmar por el
 * médico**: si alguna fase incluye procedimientos de consulta, basta moverla al
 * conjunto de arriba.
 */
const ORAL_CATEGORIES: ReadonlySet<string> = new Set([
  'PRIMARY_NUTRACEUTICALS',
  'SECONDARY_NUTRACEUTICALS',
  'COMPLEMENTARY_NUTRACEUTICALS',
  'METABOLIC_ACTIVATOR',
  'COSMECEUTICALS',
  'NATURAL_FORMULAS',
  'REMOVAL_PHASE',
  'REVITALIZATION_PHASE',
  'REGENERATION_PHASE',
  'RESTORATION_PHASE',
]);

/**
 * Grupo al que pertenece una categoría.
 *
 * Invariante: **nunca devuelve nada que haga desaparecer un ítem**. Una
 * categoría desconocida cae en Terapia Oral y se registra, en lugar de
 * descartarse: un ítem que no se muestra es un tratamiento que el paciente no
 * sabe que tiene.
 */
export const groupForCategory = (category: string): TherapyGroup => {
  if (CLINICAL_CATEGORIES.has(category)) return 'CLINICAL';
  if (ORAL_CATEGORIES.has(category)) return 'ORAL';

  logger.warn('[therapyGroups] Categoría sin clasificar, se muestra en Terapia Oral', {
    reason: 'UNCLASSIFIED_CATEGORY',
    category,
  });
  return 'ORAL';
};

export const THERAPY_GROUP_LABELS: Record<TherapyGroup, string> = {
  ORAL: 'Terapia Oral',
  CLINICAL: 'Terapéutica',
};
