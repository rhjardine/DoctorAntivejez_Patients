import '@testing-library/jest-dom'
import { vi } from 'vitest'

/**
 * Doble de la Web Crypto API para tests.
 *
 * `encrypt`/`decrypt` hacen un **round-trip real** (XOR reversible con el IV).
 * No es criptografía —no pretende serlo— pero permite que un test compruebe
 * que lo que se cifra se recupera intacto.
 *
 * El doble anterior devolvía `new ArrayBuffer(16)` al cifrar y `{}` fijo al
 * descifrar, así que ningún test del proyecto podía verificar una ida y vuelta:
 * un fallo de cifrado habría pasado desapercibido.
 */
const xorRoundTrip = (data: Uint8Array, iv: Uint8Array): Uint8Array => {
    const out = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ (iv.length ? iv[i % iv.length] : 0)
    }
    return out
}

const toBytes = (input: ArrayBuffer | ArrayBufferView): Uint8Array =>
    input instanceof Uint8Array
        ? input
        : ArrayBuffer.isView(input)
            ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
            : new Uint8Array(input)

Object.defineProperty(window, 'crypto', {
    value: {
        subtle: {
            importKey: vi.fn().mockResolvedValue({}),
            deriveKey: vi.fn().mockResolvedValue({}),
            encrypt: vi.fn(async (algo: { iv: Uint8Array }, _key: unknown, data: ArrayBuffer) =>
                xorRoundTrip(toBytes(data), toBytes(algo.iv)).buffer,
            ),
            decrypt: vi.fn(async (algo: { iv: Uint8Array }, _key: unknown, data: ArrayBuffer) =>
                xorRoundTrip(toBytes(data), toBytes(algo.iv)).buffer,
            ),
        },
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
            return arr
        },
    },
})

// Mock IndexedDB
import 'fake-indexeddb/auto'
