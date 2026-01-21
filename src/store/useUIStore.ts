import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences, MainTab, DetailView } from '../types';

interface UIState {
    isDrawerOpen: boolean;
    isClinicalInfoOpen: boolean;
    isPrivacyConsentOpen: boolean;
    currentMainTab: MainTab;
    userPreferences: UserPreferences;

    // Actions
    toggleDrawer: (isOpen?: boolean) => void;
    toggleClinicalInfo: (isOpen?: boolean) => void;
    togglePrivacyConsent: (isOpen?: boolean) => void;
    setMainTab: (tab: MainTab) => void;
    updatePreferences: (prefs: UserPreferences) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    icons: {
        NUTRITION: 'Apple',
        ACTIVITY: 'Zap',
        ATTITUDE: 'Smile',
        ENVIRONMENT: 'Sprout',
        REST: 'Bed'
    }
};

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isDrawerOpen: false,
            isClinicalInfoOpen: false,
            isPrivacyConsentOpen: false,
            currentMainTab: MainTab.KEYS_5A,
            userPreferences: DEFAULT_PREFERENCES,

            toggleDrawer: (isOpen) => set((state) => ({ isDrawerOpen: isOpen ?? !state.isDrawerOpen })),
            toggleClinicalInfo: (isOpen) => set((state) => ({ isClinicalInfoOpen: isOpen ?? !state.isClinicalInfoOpen })),
            togglePrivacyConsent: (isOpen) => set((state) => ({ isPrivacyConsentOpen: isOpen ?? !state.isPrivacyConsentOpen })),
            setMainTab: (tab) => set({ currentMainTab: tab }),
            updatePreferences: (prefs) => set({ userPreferences: prefs }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({ userPreferences: state.userPreferences }),
        }
    )
);
