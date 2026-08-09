/**
 * Limpieza de almacenamiento con alcance de paciente.
 *
 * El proyecto acumuló tres generaciones de claves por sucesivos cambios de
 * marca (`rejuvenate_*` → `vytalix-*`/`vx_*` → `da_*`). El `logout` las
 * enumeraba a mano, así que cada generación nueva se olvidaba: `da_pending_leads`
 * —que guarda nombre y correo de leads en texto plano— sobrevivía al cierre de
 * sesión. En un dispositivo compartido, el PII de un paciente quedaba al alcance
 * del siguiente.
 *
 * Barrer por prefijo en vez de por lista evita que el problema se repita cuando
 * se añadan claves nuevas.
 */

/** Prefijos de las tres generaciones de marca. Todo lo que empiece así es del paciente. */
const PATIENT_SCOPED_PREFIXES = [
    'rejuvenate_', // Gen 1 — "Rejuvenate"
    'vytalix',     // Gen 2 — "Vytalix" (vytalix-funnel-v2)
    'vx_',         // Gen 2 — abreviatura
    'da_',         // Gen 3 — "Doctor Antivejez"
];

/** Claves de paciente que no siguen ninguna convención de prefijo. */
const PATIENT_SCOPED_KEYS = [
    'auth-storage',
    'profile-storage',
    'refresh_token',
    'auth_token',
    'notifications_enabled',
];

/**
 * Claves que SOBREVIVEN al logout deliberadamente: preferencias de interfaz
 * (tema, idioma). No contienen PII y reiniciarlas degradaría la experiencia
 * sin ganancia de privacidad.
 */
const PRESERVED_KEYS = ['ui-storage'];

const isPatientScoped = (key: string): boolean => {
    if (PRESERVED_KEYS.includes(key)) return false;
    if (PATIENT_SCOPED_KEYS.includes(key)) return true;
    return PATIENT_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix));
};

/**
 * Elimina de localStorage todo dato con alcance de paciente y vacía
 * sessionStorage por completo. Idempotente y segura ante storage no disponible.
 *
 * @returns número de claves eliminadas de localStorage (útil para auditoría).
 */
export const clearPatientScopedStorage = (): number => {
    let removed = 0;

    try {
        // Recolectar primero: mutar localStorage mientras se itera por índice
        // desplaza las claves y deja entradas sin borrar.
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && isPatientScoped(key)) toRemove.push(key);
        }

        toRemove.forEach((key) => {
            localStorage.removeItem(key);
            removed += 1;
        });
    } catch {
        // localStorage no disponible (modo privado, cuota). No propagar:
        // el logout debe completarse igualmente.
    }

    try {
        sessionStorage.clear();
    } catch {
        // idem
    }

    return removed;
};
