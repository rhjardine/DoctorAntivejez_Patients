import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Web Crypto API para tests
Object.defineProperty(window, 'crypto', {
    value: {
        subtle: {
            importKey: vi.fn().mockResolvedValue({}),
            deriveKey: vi.fn().mockResolvedValue({}),
            encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
            decrypt: vi.fn().mockResolvedValue(new TextEncoder().encode(JSON.stringify({}))),
        },
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
            return arr
        },
    },
})

// Mock IndexedDB
import 'fake-indexeddb/auto'
