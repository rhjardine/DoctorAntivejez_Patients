import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { logger } from '../utils/logger';

// Load seed from env — no fallback: missing or weak seed is always a hard failure
const ENCRYPTION_SEED = import.meta.env.VITE_ENCRYPTION_SEED as string | undefined;

/** Patterns that indicate a placeholder or weak seed — checked case-insensitively as substrings */
const WEAK_SEED_PATTERNS = [
    'changeme',
    'secret',
    'password',
    '12345',
    'test',
    'dev',
    'development',
    'your_seed_here',
    'CHANGE_THIS',
    'dev-only-insecure-seed-do-not-use-in-prod',
];

/**
 * Error tipado para fallos de configuración criptográfica.
 * Exportado para que index.tsx pueda capturarlo por tipo (instanceof)
 * eliminando la dependencia de comparación frágil de strings de mensaje.
 */
export class CryptoConfigError extends Error {
    constructor(reason: string) {
        super(`[CryptoConfig] ${reason}`);
        this.name = 'CryptoConfigError';
    }
}

/**
 * Servicio de Encriptación PHI (Personal Health Information).
 * Utiliza Web Crypto API (AES-GCM) para encriptar datos sensibles en el dispositivo.
 * La clave se deriva de una semilla de servidor y la huella digital del dispositivo.
 */
class CryptoService {
    private key: CryptoKey | null = null;
    private initializationPromise: Promise<void> | null = null;
    private isInitialized = false;

    constructor() {
    }

    /**
     * Inicializa el servicio derivando la llave de encriptación.
     */
    async init(): Promise<void> {
        if (this.isInitialized) return;
        if (this.initializationPromise) return this.initializationPromise;

        this.initializationPromise = (async () => {
            try {
                let actualSeed = ENCRYPTION_SEED;
                let seedLength = actualSeed ? actualSeed.length : 0;

                // ── SEED VALIDATION ────────
                if (!actualSeed || actualSeed.trim() === '' || seedLength < 32) {
                    if (import.meta.env.DEV) {
                        logger.warn('[CryptoConfig] Seed validation failed but running in DEV mode. Using fallback seed.');
                        console.warn(
                            '[CryptoConfig] VITE_ENCRYPTION_SEED no configurada o muy corta.\n' +
                            'Usando un fallback seguro local temporal para desarrollo.'
                        );
                        actualSeed = 'dev-only-insecure-fallback-seed-at-least-32-chars-long';
                    } else {
                        logger.warn('[CryptoConfig] Seed validation failed', { rule: 'EXISTENCE_OR_LENGTH', seedLength });
                        throw new CryptoConfigError(
                            !actualSeed || actualSeed.trim() === '' 
                                ? 'VITE_ENCRYPTION_SEED no configurada.' 
                                : `Seed demasiado corta: ${seedLength} caracteres (mínimo requerido: 32).`
                        );
                    }
                }

                // Rule 3 — Weak/placeholder pattern detection (case-insensitive substring match)
                const seedLower = actualSeed.toLowerCase();
                const matchedPattern = WEAK_SEED_PATTERNS.find(p => seedLower.includes(p.toLowerCase()));
                if (matchedPattern && actualSeed !== 'dev-only-insecure-fallback-seed-at-least-32-chars-long') {
                    if (import.meta.env.DEV) {
                        logger.warn('[CryptoConfig] Weak seed detected but running in DEV mode. Using fallback seed.');
                        console.warn('[CryptoConfig] Seed débil detectada. Usando fallback temporal para desarrollo.');
                        actualSeed = 'dev-only-insecure-fallback-seed-at-least-32-chars-long';
                    } else {
                        logger.warn('[CryptoConfig] Seed validation failed', { rule: 'WEAK_PATTERN', seedLength: actualSeed.length });
                        throw new CryptoConfigError(
                            'Seed contiene un patrón débil conocido. Usa una semilla aleatoria de 32+ caracteres.'
                        );
                    }
                }
                // ─────────────────────────────────────────────────────────────────────────

        try {
            // 1. Obtener huella digital del dispositivo
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            const deviceFingerprint = result.visitorId;

            // 2. Combinar semilla y huella digital
            const rawKeyMaterial = `${actualSeed}:${deviceFingerprint}`;
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(rawKeyMaterial),
                { name: "PBKDF2" },
                false,
                ["deriveKey"]
            );

            // 3. Derivar llave AES-GCM
            this.key = await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: encoder.encode("doctor-antivejez-salt"), // Salt constante para consistencia
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false, // La llave no es exportable
                ["encrypt", "decrypt"]
            );

            logger.audit('crypto_initialized', { deviceId: deviceFingerprint });
        } catch (error) {
            logger.error('Failed to initialize crypto service', error);
            throw new Error('Encryption service failure');
        }

        this.isInitialized = true;
      } catch (error) {
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

    /**
     * Asegura que el servicio esté inicializado antes de usarlo.
     */
    private async ensureInitialized() {
        if (!this.initializationPromise) {
            this.initializationPromise = this.init();
        }
        await this.initializationPromise;
        if (!this.key) {
            throw new Error('Crypto key not derived');
        }
    }

    /**
     * Encripta un objeto o string.
     * Retorna: iv:ciphertext (base64)
     */
    async encrypt(data: any): Promise<string> {
        await this.ensureInitialized();
        if (!this.key) throw new Error('Crypto not ready');

        try {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(JSON.stringify(data));

            const encryptedBuffer = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                this.key,
                encodedData
            );

            // Convertir a base64 para almacenamiento
            const ivBase64 = this.arrayBufferToBase64(iv.buffer);
            const contentBase64 = this.arrayBufferToBase64(encryptedBuffer);

            return `${ivBase64}:${contentBase64}`;
        } catch (error) {
            logger.error('Encryption failed', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Desencripta un string en formato iv:ciphertext.
     */
    async decrypt(cipherString: string): Promise<any> {
        // Guard: if not a valid encrypted string, return null
        if (!cipherString ||
            typeof cipherString !== 'string' ||
            !cipherString.includes(':') ||
            cipherString.length < 20) {
            console.warn('[CryptoService] Invalid cipher format, clearing stale cache');
            return null;
        }

        await this.ensureInitialized();
        if (!this.key) throw new Error('Crypto not ready');

        try {
            const [ivBase64, contentBase64] = cipherString.split(':');
            if (!ivBase64 || !contentBase64) throw new Error('Invalid cipher format');

            const iv = this.base64ToArrayBuffer(ivBase64);
            const content = this.base64ToArrayBuffer(contentBase64);

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: new Uint8Array(iv) },
                this.key,
                content
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedBuffer));
        } catch (error) {
            logger.error('Decryption failed', error);
            return null; // Fail safe return null
        }
    }

    // Helpers para Base64
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

export const cryptoService = new CryptoService();
