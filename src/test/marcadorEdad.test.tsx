/**
 * Marcador de edad biológica: las dos etiquetas no pueden pisarse.
 *
 * En el navegador (320–414px, las cuatro escalas de texto) «Ref» y «Tú» se
 * solapaban en cuanto las dos edades quedaban cerca —62/78, 78/87, 45/47,
 * 70/70, 9/12, 28/29, 110/118—, y «Ref» se salía de la pantalla con edades
 * altas. La primera corrección les dio un carril a cada una; eso lo resolvía por
 * construcción pero costaba ~23px de alto en una tarjeta que el médico pide
 * encoger. Ahora comparten carril y el choque se resuelve con los anchos reales
 * medidos: `calcularPosicionesEtiquetas` es pura, así que se puede agotar aquí
 * en vez de confiar en un barrido de navegador.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BiologicalAgeGauge, { calcularPosicionesEtiquetas } from '../components/BiologicalAgeGauge';

afterEach(cleanup);

describe('geometría de las etiquetas', () => {
    const BARRA = 350;
    const ANCHO_REF = 52;
    const ANCHO_TU = 46;
    /** Distancia mínima admisible entre centros, dados esos anchos. */
    const MINIMA = (ANCHO_REF + ANCHO_TU) / 2 + 6;

    const colocar = (pctRef: number, pctTu: number, barra = BARRA) =>
        calcularPosicionesEtiquetas(barra, pctRef, pctTu, ANCHO_REF, ANCHO_TU);

    const separacion = (p: { ref: number; tu: number }) => Math.abs(p.tu - p.ref);

    it('las deja donde tocan cuando ya están lo bastante lejos', () => {
        const p = colocar(10, 80);
        expect(p.ref).toBeCloseTo(35, 5);
        expect(p.tu).toBeCloseTo(280, 5);
        expect(p.apilado).toBe(false);
    });

    it.each([
        [60, 62], [40, 45], [50, 50], [10, 12], [88, 92], [0, 3], [97, 100],
    ])('con %i%% y %i%% las separa justo lo necesario, sin pasarse', (a, z) => {
        const p = colocar(a, z);
        expect(separacion(p)).toBeGreaterThanOrEqual(MINIMA - 0.01);
        expect(separacion(p)).toBeLessThanOrEqual(MINIMA + 0.01);
    });

    it('con las dos edades iguales no deja la separación indefinida', () => {
        const p = colocar(50, 50);
        expect(separacion(p)).toBeCloseTo(MINIMA, 5);
        // «Tú» a la derecha: la decisión es arbitraria pero tiene que ser estable.
        expect(p.tu).toBeGreaterThan(p.ref);
    });

    it('reparte el desplazamiento entre las dos, no empuja solo a una', () => {
        const p = colocar(50, 50);
        const centro = 175;
        expect(centro - p.ref).toBeCloseTo(p.tu - centro, 5);
    });

    describe('sin salirse de la barra', () => {
        const PARES: [number, number][] = [
            [0, 0], [0, 2], [100, 100], [98, 100], [100, 98], [0, 100],
            [50, 50], [95, 97], [3, 1], [66.66, 70],
        ];

        it.each(PARES)('con %f%% y %f%% ninguna asoma por los bordes', (a, z) => {
            const p = colocar(a, z);
            expect(p.ref - ANCHO_REF / 2).toBeGreaterThanOrEqual(-0.01);
            expect(p.ref + ANCHO_REF / 2).toBeLessThanOrEqual(BARRA + 0.01);
            expect(p.tu - ANCHO_TU / 2).toBeGreaterThanOrEqual(-0.01);
            expect(p.tu + ANCHO_TU / 2).toBeLessThanOrEqual(BARRA + 0.01);
        });

        it.each(PARES)('con %f%% y %f%% tampoco se tocan entre sí', (a, z) => {
            const p = colocar(a, z);
            expect(separacion(p)).toBeGreaterThanOrEqual(MINIMA - 0.01);
        });
    });

    it('sujetar contra un borde mueve a las dos, no solo a la que topa', () => {
        // Las dos al 100 %: separarlas empuja a «Tú» fuera, y el ajuste tiene que
        // arrastrar también a «Ref» hacia dentro.
        const p = colocar(100, 100);
        expect(p.tu + ANCHO_TU / 2).toBeCloseTo(BARRA, 5);
        expect(separacion(p)).toBeCloseTo(MINIMA, 5);
    });

    it('si no caben una al lado de otra, pide apilarlas', () => {
        const estrecha = ANCHO_REF + ANCHO_TU; // falta sitio para la separación
        expect(colocar(50, 52, estrecha).apilado).toBe(true);
        // Con un píxel más de los que hacen falta, ya caben.
        expect(colocar(50, 52, ANCHO_REF + ANCHO_TU + 7).apilado).toBe(false);
    });
});

const montar = (bio: number | string, cron: number | string) =>
    render(
        <BiologicalAgeGauge
            biologicalAge={bio}
            chronologicalAge={cron}
            completedItems={0}
            totalItems={0}
        />,
    );

/** La etiqueta posicionada, no la copia invisible que sirve para medir. */
const etiqueta = (texto: string) =>
    screen.getAllByText(texto).find((el) => !el.className.includes('invisible'))!;

describe('orden de las edades', () => {
    it('muestra la cronológica primero y la biológica después, más grande', () => {
        const { container } = montar(62, 87);
        const texto = container.textContent ?? '';
        expect(texto.indexOf('Cronológica')).toBeGreaterThanOrEqual(0);
        expect(texto.indexOf('Cronológica')).toBeLessThan(texto.indexOf('Biológica'));

        const cronologica = screen.getByText('87');
        const biologica = screen.getByText('62');
        // La biológica es la que el tratamiento mueve: tiene que dominar.
        expect(biologica.className).toContain('24px');
        expect(cronologica.className).not.toContain('24px');
    });

    it('ya no se presenta como «Edad Bio: 62 / 87 real»', () => {
        const { container } = montar(62, 87);
        expect(container.textContent).not.toContain('Edad Bio');
        expect(container.textContent).not.toContain('real');
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

    it('cada etiqueta tiene una copia invisible para medirla, y solo una', () => {
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
