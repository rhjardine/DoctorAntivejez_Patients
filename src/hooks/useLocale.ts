import { useUIStore } from '../store/useUIStore';
import { t, Locale } from '../services/i18n';

/**
 * useLocale — Provides translation function and locale management.
 *
 * Usage:
 *   const { t, locale, setLocale } = useLocale();
 *   t('login.documentId') → 'Documento de Identidad' | 'Identity Document'
 */
export const useLocale = () => {
    const preferences = useUIStore((s) => s.userPreferences);
    const updatePreferences = useUIStore((s) => s.updatePreferences);

    const locale: Locale = ((preferences as any).locale as Locale) ?? 'es';

    const translate = (key: string): string => t(key, locale);

    const setLocale = (newLocale: Locale) => {
        updatePreferences({ ...preferences, locale: newLocale } as any);
    };

    return { t: translate, locale, setLocale };
};
