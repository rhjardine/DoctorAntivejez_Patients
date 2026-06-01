import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { cryptoService } from '../services/cryptoService';

interface ProfileData {
    biologicalAge: number | null;
    chronologicalAge: number | null;
    guides: any[];
    foodPlans: any[];
    bloodType: string | null;
    latestNlr: any | null;
    fetchedAt: number;
    firstName?: string;
    alimentacion?: any;
}

interface ProfileState {
    profileData: ProfileData | null;
    isLoading: boolean;
    setProfileData: (data: ProfileData) => void;
    clearProfileData: () => void;
    isCacheValid: () => boolean;
    forceRefresh: () => void;
    updateAdherence: (type: string, data: any) => void;
    isReady: boolean;
    setReady: (ready: boolean) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let pendingWrites = 0;
const memoryBuffer = new Map<string, string>();

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (pendingWrites > 0) {
        e.preventDefault();
        e.returnValue = 'Tus datos médicos se están encriptando. ¿Seguro que deseas salir y arriesgarte a perder los cambios?';
        return e.returnValue;
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
}

const encryptedStorage: StateStorage = {
    getItem: async (name: string) => {
        // Return from in-memory buffer if available (synchronous-like read for Zustand)
        if (memoryBuffer.has(name)) {
            return memoryBuffer.get(name)!;
        }

        try {
            const raw = localStorage.getItem(name);

            // Guard 1: empty / missing value
            if (!raw || raw.trim() === '') return null;

            // Guard 2: legacy unencrypted JSON (versions before encryption was added)
            if (raw.startsWith('{') || raw.startsWith('[')) {
                console.warn('[encryptedStorage] Legacy unencrypted data detected, clearing:', name);
                localStorage.removeItem(name);
                return null;
            }

            // Guard 3: invalid AES-GCM format (must be base64:base64)
            const parts = raw.split(':');
            if (parts.length < 2) {
                console.warn('[encryptedStorage] Invalid format (no colon delimiter), clearing:', name);
                localStorage.removeItem(name);
                return null;
            }
            try {
                atob(parts[0]); // Verify first part is valid base64
            } catch {
                console.warn('[encryptedStorage] Invalid base64 format, clearing:', name);
                localStorage.removeItem(name);
                return null;
            }

            const decrypted = await cryptoService.decrypt(raw);
            if (decrypted == null) {
                // decrypt() returned null — corrupted or wrong key (e.g. different device)
                localStorage.removeItem(name);
                return null;
            }
            
            const stringified = JSON.stringify(decrypted);
            memoryBuffer.set(name, stringified);
            return stringified;

        } catch (e) {
            // AES-GCM can fail in degraded security contexts (some Android browsers)
            console.warn('[encryptedStorage] Decryption failed for key:', name, '— clearing');
            localStorage.removeItem(name);
            return null; // Always return null, never throw, never return undefined
        }
    },
    setItem: async (name: string, value: string) => {
        // Update buffer synchronously so Zustand gets the latest data immediately
        memoryBuffer.set(name, value);
        pendingWrites++;
        
        try {
            const encrypted = await cryptoService.encrypt(JSON.parse(value));
            localStorage.setItem(name, encrypted);
        } catch (e) {
            console.error('[encryptedStorage] Encrypt failed', e);
        } finally {
            pendingWrites = Math.max(0, pendingWrites - 1);
        }
    },
    removeItem: (name: string) => {
        memoryBuffer.delete(name);
        localStorage.removeItem(name);
    },
};

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profileData: null,
            isLoading: false,
            isReady: false,

            setReady: (ready: boolean) => set({ isReady: ready }),

            setProfileData: (data: ProfileData) => {
                set({ profileData: { ...data, fetchedAt: Date.now() } });
            },

            clearProfileData: () => {
                set({ profileData: null });
            },

            // Cache is valid if data exists and was fetched within the last 5 minutes
            isCacheValid: () => {
                const { profileData } = get();
                if (!profileData) return false;
                const age = Date.now() - profileData.fetchedAt;
                return age < CACHE_DURATION;
            },

            forceRefresh: () => {
                set({ profileData: null });
            },

            updateAdherence: (type: string, data: any) => {
                console.log(`[Store] Updating adherence for ${type}:`, data);
            }
        }),
        {
            name: 'rejuvenate_profile_v1',   // localStorage key
            storage: createJSONStorage(() => encryptedStorage), // Now uses AES-GCM encrypted persistence
            // Only persist essential profile fields — never persist loading state
            partialize: (state) => ({
                profileData: state.profileData,
            } as unknown as ProfileState),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.warn('[ProfileStore] Rehydration failed, clearing cache:', error);
                    localStorage.removeItem('rejuvenate_profile_v1');
                    return;
                }
                // Ensure state is marked ready when initialization finishes
                if (state && typeof state.setReady === 'function') {
                    state.setReady(true);
                }
            },
        }
    )
);
