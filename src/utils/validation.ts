/**
 * Validación de entradas del paciente.
 *
 * ## Qué es y qué no es
 *
 * Esto es **integridad de datos y defensa en profundidad, no una barrera de
 * seguridad**. Cualquiera puede saltarse una validación de cliente con las
 * herramientas del navegador: **el servidor debe validar igual**, y estas reglas
 * están escritas para poder replicarse allí sin ambigüedad.
 *
 * No se "sanea" HTML: React escapa el texto por defecto y el proyecto no usa
 * `dangerouslySetInnerHTML` en ninguna parte (verificado). Añadir un saneador
 * propio daría una falsa sensación de seguridad sin resolver nada.
 *
 * Lo que sí aportan estas reglas:
 *  - Acotar la longitud, para que un campo libre no genere payloads enormes.
 *  - Rechazar caracteres de control, que corrompen registros clínicos.
 *  - Dar al paciente un mensaje concreto en lugar de un fallo del servidor.
 */

export type Invalid = { ok: false; error: string };
export type Valid = { ok: true; value: string };
export type ValidationResult = Valid | Invalid;

/**
 * Type guard explícito.
 *
 * `if (!r.ok)` bastaría con `strict: true`, pero este tsconfig lo tiene
 * desactivado y TypeScript no estrecha uniones discriminadas sin él. Con el
 * guard el código es correcto en ambos modos, y seguirá siéndolo cuando se
 * active `strict`.
 */
export const isInvalid = (r: ValidationResult): r is Invalid => r.ok === false;

const ok = (value: string): ValidationResult => ({ ok: true, value });
const fail = (error: string): ValidationResult => ({ ok: false, error });

/** Caracteres de control (excepto salto de línea y tabulador). */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export const LIMITS = {
  documentId: { min: 5, max: 20 },
  name: { min: 2, max: 80 },
  email: { max: 120 },
  phone: { min: 7, max: 20 },
  freeText: { max: 500 },
} as const;

/**
 * Documento de identidad (cédula). Se aceptan dígitos y separadores comunes
 * —puntos, guiones, espacios y un prefijo de letra tipo "V-"— porque los
 * pacientes los escriben de formas distintas; se normaliza a solo dígitos.
 */
export const validateDocumentId = (raw: string): ValidationResult => {
  const trimmed = raw.trim();
  if (!trimmed) return fail('Ingresa tu número de documento.');

  const digits = trimmed.replace(/[.\-\s]/g, '').replace(/^[A-Za-z]/, '');
  if (!/^\d+$/.test(digits)) {
    return fail('El documento solo puede contener números.');
  }
  if (digits.length < LIMITS.documentId.min) {
    return fail(`El documento debe tener al menos ${LIMITS.documentId.min} dígitos.`);
  }
  if (digits.length > LIMITS.documentId.max) {
    return fail('El documento es demasiado largo.');
  }
  return ok(digits);
};

/**
 * Correo electrónico.
 *
 * Deliberadamente permisiva: la única forma fiable de validar un correo es
 * enviarle un mensaje. Se descartan errores evidentes (sin arroba, sin dominio,
 * con espacios) y se deja pasar el resto en lugar de rechazar direcciones
 * válidas poco frecuentes con una expresión regular «estricta».
 */
export const validateEmail = (raw: string): ValidationResult => {
  const trimmed = raw.trim();
  if (!trimmed) return fail('Ingresa tu correo electrónico.');
  if (trimmed.length > LIMITS.email.max) return fail('El correo es demasiado largo.');
  if (/\s/.test(trimmed)) return fail('El correo no puede contener espacios.');
  if (!/^[^@]+@[^@]+\.[^@]{2,}$/.test(trimmed)) {
    return fail('Revisa tu correo: parece incompleto.');
  }
  return ok(trimmed.toLowerCase());
};

/** Nombre de persona. Admite acentos, apóstrofos y guiones. */
export const validatePersonName = (raw: string): ValidationResult => {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return fail('Ingresa tu nombre.');
  if (trimmed.length < LIMITS.name.min) return fail('El nombre es demasiado corto.');
  if (trimmed.length > LIMITS.name.max) return fail('El nombre es demasiado largo.');
  if (!/^[\p{L}\p{M}'\-. ]+$/u.test(trimmed)) {
    return fail('El nombre solo puede contener letras.');
  }
  return ok(trimmed);
};

/** Teléfono. Se conserva el prefijo internacional y se normalizan separadores. */
export const validatePhone = (raw: string): ValidationResult => {
  const trimmed = raw.trim();
  if (!trimmed) return fail('Ingresa tu número de teléfono.');

  const normalized = trimmed.replace(/[()\-.\s]/g, '');
  if (!/^\+?\d+$/.test(normalized)) {
    return fail('El teléfono solo puede contener números.');
  }
  const digits = normalized.replace(/^\+/, '');
  if (digits.length < LIMITS.phone.min) return fail('El teléfono es demasiado corto.');
  if (digits.length > LIMITS.phone.max) return fail('El teléfono es demasiado largo.');
  return ok(normalized);
};

/**
 * Texto libre del paciente (notas, diario).
 *
 * No se recorta el contenido: si excede el límite se avisa, en lugar de truncar
 * en silencio lo que el paciente escribió sobre su salud.
 */
export const validateFreeText = (
  raw: string,
  maxLength: number = LIMITS.freeText.max,
): ValidationResult => {
  const trimmed = raw.trim();
  if (CONTROL_CHARS.test(trimmed)) {
    return fail('El texto contiene caracteres no admitidos.');
  }
  if (trimmed.length > maxLength) {
    return fail(`El texto supera el máximo de ${maxLength} caracteres.`);
  }
  return ok(trimmed);
};

/**
 * Ejecuta varias validaciones y devuelve el primer error.
 * Útil para formularios: se valida todo y se informa de un fallo a la vez.
 */
export const firstError = (...results: ValidationResult[]): string | null => {
  for (const r of results) if (isInvalid(r)) return r.error;
  return null;
};
