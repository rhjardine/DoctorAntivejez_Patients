#!/usr/bin/env node
/**
 * Guarda contra secretos reales en el bundle publicado.
 *
 * ## Por qué existe
 *
 * En una PWA **no se puede ocultar un secreto**. Todo lo que se declara como
 * `VITE_*` se compila literalmente dentro del JavaScript que se sirve al
 * navegador: cualquiera puede leerlo con "Ver código fuente". No hay ofuscación
 * que lo evite.
 *
 * Por eso este script no intenta esconder nada: impide que llegue a producción
 * un secreto que **nunca debió estar en el cliente** (una clave secreta de
 * Stripe, un token de servicio, una clave privada). Esos deben vivir en el
 * backend y no salir de ahí.
 *
 * Uso: `node scripts/check-secrets.mjs` tras `npm run build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

/**
 * Patrones de secretos que jamás deben aparecer en el cliente.
 * Se omiten deliberadamente los que SÍ son públicos por diseño:
 *   - `pk_live_` / `pk_test_` de Stripe (clave publicable)
 *   - el DSN de Sentry
 */
const FORBIDDEN = [
    { name: 'Clave secreta de Stripe', re: /\bsk_(live|test)_[A-Za-z0-9]{10,}/ },
    { name: 'Secreto de webhook de Stripe', re: /\bwhsec_[A-Za-z0-9]{10,}/ },
    { name: 'Clave de API de Google', re: /\bAIza[0-9A-Za-z_-]{30,}/ },
    { name: 'Clave de acceso de AWS', re: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'Token de OpenAI', re: /\bsk-[A-Za-z0-9]{20,}/ },
    { name: 'Token de GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
    { name: 'Clave privada PEM', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { name: 'service_role de Supabase', re: /"role"\s*:\s*"service_role"/ },
];

const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
        const p = join(dir, entry);
        return statSync(p).isDirectory() ? walk(p) : [p];
    });

let failed = false;

try {
    const files = walk(DIST).filter((f) => /\.(js|css|html|json|webmanifest|map)$/.test(f));

    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        for (const { name, re } of FORBIDDEN) {
            const hit = content.match(re);
            if (hit) {
                console.error(`✗ ${name} encontrado en ${file}`);
                console.error(`  coincidencia: ${hit[0].slice(0, 12)}…`);
                failed = true;
            }
        }
    }

    if (failed) {
        console.error(
            '\nUn secreto no puede vivir en el cliente: el bundle es público.\n' +
            'Muévelo al backend y expón solo lo que sea seguro publicar.',
        );
        process.exit(1);
    }

    console.log(`✓ Sin secretos prohibidos en ${files.length} archivos de ${DIST}/`);
} catch (error) {
    console.error(`No se pudo analizar ${DIST}/:`, error.message);
    process.exit(1);
}
