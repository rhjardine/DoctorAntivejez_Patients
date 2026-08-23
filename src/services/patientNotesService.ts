import { cryptoService } from './cryptoService';
import { logger } from '../utils/logger';

/**
 * Notas privadas del paciente sobre su plan de alimentación.
 *
 * ## Alcance: solo este dispositivo
 *
 * No existe endpoint para enviar texto del paciente al backend, así que estas
 * notas **no llegan a su médico**. La interfaz debe decirlo de forma explícita:
 * un paciente que escriba "este suplemento me dio náuseas" creyendo que su
 * médico lo leerá es un riesgo clínico, no un detalle de producto.
 *
 * Toda la E/S pasa por esta interfaz para que conectarla a un endpoint, cuando
 * exista, sea un cambio en un solo archivo.
 *
 * ## Cifrado
 *
 * Se cifran con AES-GCM (ver ADR-001), igual que el perfil clínico: el paciente
 * puede describir síntomas o reacciones, que es información de salud.
 *
 * ## Ciclo de vida
 *
 * La clave usa el prefijo `da_`, de modo que `clearPatientScopedStorage()` la
 * borra en el logout. Sin ese prefijo, las notas de un paciente sobrevivirían
 * al cierre de sesión en un dispositivo compartido.
 */

const STORAGE_KEY = 'da_meal_notes_v1';

export type MealNotes = Record<string, string>;

const readAll = async (): Promise<MealNotes> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.trim() === '') return {};

    // Restos de una versión anterior sin cifrar, o valor corrupto: descartar en
    // vez de intentar interpretarlo.
    if (raw.startsWith('{') || !raw.includes(':')) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }

    const decrypted = await cryptoService.decrypt(raw);
    if (decrypted && typeof decrypted === 'object') return decrypted as MealNotes;

    localStorage.removeItem(STORAGE_KEY);
    return {};
  } catch {
    // El descifrado falla si cambia la huella del dispositivo. No propagar:
    // perder una nota local nunca debe romper la pantalla del plan.
    logger.warn('[patientNotes] No se pudieron leer las notas locales', {
      reason: 'NOTES_READ_FAILED',
    });
    return {};
  }
};

const writeAll = async (notes: MealNotes): Promise<void> => {
  try {
    const encrypted = await cryptoService.encrypt(notes);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch {
    logger.warn('[patientNotes] No se pudieron guardar las notas locales', {
      reason: 'NOTES_WRITE_FAILED',
    });
  }
};

export const patientNotesService = {
  /** Todas las notas, indexadas por comida. `{}` si no hay ninguna. */
  getAll: readAll,

  /** Nota de una comida. Cadena vacía si no existe. */
  get: async (mealId: string): Promise<string> => {
    const notes = await readAll();
    return notes[mealId] ?? '';
  },

  /** Guarda (o borra, si el texto queda vacío) la nota de una comida. */
  set: async (mealId: string, text: string): Promise<void> => {
    const notes = await readAll();
    const trimmed = text.trim();

    if (trimmed === '') delete notes[mealId];
    else notes[mealId] = trimmed;

    await writeAll(notes);
  },
};
