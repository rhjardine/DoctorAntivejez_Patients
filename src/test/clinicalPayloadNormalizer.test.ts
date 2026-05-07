import { describe, expect, it } from 'vitest';
import {
  buildNutrigenomicPlan,
  normalizeAlimentacion,
  normalizePatientProtocol,
} from '../services/clinicalPayloadNormalizer';

describe('clinicalPayloadNormalizer', () => {
  it('normaliza todas las categorías de selections enviadas desde la webapp médica', () => {
    const profile = {
      guides: [
        {
          createdAt: '2026-05-01T10:00:00.000Z',
          selections: {
            REMOVAL_PHASE: [
              {
                nombre: 'Aceite de ricino',
                dosis: '1 cda',
                horario: 'Noche',
                observaciones: 'Importante',
              },
            ],
            PRIMARY_NUTRACEUTICALS: [
              { name: 'Omega 3', dose: '2 caps', timeSlot: 'MORNING' },
            ],
            ANTI_AGING_THERAPIES: [
              {
                itemName: 'Suero antivejez',
                schedule: 'Semanal',
                momento: 'flexible',
              },
            ],
          },
        },
      ],
    };

    const items = normalizePatientProtocol(profile);

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.category)).toEqual([
      'REMOVAL_PHASE',
      'PRIMARY_NUTRACEUTICALS',
      'ANTI_AGING_THERAPIES',
    ]);
    expect(items[0]).toMatchObject({
      itemName: 'Aceite de ricino',
      dose: '1 cda',
      timeSlot: 'EVENING',
    });
  });

  it('normaliza protocol array serializado sin perder items', () => {
    const profile = {
      guides: [
        {
          protocol: [
            {
              id: 'a',
              category: 'REVITALIZATION_PHASE',
              itemName: 'Complejo B',
              status: 'completed',
            },
            { id: 'b', category: 'COSMECEUTICALS', itemName: 'Crema nocturna' },
          ],
        },
      ],
    };

    const items = normalizePatientProtocol(profile);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: 'a', status: 'completed' });
    expect(items[1]).toMatchObject({ id: 'b', status: 'pending' });
  });

  it('normaliza alimentación desde foodPlans/items cuando no existe profile.alimentacion', () => {
    const profile = {
      bloodType: 'A',
      selectedDiets: ['METABOLIC'],
      foodPlans: [
        {
          createdAt: '2026-05-01T10:00:00.000Z',
          items: [
            { mealType: 'BREAKFAST', name: 'Avena sin gluten' },
            { mealType: 'LUNCH', name: 'Pollo con ensalada' },
            { mealType: 'DINNER', name: 'Sopa vegetal' },
            { mealType: 'SNACK', name: 'Nueces' },
          ],
          forbidden: ['Azúcar refinada', 'Frituras'],
        },
      ],
    };

    const alimentacion = normalizeAlimentacion(profile);
    const plan = buildNutrigenomicPlan(profile);

    expect(alimentacion?.grupoSanguineo).toBe('A_AB');
    expect(alimentacion?.planAlimentario.desayuno).toContain(
      'Avena sin gluten',
    );
    expect(plan?.foods.map((food) => food.name)).toContain(
      'Pollo con ensalada',
    );
    expect(plan?.forbidden).toContain('Azúcar refinada');
    expect(plan?.dietTypes).toContain('METABOLIC');
  });
});
