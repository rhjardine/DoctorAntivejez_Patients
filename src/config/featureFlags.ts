/**
 * Feature flags — kill switch de IA generativa.
 *
 * Decisión D-17 del Informe de Gobernanza Pre-Beta: debe existir un
 * interruptor que desactive TODA la IA generativa sin necesidad de un
 * redeploy de código, para poder cortar en caso de incidente clínico.
 *
 * Uso operativo: fijar la variable a "off" (o "false"/"0") en el panel de
 * entorno del hosting y redesplegar la configuración. Ver docs/RUNBOOK.md.
 *
 * Por defecto las funciones están ACTIVAS: la ausencia de la variable no debe
 * tumbar la app. La desactivación es siempre un acto deliberado.
 */

const isDisabled = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === 'off' || normalized === 'false' || normalized === '0';
};

export const featureFlags = {
    /** VCoach — chat conversacional con modelo generativo. */
    vcoach: !isDisabled(import.meta.env.VITE_FEATURE_VCOACH),

    /** FoodScanner — análisis de imagen de alimentos con visión por IA. */
    foodScanner: !isDisabled(import.meta.env.VITE_FEATURE_FOODSCANNER),
};

/** True si alguna función de IA generativa está activa. */
export const isAnyAIEnabled = (): boolean =>
    featureFlags.vcoach || featureFlags.foodScanner;
