import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

type ColorScheme = 'auto' | 'light' | 'dark';

/**
 * useDarkMode — Manages dark/light/auto color scheme for the PWA.
 *
 * Strategy:
 * - Adds/removes the `dark-mode` class on <html>
 * - 'auto' follows the OS system preference via `prefers-color-scheme`
 * - 'light' / 'dark' are manual overrides persisted in ui-storage (Zustand)
 * - No Service Worker impact, no new dependencies
 */
export const useDarkMode = () => {
    const colorScheme: ColorScheme =
        (useUIStore.getState().userPreferences as any).colorScheme ?? 'auto';
    const updatePreferences = useUIStore((s) => s.updatePreferences);

    const applyScheme = (scheme: ColorScheme) => {
        const htmlEl = document.documentElement;
        if (scheme === 'dark') {
            htmlEl.classList.add('dark-mode');
        } else if (scheme === 'light') {
            htmlEl.classList.remove('dark-mode');
        } else {
            // 'auto': follow OS preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            prefersDark
                ? htmlEl.classList.add('dark-mode')
                : htmlEl.classList.remove('dark-mode');
        }
    };

    // Apply scheme on mount and when preference changes
    useEffect(() => {
        applyScheme(colorScheme);

        // Listen for OS-level changes (only active when mode is 'auto')
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleOSChange = () => {
            const currentScheme =
                (useUIStore.getState().userPreferences as any).colorScheme ?? 'auto';
            if (currentScheme === 'auto') {
                applyScheme('auto');
            }
        };

        mediaQuery.addEventListener('change', handleOSChange);
        return () => mediaQuery.removeEventListener('change', handleOSChange);
    }, [colorScheme]);

    const setColorScheme = (scheme: ColorScheme) => {
        const currentPrefs = useUIStore.getState().userPreferences;
        updatePreferences({ ...currentPrefs, colorScheme: scheme } as any);
        applyScheme(scheme);
    };

    const isDark = document.documentElement.classList.contains('dark-mode');

    return { isDark, colorScheme, setColorScheme };
};
