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

const encryptedStorage: StateStorage = {
    getItem: async (name: string) => {
        const raw = localStorage.getItem(name);
        if (!raw) return null;

        // If raw doesn't look encrypted, clear and return null
        if (!raw.includes(':') || raw.startsWith('{')) {
            console.warn('[Storage] Clearing unencrypted cache');
            localStorage.removeItem(name);
            return null;
        }

        try {
            const decrypted = await cryptoService.decrypt(raw);
            if (decrypted) return JSON.stringify(decrypted);
            localStorage.removeItem(name);
            return null;
        } catch {
            localStorage.removeItem(name);
            return null;
        }
    },
    setItem: async (name: string, value: string) => {
        try {
            const encrypted = await cryptoService.encrypt(JSON.parse(value));
            localStorage.setItem(name, encrypted);
        } catch (e) {
            console.error('[encryptedStorage] Encrypt failed', e);
        }
    },
    removeItem: (name: string) => localStorage.removeItem(name),
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
            // onRehydrateStorage is called during Zustand hydration
            onRehydrateStorage: () => (state) => {
                // Ensure state is marked ready when initialization finishes
                state?.setReady(true);
            },
        }
    )
);
