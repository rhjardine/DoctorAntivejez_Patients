import { create } from 'zustand';

interface ProfileData {
    biologicalAge: number | null;
    chronologicalAge: number | null;
    guides: any[];
    foodPlans: any[];
    bloodType: string | null;
    fetchedAt: number;
}

interface ProfileState {
    profileData: ProfileData | null;
    isLoading: boolean;
    setProfileData: (data: ProfileData) => void;
    clearProfileData: () => void;
    isCacheValid: () => boolean;
    forceRefresh: () => void;
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
}));
