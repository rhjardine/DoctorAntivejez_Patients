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

/**
 * Prefijo de la clave. La clave real incluye el id del paciente.
 *
 * ⚠️ AISLAMIENTO ENTRE PACIENTES. Antes era una única clave global
 * (`da_meal_notes_v1`) y la protección dependía por completo de que el paciente
 * pulsara «cerrar sesión». La clave AES se deriva de la semilla + la huella del
 * DISPOSITIVO, sin componente de paciente, así que en una tablet compartida:
 *
 *   A escribe una nota → A cierra la app sin hacer logout → B inicia sesión
 *   → B lee la nota de A.
 *
 * `authService.clearSession()`, que sí corre en cada login, no tocaba esa clave.
 * Ahora cada paciente tiene su propio espacio y, además, el contenido lleva
 * dentro el paciente al que pertenece (ver `readAll`).
 */
const STORAGE_PREFIX = 'da_meal_notes_v1_';
const SESSION_KEY = 'rejuvenate_session_v1';

export type MealNotes = Record<string, string>;

/** Sobre cifrado: las notas van acompañadas del paciente que las escribió. */
interface NotesEnvelope {
  patientId: string;
  notes: MealNotes;
}

/**
 * Id del paciente con sesión abierta.
 *
 * Se lee directamente de localStorage para no importar authService: eso
 * formaría el ciclo authService → ProtocolService → … → patientNotesService.
 */
const currentPatientId = (): string => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return '';
    return String(JSON.parse(raw)?.id ?? '');
  } catch {
    return '';
  }
};

const storageKeyFor = (patientId: string): string => STORAGE_PREFIX + patientId;

const readAll = async (): Promise<MealNotes> => {
  const patientId = currentPatientId();
  if (!patientId) return {}; // sin sesión no hay notas que mostrar

  const key = storageKeyFor(patientId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw.trim() === '') return {};

    // Restos de una versión anterior sin cifrar, o valor corrupto: descartar en
    // vez de intentar interpretarlo.
    if (raw.startsWith('{') || !raw.includes(':')) {
      localStorage.removeItem(key);
      return {};
    }

    const decrypted = await cryptoService.decrypt(raw);
    const envelope = decrypted as NotesEnvelope | null;

    // Segunda barrera, independiente del nombre de la clave: aunque alguien
    // moviera o renombrara el contenido, solo se devuelve si pertenece al
    // paciente que tiene la sesión abierta.
    if (
      envelope &&
      typeof envelope === 'object' &&
      envelope.patientId === patientId &&
      envelope.notes &&
      typeof envelope.notes === 'object'
    ) {
      return envelope.notes;
    }

    localStorage.removeItem(key);
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
  const patientId = currentPatientId();
  if (!patientId) return; // sin sesión no se escribe nada

  try {
    const envelope: NotesEnvelope = { patientId, notes };
    const encrypted = await cryptoService.encrypt(envelope);
    localStorage.setItem(storageKeyFor(patientId), encrypted);
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
