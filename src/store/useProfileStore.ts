import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profileData: null,
            isLoading: false,

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
            storage: createJSONStorage(() => localStorage),
            // Only persist essential profile fields — never persist loading state
            partialize: (state) => ({
                profileData: state.profileData,
            }),
        }
    )
);
