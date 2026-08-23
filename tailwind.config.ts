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
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
