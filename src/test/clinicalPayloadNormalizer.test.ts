import { describe, expect, it, vi } from 'vitest';
import {
  buildNutrigenomicPlan,
  normalizeAlimentacion,
  normalizePatientProtocol,
} from '../services/clinicalPayloadNormalizer';
import { logger } from '../utils/logger';

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

  it('asigna un ID prefijado con UNSTABLE_HASH_ si falta el ID en el backend', () => {
    const profile = {
      guides: [
        {
          createdAt: '2026-05-01T10:00:00.000Z',
          selections: {
            REMOVAL_PHASE: [
              {
                nombre: 'Aceite de ricino',
              },
            ],
          },
        },
      ],
    };
    const items = normalizePatientProtocol(profile);
    expect(items[0].id).toBeDefined();
    expect(items[0].id.startsWith('UNSTABLE_HASH_')).toBe(true);
  });

  // ⚠️ SEGURIDAD CLÍNICA
  // `pickFirst` descarta '' por diseño, así que `String(pickFirst(..., ''))`
  // devolvía la cadena literal "undefined" cuando el backend omitía el campo.
  // El paciente veía "undefined" donde debía ir su dosis y su horario.
  describe('campos ausentes del backend', () => {
    const protocolConCamposVacios = (extra: Record<string, unknown> = {}) =>
      normalizePatientProtocol({
        guides: [
          {
            createdAt: '2026-05-01T10:00:00.000Z',
            selections: {
              PRIMARY_NUTRACEUTICALS: [{ nombre: 'Complejo B', ...extra }],
            },
          },
        ],
      });

    it('nunca emite la cadena "undefined" en dosis, horario u observaciones', () => {
      const [item] = protocolConCamposVacios();

      expect(item.dose).toBe('');
      expect(item.schedule).toBe('');
      expect(item.observations).toBe('');

      const rendered = `${item.dose}${item.schedule}${item.observations}`;
      expect(rendered).not.toContain('undefined');
    });

    it('conserva los valores cuando el backend sí los envía', () => {
      const [item] = protocolConCamposVacios({
        dosis: '5 gotas',
        frecuencia: 'En ayunas',
        observaciones: 'Sublingual',
      });

      expect(item.dose).toBe('5 gotas');
      expect(item.schedule).toBe('En ayunas');
      expect(item.observations).toBe('Sublingual');
    });
  });

  // El backend envía claves técnicas como nombre de producto. Un identificador
  // crudo en una prescripción es ilegible para el paciente.
  describe('nombres de ítem', () => {
    const nombreDe = (nombre: string) =>
      normalizePatientProtocol({
        guides: [
          {
            createdAt: '2026-05-01T10:00:00.000Z',
            selections: { PRIMARY_NUTRACEUTICALS: [{ nombre }] },
          },
        ],
      })[0].itemName;

    it('usa el nombre legible cuando la clave está mapeada', () => {
      // Mapeo aportado por la especificación del sprint.
      expect(nombreDe('am_bioterapico')).toBe('Bioterápico');
    });

    it('humaniza una clave desconocida en lugar de mostrarla cruda', () => {
      const name = nombreDe('xx_producto_desconocido');

      expect(name).not.toContain('_');
      expect(name).toBe('Xx Producto Desconocido');
    });

    it('respeta un nombre que ya viene legible', () => {
      expect(nombreDe('Aceite de ricino')).toBe('Aceite de ricino');
    });

    it('registra un aviso cuando la clave no está mapeada', () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      nombreDe('zz_clave_sin_mapear');

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('sin mapear'),
        expect.objectContaining({ reason: 'UNMAPPED_ITEM_KEY' }),
      );
      warn.mockRestore();
    });

    it('no avisa de clave sin mapear cuando la clave sí está mapeada', () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      nombreDe('am_bioterapico');

      // Se comprueba el motivo concreto, no la ausencia total de avisos: el
      // fixture no trae `id`, así que stableId() emite su propio
      // MISSING_BACKEND_ID, que es correcto y esperado.
      const motivos = warn.mock.calls.map((c) => (c[1] as any)?.reason);
      expect(motivos).not.toContain('UNMAPPED_ITEM_KEY');

      warn.mockRestore();
    });

    // ⚠️ El log no puede filtrar información del paciente. Antes de esta guarda,
    // stableId() volcaba el ítem completo —nombre del tratamiento y dosis— a la
    // consola del navegador.
    it('no incluye PHI en el registro: solo la clave técnica y metadatos', () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      normalizePatientProtocol({
        guides: [
          {
            createdAt: '2026-05-01T10:00:00.000Z',
            selections: {
              PRIMARY_NUTRACEUTICALS: [
                {
                  nombre: 'yy_clave_tecnica',
                  dosis: '5 gotas sublinguales',
                  observaciones: 'Paciente con hipertensión controlada',
                },
              ],
            },
          },
        ],
      });

      const registrado = JSON.stringify(warn.mock.calls);
      expect(registrado).toContain('yy_clave_tecnica'); // la clave sí, es técnica
      expect(registrado).not.toContain('5 gotas sublinguales'); // la dosis no
      expect(registrado).not.toContain('hipertensión'); // la observación clínica tampoco

      warn.mockRestore();
    });
  });
});
