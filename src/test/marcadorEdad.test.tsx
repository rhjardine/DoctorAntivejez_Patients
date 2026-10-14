/**
 * Marcador de edad biológica: las dos etiquetas no pueden pisarse.
 *
 * En el navegador (320–414px, las cuatro escalas de texto) «Ref» y «Tú» se
 * solapaban en cuanto las dos edades quedaban cerca —62/78, 78/87, 45/47,
 * 70/70, 9/12, 28/29, 110/118—, y «Ref» se salía de la pantalla con edades
 * altas. El arreglo no afina un margen: pone cada etiqueta en su propio carril
 * y recorta su posición en píxeles. Estas pruebas fijan esa estructura, que es
 * lo único que jsdom puede comprobar (no mide cajas), para que un refactor no
 * vuelva a juntarlas en una misma banda.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BiologicalAgeGauge from '../components/BiologicalAgeGauge';

afterEach(cleanup);

const montar = (bio: number | string, cron: number | string) =>
    render(
        <BiologicalAgeGauge
            biologicalAge={bio}
            chronologicalAge={cron}
            completedItems={0}
            totalItems={0}
        />,
    );

/** La etiqueta posicionada, no la copia invisible que reserva la altura. */
const etiqueta = (texto: string) =>
    screen.getAllByText(texto).find((el) => !el.className.includes('invisible'))!;

describe('carriles de las etiquetas', () => {
    const PARES: [number, number][] = [
        [62, 87], [78, 87], [62, 78], [45, 47], [70, 70], [9, 12], [110, 118], [28, 29],
    ];

    it.each(PARES)('con bio=%i y ref=%i cada etiqueta vive en su propio carril', (bio, cron) => {
        montar(bio, cron);
        const tu = etiqueta(`Tú ${bio}`);
        const ref = etiqueta(`Ref ${cron}`);
        expect(tu.parentElement).not.toBe(ref.parentElement);
        // Y ninguna envuelve a la otra: carriles hermanos, no anidados.
        expect(tu.parentElement!.contains(ref)).toBe(false);
        expect(ref.parentElement!.contains(tu)).toBe(false);
    });

    it('el carril reserva su altura con una copia invisible y accesiblemente oculta', () => {
        montar(62, 87);
        const copias = screen.getAllByText('Tú 62').filter((el) => el.className.includes('invisible'));
        expect(copias).toHaveLength(1);
        expect(copias[0].getAttribute('aria-hidden')).toBe('true');
    });

    it('el lector de pantalla oye cada edad una sola vez', () => {
        montar(62, 87);
        const visibles = screen
            .getAllByText('Ref 87')
            .filter((el) => el.getAttribute('aria-hidden') !== 'true');
        expect(visibles).toHaveLength(1);
    });
});

describe('posición de las etiquetas', () => {
    it('se centran sobre su posición mientras no haya medidas del navegador', () => {
        montar(62, 87);
        // 62 → 60.30% y 87 → 77.99% sobre la escala de septenios.
        expect(etiqueta('Tú 62').getAttribute('style')).toContain('left: 60.3');
        expect(etiqueta('Ref 87').getAttribute('style')).toContain('left: 77.99');
        expect(etiqueta('Tú 62').getAttribute('style')).toContain('translateX(-50%)');
    });

    it('una edad fuera del rango se ancla al extremo, no más allá', () => {
        montar(5, 130);
        expect(etiqueta('Tú 5').getAttribute('style')).toContain('left: 0%');
        expect(etiqueta('Ref 130').getAttribute('style')).toContain('left: 100%');
    });
});

describe('datos ausentes', () => {
    it('sin edad biológica no dibuja su etiqueta ni inventa un cero', () => {
        montar('--', 87);
        expect(screen.queryByText(/^Tú /)).toBeNull();
        expect(etiqueta('Ref 87')).toBeTruthy();
    });

    it('sin ninguna de las dos edades la barra queda sin etiquetas', () => {
        montar('--', '--');
        expect(screen.queryByText(/^Tú /)).toBeNull();
        expect(screen.queryByText(/^Ref /)).toBeNull();
    });
});
