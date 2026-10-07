import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { ESCALAS_TEXTO } from '../types';

/**
 * Lleva la escala de texto que eligió el paciente al documento.
 *
 * Todos los tamaños tipográficos de la app se declaran como
 * `calc(<base>*var(--escala-texto,1))`, así que basta con fijar esa variable
 * en `<html>` para que la interfaz entera crezca o se compacte a la vez, sin
 * tocar márgenes ni rellenos: cambia la letra, no la maquetación.
 *
 * El valor por defecto es 1, de modo que si la preferencia no está guardada
 * —paciente nuevo, almacenamiento bloqueado— la app se ve exactamente igual
 * que antes de existir esta opción.
 */
export const useEscalaTexto = (): void => {
    const escala = useUIStore((s) => s.userPreferences.escalaTexto) ?? 'normal';

    useEffect(() => {
        const factor = ESCALAS_TEXTO[escala] ?? 1;
        document.documentElement.style.setProperty('--escala-texto', String(factor));
    }, [escala]);
};
