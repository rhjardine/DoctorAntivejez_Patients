import { describe, it, expect } from 'vitest';

/**
 * D-17 — Kill switch de IA generativa.
 *
 * Debe existir un interruptor capaz de desactivar toda la IA sin redeploy de
 * código, para poder cortar ante un incidente clínico. Estos tests fijan la
 * semántica del parseo: qué valores desactivan y cuáles no.
 *
 * Se prueba el predicado directamente porque `import.meta.env` se resuelve en
 * tiempo de build y no puede mutarse de forma fiable en el runner.
 */

const isDisabled = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === 'off' || normalized === 'false' || normalized === '0';
};

describe('featureFlags — semántica del kill switch', () => {
    it.each(['off', 'OFF', 'false', 'FALSE', '0', '  off  '])(
        'desactiva con %j',
        (value) => {
            expect(isDisabled(value)).toBe(true);
        },
    );

    it.each(['on', 'true', '1', '', 'yes'])(
        'NO desactiva con %j',
        (value) => {
            expect(isDisabled(value)).toBe(false);
        },
    );

    it('no desactiva cuando la variable no está definida', () => {
        // Ausencia de configuración nunca debe tumbar una función:
        // desactivar es siempre un acto deliberado.
        expect(isDisabled(undefined)).toBe(false);
    });
});
