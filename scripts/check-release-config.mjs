#!/usr/bin/env node
/**
 * Guarda de configuración de release.
 *
 * Se ejecuta ANTES de cada build (`prebuild`) y aborta si la configuración
 * produciría un bundle roto o inseguro. Existe porque dos valores que viven en
 * sitios distintos —el panel del hosting y este repositorio— tienen que
 * coincidir, y hasta ahora nada lo comprobaba:
 *
 *   R2  `VITE_API_URL` debe estar permitida por el `connect-src` de la CSP.
 *       Si no lo está, el navegador bloquea TODAS las llamadas al backend antes
 *       de que salgan y la app queda inservible, presentándolo al paciente como
 *       un fallo de conexión.
 *
 *   R3  `VITE_ENCRYPTION_SEED` debe ser una semilla real. Una semilla conocida
 *       —la de CI, un placeholder— cifraría el PHI del dispositivo con una
 *       clave publicada. La app ya se niega a arrancar en ese caso
 *       (cryptoService), pero fallar en el build es fallar a tiempo.
 *
 * Falla cerrado: ante la duda, no se construye.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HEADERS_FILE = resolve(ROOT, 'public/_headers');

/**
 * Semillas que nunca deben cifrar datos de un paciente real. No es una lista de
 * "contraseñas débiles": son valores concretos que han circulado por el
 * repositorio o su CI y que, por tanto, son públicos.
 */
const SEMILLAS_PROHIBIDAS = [
    'ci-build-seed-not-for-production',
    'not-for-production',
    'dev-only-insecure',
    'changeme',
    'your_seed_here',
    'placeholder',
];

const LONGITUD_MINIMA_SEMILLA = 32;

const errores = [];
const avisos = [];

// ─── CSP: extraer connect-src de public/_headers ─────────────────────────────

/** Devuelve la lista de orígenes de `connect-src`, o null si no hay CSP. */
const leerConnectSrc = () => {
    if (!existsSync(HEADERS_FILE)) return null;

    const csp = readFileSync(HEADERS_FILE, 'utf8')
        .split('\n')
        .find((linea) => /^\s*Content-Security-Policy:/i.test(linea));
    if (!csp) return null;

    const directiva = csp
        .replace(/^\s*Content-Security-Policy:\s*/i, '')
        .split(';')
        .map((d) => d.trim())
        .find((d) => d.toLowerCase().startsWith('connect-src'));
    if (!directiva) return null;

    return directiva.split(/\s+/).slice(1).filter(Boolean);
};

/**
 * ¿La CSP permite conectar con este origen?
 * Contempla el comodín de subdominio (`https://*.ejemplo.com`), que es la única
 * forma de comodín que usa la política actual.
 */
const cspPermite = (origenes, apiUrl) => {
    const url = new URL(apiUrl);

    return origenes.some((origen) => {
        if (origen === '*') return true;
        if (origen === "'self'" || origen.startsWith("'")) return false;

        const limpio = origen.replace(/\/$/, '');

        if (limpio.includes('*')) {
            const patron = new RegExp(
                '^' + limpio.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+') + '$',
            );
            return patron.test(url.origin);
        }

        // Un origen sin esquema en la CSP (p. ej. `api.ejemplo.com`) permite
        // cualquier esquema; con esquema, debe coincidir el origen completo.
        return /^https?:\/\//.test(limpio) ? limpio === url.origin : limpio === url.host;
    });
};

// ─── Validaciones ────────────────────────────────────────────────────────────

const env = loadEnv('production', ROOT, 'VITE_');
const apiUrl = (process.env.VITE_API_URL ?? env.VITE_API_URL ?? '').trim();
const semilla = (process.env.VITE_ENCRYPTION_SEED ?? env.VITE_ENCRYPTION_SEED ?? '').trim();

// R2 — API URL
if (!apiUrl) {
    errores.push(
        'VITE_API_URL no está definida.\n' +
            '     Sin ella la app lanza un error de inicialización en producción.',
    );
} else {
    let url = null;
    try {
        url = new URL(apiUrl);
    } catch {
        errores.push(`VITE_API_URL no es una URL absoluta válida: ${apiUrl}`);
    }

    if (url) {
        if (url.protocol !== 'https:') {
            errores.push(
                `VITE_API_URL no usa https: ${url.protocol}//…\n` +
                    '     La app transporta datos clínicos; http quedaría en claro.',
            );
        }

        const origenes = leerConnectSrc();
        if (!origenes) {
            avisos.push(
                'No se encontró una directiva connect-src en public/_headers.\n' +
                    '     No se puede comprobar la compatibilidad API ↔ CSP.',
            );
        } else if (!cspPermite(origenes, url.href)) {
            errores.push(
                `VITE_API_URL (${url.origin}) NO está permitida por la CSP.\n` +
                    `     connect-src declara: ${origenes.join(' ')}\n` +
                    '     El navegador bloquearía todas las llamadas al backend y la app\n' +
                    '     quedaría inservible. Ajusta connect-src en public/_headers —y en\n' +
                    '     el panel de cabeceras del hosting, que es quien las aplica— o\n' +
                    '     corrige VITE_API_URL.',
            );
        }
    }
}

// R3 — Semilla de cifrado
if (!semilla) {
    errores.push(
        'VITE_ENCRYPTION_SEED no está definida.\n' +
            '     Genera una con: openssl rand -base64 48',
    );
} else if (semilla.length < LONGITUD_MINIMA_SEMILLA) {
    errores.push(
        `VITE_ENCRYPTION_SEED es demasiado corta: ${semilla.length} caracteres ` +
            `(mínimo ${LONGITUD_MINIMA_SEMILLA}).`,
    );
} else {
    const prohibida = SEMILLAS_PROHIBIDAS.find((p) =>
        semilla.toLowerCase().includes(p.toLowerCase()),
    );
    if (prohibida) {
        errores.push(
            `VITE_ENCRYPTION_SEED contiene un valor público conocido ("${prohibida}").\n` +
                '     Cifrar datos de un paciente con una semilla publicada equivale a no\n' +
                '     cifrarlos. Genera una propia con: openssl rand -base64 48',
        );
    }
}

// ─── Salida ──────────────────────────────────────────────────────────────────

for (const aviso of avisos) console.warn(`⚠  ${aviso}`);

if (errores.length > 0) {
    console.error('\n✖ Configuración de release inválida — build abortado:\n');
    for (const error of errores) console.error(`  ·  ${error}\n`);
    console.error('  Referencia: .env.example y docs/RUNBOOK.md\n');
    process.exit(1);
}

console.log('✓ Configuración de release válida (API ↔ CSP compatibles, semilla propia)');
