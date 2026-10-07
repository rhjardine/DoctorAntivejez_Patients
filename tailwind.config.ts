import type { Config } from 'tailwindcss'

/**
 * Sistema de color — Doctor Antivejez
 *
 * Dos colores corporativos, tomados del manual de marca:
 *   navy  #293B64  (Pantone P 108-16 C)
 *   cyan  #23BCEF  (Pantone P 115-6 C)
 *
 * Regla de uso, derivada de medir contraste WCAG y no de preferencia:
 *
 *   navy     11.03:1 sobre blanco  → texto y titulares en fondos claros
 *   cyan      5.00:1 sobre navy    → superficies, degradados, iconos y acentos
 *                                     sobre fondo oscuro. AA cumplido.
 *   cyan      2.21:1 sobre blanco  → NO USAR para texto en fondos claros
 *   cyanInk   4.65:1 sobre blanco  → mismo tono (H=197) oscurecido hasta AA.
 *                                     Es la variante para enlaces y texto cian
 *                                     sobre blanco.
 *
 * El turquesa #14B8A6 que ocupaba estos usos venía de la paleta "Longevidad
 * Orgánica" de una etapa anterior y no pertenece a la marca.
 */

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Alias históricos, mantenidos: los usa medio código base.
                darkBlue: "#293B64",
                primary: "#23BCEF",

                // Paleta corporativa canónica.
                brand: {
                    navy: '#293B64',
                    cyan: '#23BCEF',
                    /** Cian legible como texto sobre fondos claros (AA 4.65:1). */
                    cyanInk: '#107DA8',
                },

                // Superficies y texto neutro.
                clinical: {
                    bg: '#F8FAFC',
                    navy: '#0F172A',
                    cyan: '#23BCEF', // antes #06B6D4 — un tercer cian fuera de marca
                    slate: '#475569',
                },
            },
            /**
             * Escala tipográfica gobernada por `--escala-texto`.
             *
             * El paciente la elige en Configuración: quien ve poco agranda la
             * letra sin depender de nadie y quien ve bien la deja compacta. Con
             * la variable en 1 —el valor por defecto— los tamaños son los
             * mismos de siempre; las alturas de línea van sin unidad para que
             * crezcan en la misma proporción y el texto no se solape.
             */
            fontSize: {
                'xs':   ['calc(0.75rem*var(--escala-texto,1))',  { lineHeight: '1.333' }],
                'sm':   ['calc(0.875rem*var(--escala-texto,1))', { lineHeight: '1.429' }],
                'base': ['calc(1rem*var(--escala-texto,1))',     { lineHeight: '1.5' }],
                'lg':   ['calc(1.125rem*var(--escala-texto,1))', { lineHeight: '1.556' }],
                'xl':   ['calc(1.25rem*var(--escala-texto,1))',  { lineHeight: '1.4' }],
                '2xl':  ['calc(1.5rem*var(--escala-texto,1))',   { lineHeight: '1.333' }],
                '3xl':  ['calc(1.875rem*var(--escala-texto,1))', { lineHeight: '1.2' }],
                '4xl':  ['calc(2.25rem*var(--escala-texto,1))',  { lineHeight: '1.111' }],
                '5xl':  ['calc(3rem*var(--escala-texto,1))',     { lineHeight: '1' }],
                '6xl':  ['calc(3.75rem*var(--escala-texto,1))',  { lineHeight: '1' }],
                '7xl':  ['calc(4.5rem*var(--escala-texto,1))',   { lineHeight: '1' }],
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
