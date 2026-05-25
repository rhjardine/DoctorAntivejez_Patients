/**
 * Sanitized Logger — PHI-Safe Logging Utility
 * 
 * Ensures NO Protected Health Information (Age, BloodType, ID, Name, Email)
 * is ever stored in external logs or console output.
 */

const PHI_FIELDS = [
    'biologicalAge',
    'chronologicalAge',
    'bloodType',
    'email',       // S-04 fix: email is PHI
    'name',
    'firstName',
    'lastName',
    'identification',
    'id',
    'token',
    'password',
    'refreshToken',
    'alimentacion',
    'diet',
    'nutritionPlan',
    'protocol',
];

/**
 * Recursively removes PHI fields from an object before logging.
 */
const sanitizePHI = (data: unknown): unknown => {
    if (data === null || data === undefined) return undefined;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(sanitizePHI);
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (PHI_FIELDS.includes(key)) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizePHI(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

export const logger = {
    info: (msg: string, context?: unknown) => {
        if (import.meta.env.DEV) {
            console.log(`[INFO] ${msg}`, context ? sanitizePHI(context) : '');
        }
    },

    warn: (msg: string, context?: unknown) => {
        console.warn(`[WARN] ${msg}`, context ? sanitizePHI(context) : '');
    },

    error: (msg: string, context?: unknown) => {
        try {
            console.error(`[ERROR] ${msg}`, context ? sanitizePHI(context) : '');
        } catch (err) {
            console.error(`[ERROR] ${msg}`, '[REDACTED: PHI SANITIZATION FAILED]');
        }
    },

    /** Log an event that is safe to send to external services (no PHI).
     *  Auth events (login_*, logout) are always emitted — even in production.
     *  Other audit events are DEV-only to avoid noise. */
    audit: (action: string, metadata?: Record<string, string | number | boolean>) => {
        const isAuthEvent = action.startsWith('auth_') || action === 'login_success' || action === 'logout' || action === 'token_refreshed';
        if (import.meta.env.DEV || isAuthEvent) {
            console.log(`[AUDIT] ${action}`, metadata || '');
        }
    },
};

export { sanitizePHI };
