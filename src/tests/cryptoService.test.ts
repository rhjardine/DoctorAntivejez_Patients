import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cryptoService } from '../services/cryptoService';

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
    default: {
        load: vi.fn().mockResolvedValue({
            get: vi.fn().mockResolvedValue({ visitorId: 'test-device-id' })
        })
    }
}));

// Mock Web Crypto API (Partial implementation for Node environment if needed, but Vitest browser mode handles this usually. 
// If running in Node, we might need a polyfill. assuming browser-like env for now or partial mock).
// However, since we are largely testing logic, we might need a full browser environment or mock crypto.
// For this environment, we will assume standard browser globals are available or mocked.

describe('CryptoService', () => {
    it('should encrypt and decrypt data correctly', async () => {
        const sensitiveData = { name: 'Richard Jardine', condition: 'Anti-aging' };

        // Encrypt
        const encrypted = await cryptoService.encrypt(sensitiveData);
        expect(encrypted).toContain(':'); // IV:Ciphertext format
        expect(encrypted).not.toContain('Richard'); // Plaintext should be hidden

        // Decrypt
        const decrypted = await cryptoService.decrypt(encrypted);
        expect(decrypted).toEqual(sensitiveData);
    });

    it('should return null for invalid ciphertext', async () => {
        const result = await cryptoService.decrypt('invalid:format');
        expect(result).toBeNull();
    });

    it('should produce different outputs for same data (due to random IV)', async () => {
        const data = "Secret";
        const enc1 = await cryptoService.encrypt(data);
        const enc2 = await cryptoService.encrypt(data);
        expect(enc1).not.toEqual(enc2);

        // But both decrypt to same
        expect(await cryptoService.decrypt(enc1)).toEqual(data);
        expect(await cryptoService.decrypt(enc2)).toEqual(data);
    });
});
