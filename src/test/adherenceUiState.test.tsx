import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { AdherenceResult } from '../services/protocolService';

/**
 * P1 — Estado de UI de la adherencia.
 *
 * Complementa los tests de servicio: comprueba la REGLA DE PRESENTACIÓN, que es
 * donde vivía el defecto. La marca solo puede quedar puesta si el backend
 * confirmó; en cualquier otro caso el paciente debe enterarse.
 *
 * Se reproduce la lógica de PatientGuidePage en un componente mínimo para poder
 * probarla sin arrastrar routers, stores ni animaciones —que no son lo que se
 * está verificando— manteniendo el mismo contrato (`AdherenceResult`).
 */

const AVISO_FALLO =
    'No pudimos registrar este cambio. Tu médico no lo verá todavía — por favor coméntaselo en tu próxima consulta.';
const AVISO_PENDIENTE =
    'Sin conexión: guardamos tu cambio y lo enviaremos automáticamente cuando vuelvas a tener red. Todavía no está registrado.';

const GuiaMinima: React.FC<{
    onUpdate: () => Promise<AdherenceResult>;
}> = ({ onUpdate }) => {
    const [status, setStatus] = React.useState<'pending' | 'completed'>('pending');
    const [syncError, setSyncError] = React.useState<string | null>(null);

    const toggle = async () => {
        const previous = status;
        const next = previous === 'completed' ? 'pending' : 'completed';
        setStatus(next); // actualización optimista
        setSyncError(null);

        const result = await onUpdate();

        if (result === 'failed') {
            setStatus(previous); // revertir: nunca dejar una marca no registrada
            setSyncError(AVISO_FALLO);
        } else if (result === 'pending') {
            setSyncError(AVISO_PENDIENTE);
        }
    };

    return (
        <div>
            <button onClick={toggle}>Marcar</button>
            <span data-testid="estado">{status}</span>
            {syncError && <p role="alert">{syncError}</p>}
        </div>
    );
};

const marcarCon = async (result: AdherenceResult) => {
    const onUpdate = vi.fn().mockResolvedValue(result);
    render(<GuiaMinima onUpdate={onUpdate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Marcar' }));
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => document.body.replaceChildren());

describe('estado de UI de la adherencia', () => {
    it("'confirmed' → la marca queda puesta y no se avisa de nada", async () => {
        await marcarCon('confirmed');

        expect(screen.getByTestId('estado')).toHaveTextContent('completed');
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it("'failed' → se revierte la marca y se informa al paciente", async () => {
        await marcarCon('failed');

        await waitFor(() =>
            expect(screen.getByTestId('estado')).toHaveTextContent('pending'),
        );
        expect(screen.getByRole('alert')).toHaveTextContent(/No pudimos registrar/i);
    });

    it("'pending' → se conserva la marca pero se dice que NO está registrado", async () => {
        await marcarCon('pending');

        expect(screen.getByTestId('estado')).toHaveTextContent('completed');
        const aviso = screen.getByRole('alert');
        expect(aviso).toHaveTextContent(/Todavía no está registrado/i);
    });

    it('ningún resultado distinto de confirmed queda sin avisar', async () => {
        for (const resultado of ['failed', 'pending'] as AdherenceResult[]) {
            await marcarCon(resultado);
            expect(screen.getByRole('alert')).toBeTruthy();
            document.body.replaceChildren();
        }
    });
});
