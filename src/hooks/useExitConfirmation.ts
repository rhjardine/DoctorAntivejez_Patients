import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseExitConfirmationOptions {
    hasProgress: boolean; // si hay datos guardados que se perderían
    exitTo: string;       // ruta destino al salir
    message?: string;     // texto del modal de confirmación
}

export function useExitConfirmation({ hasProgress, exitTo, message }: UseExitConfirmationOptions) {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleBack = useCallback(() => {
        if (hasProgress) {
            setShowConfirm(true);
        } else {
            navigate(exitTo);
        }
    }, [hasProgress, exitTo, navigate]);

    const confirmExit = useCallback(() => {
        // Limpiar sessionStorage del funnel al salir voluntariamente
        sessionStorage.removeItem('da_test_progress');
        sessionStorage.removeItem('da_agebot_result');
        setShowConfirm(false);
        navigate(exitTo);
    }, [exitTo, navigate]);

    const cancelExit = useCallback(() => setShowConfirm(false), []);

    return { handleBack, showConfirm, confirmExit, cancelExit };
}
