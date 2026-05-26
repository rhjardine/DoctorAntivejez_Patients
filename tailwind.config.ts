import type { Config } from 'tailwindcss'

/**
 * Vytalix Dual-Theme Design System (H30)
 * 
 * Longevidad Orgánica (Patients): sand, terracotta, sage, graphite.
 * Precisión Clínica (Doctors): bg, navy, cyan, slate.
 */

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // App legacy defaults (Hardened)
                darkBlue: "#293B64",
                primary: "#23BCEF",



                // Precisión Clínica (Scientific & Corporate)
                clinical: {
                    bg: '#F8FAFC',
                    navy: '#0F172A',
                    cyan: '#06B6D4',
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
