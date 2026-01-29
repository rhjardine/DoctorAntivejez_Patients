import { create } from 'zustand';

interface ProfileData {
    biologicalAge: number | null;
    chronologicalAge: number | null;
    guides: any[];
    foodPlans: any[];
    bloodType: string | null;
    latestNlr: any | null;
    fetchedAt: number;
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

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useProfileStore = create<ProfileState>((set, get) => ({
    profileData: null,
    isLoading: false,

    setProfileData: (data: ProfileData) => {
        set({ profileData: { ...data, fetchedAt: Date.now() } });
    },

    clearProfileData: () => {
        set({ profileData: null });
    },

    isCacheValid: () => {
        const { profileData } = get();
        if (!profileData) return false;
        const age = Date.now() - profileData.fetchedAt;
        return age < CACHE_DURATION;
    },

    forceRefresh: () => {
        set({ profileData: null }); // Clear cache to force new fetch
    },

    updateAdherence: (type: string, data: any) => {
        console.log(`[Store] Updating adherence for ${type}:`, data);
        // In a real app, this might involve an API call or updating a specific adherence field
        // For now, we'll just log it as requested for the simulation
    }
}));
