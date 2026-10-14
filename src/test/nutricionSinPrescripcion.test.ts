/**
 * El plan de alimentación no se inventa.
 *
 * ADR-007: ante un backend incompleto, la app no fabrica datos clínicos. El
 * normalizador los fabricaba de dos maneras y ninguna era visible desde la
 * interfaz: rellenaba las comidas que el médico no envió con listas por
 * defecto, y clasificaba como grupo 'O_B' a quien no tiene grupo sanguíneo
 * cargado — con lo que recibía una dieta de carnes rojas y lácteos de cabra
 * presentada como prescripción, con `isDemoTemplate: false`.
 *
 * Estas pruebas fijan la regla: lo que el médico no mandó, no se muestra.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeAlimentacion,
  buildNutrigenomicPlan,
} from '../services/clinicalPayloadNormalizer';

/** Perfil con alimentación presente pero sin comidas ni grupo sanguíneo. */
const perfilSinPlan = {
  id: 'p1',
  firstName: 'Ana',
  alimentacion: {
    alimentosEvitar: 'Cochino y sus derivados',
  },
};

/** Perfil sin absolutamente nada de alimentación. */
const perfilVacio = { id: 'p1', firstName: 'Ana' };

describe('comidas que el médico no prescribió', () => {
  it('no rellena el desayuno con una lista por defecto', () => {
    const a = normalizeAlimentacion(perfilSinPlan);
    expect(a?.planAlimentario.desayuno).toEqual([]);
  });

  it('no rellena almuerzo, cena ni meriendas', () => {
    const a = normalizeAlimentacion(perfilSinPlan);
    expect(a?.planAlimentario.almuerzo).toEqual([]);
    expect(a?.planAlimentario.cenaComunes).toEqual([]);
    expect(a?.planAlimentario.meriendas).toEqual([]);
  });

  it('conserva lo que el médico SÍ envió', () => {
    const a = normalizeAlimentacion({
      ...perfilSinPlan,
      alimentacion: {
        ...perfilSinPlan.alimentacion,
        planAlimentario: { desayuno: ['Avena sin gluten'] },
      },
    });
    expect(a?.planAlimentario.desayuno).toEqual(['Avena sin gluten']);
    expect(a?.planAlimentario.almuerzo).toEqual([]);
  });
});

describe('grupo sanguíneo ausente', () => {
  it('no clasifica como O_B a quien no tiene grupo cargado', () => {
    const a = normalizeAlimentacion(perfilSinPlan);
    expect(a?.grupoSanguineo).toBeNull();
  });

  it('sigue clasificando correctamente cuando el dato existe', () => {
    expect(normalizeAlimentacion({ alimentacion: { grupoSanguineo: 'A' } })?.grupoSanguineo).toBe('A_AB');
    expect(normalizeAlimentacion({ alimentacion: { grupoSanguineo: 'AB' } })?.grupoSanguineo).toBe('A_AB');
    expect(normalizeAlimentacion({ alimentacion: { grupoSanguineo: 'O' } })?.grupoSanguineo).toBe('O_B');
    expect(normalizeAlimentacion({ alimentacion: { grupoSanguineo: 'B' } })?.grupoSanguineo).toBe('O_B');
  });

  it('es idempotente: normalizar dos veces no pierde el grupo', () => {
    // El perfil pasa por el normalizador en protocolService y otra vez al
    // construir el plan. Si la segunda pasada no reconoce 'A_AB'/'O_B',
    // el paciente se queda sin grupo sanguíneo.
    const unaVez = normalizeAlimentacion({
      alimentacion: { grupoSanguineo: 'A', planAlimentario: { desayuno: ['Avena sin gluten'] } },
    });
    expect(unaVez?.grupoSanguineo).toBe('A_AB');

    const dosVeces = normalizeAlimentacion({ alimentacion: unaVez });
    expect(dosVeces?.grupoSanguineo).toBe('A_AB');

    // Y el plan que llega a la pantalla conserva el tipo tras la doble pasada.
    expect(buildNutrigenomicPlan({ alimentacion: unaVez })?.bloodType).toBe('A');
  });

  it('no inventa un grupo a partir de un valor irreconocible', () => {
    expect(normalizeAlimentacion({ alimentacion: { grupoSanguineo: 'desconocido' } })?.grupoSanguineo).toBeNull();
  });
});

describe('plan nutrigenómico que llega a la pantalla', () => {
  it('devuelve null cuando no hay nada prescrito: la UI mostrará el aviso seguro', () => {
    expect(buildNutrigenomicPlan(perfilVacio)).toBeNull();
  });

  it('devuelve null si solo hay comidas vacías y ningún grupo sanguíneo', () => {
    expect(buildNutrigenomicPlan({ alimentacion: { planAlimentario: {} } })).toBeNull();
  });

  it('sí construye el plan cuando el médico prescribió algo', () => {
    const plan = buildNutrigenomicPlan({
      alimentacion: {
        grupoSanguineo: 'A',
        planAlimentario: { desayuno: ['Avena sin gluten'] },
      },
    });
    expect(plan).not.toBeNull();
    expect(plan?.bloodType).toBe('A');
    expect(plan?.foods.map((f) => f.name)).toContain('Avena sin gluten');
  });

  it('no afirma un tipo sanguíneo que nadie cargó', () => {
    const plan = buildNutrigenomicPlan({
      alimentacion: { planAlimentario: { desayuno: ['Avena sin gluten'] } },
    });
    expect(plan?.bloodType).toBeNull();
  });
});
