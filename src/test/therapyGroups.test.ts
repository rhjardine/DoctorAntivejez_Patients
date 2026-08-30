import { describe, it, expect } from 'vitest';
import { groupForCategory } from '../config/therapyGroups';

/**
 * La división Terapia Oral / Terapéutica es una clasificación clínica.
 * Estos tests fijan el reparto acordado y, sobre todo, el invariante que
 * importa: ninguna categoría hace desaparecer un ítem.
 */

describe('groupForCategory', () => {
  it.each([
    'ANTI_AGING_SERUMS',
    'ANTI_AGING_THERAPIES',
    'BIO_NEURAL_THERAPY',
    'THERAPY_CONTROL',
  ])('%s es un procedimiento de consulta', (category) => {
    expect(groupForCategory(category)).toBe('CLINICAL');
  });

  it.each([
    'PRIMARY_NUTRACEUTICALS',
    'SECONDARY_NUTRACEUTICALS',
    'COMPLEMENTARY_NUTRACEUTICALS',
    'METABOLIC_ACTIVATOR',
    'COSMECEUTICALS',
    'NATURAL_FORMULAS',
  ])('%s es de toma oral', (category) => {
    expect(groupForCategory(category)).toBe('ORAL');
  });

  // Pendiente de confirmación médica: sus ítems son de toma oral
  // (p. ej. "Aceite de ricino, 4 cucharadas").
  it.each([
    'REMOVAL_PHASE',
    'REVITALIZATION_PHASE',
    'REGENERATION_PHASE',
    'RESTORATION_PHASE',
  ])('la fase 4R %s se clasifica hoy como oral', (category) => {
    expect(groupForCategory(category)).toBe('ORAL');
  });

  it('una categoría desconocida se muestra en vez de descartarse', () => {
    // Un ítem que no aparece en ninguna pestaña es un tratamiento que el
    // paciente no sabe que tiene. Debe caer en un grupo, siempre.
    expect(groupForCategory('CATEGORIA_QUE_NO_EXISTE')).toBe('ORAL');
  });
});
