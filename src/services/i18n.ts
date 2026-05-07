/**
 * i18n — Lightweight translation system for the PWA.
 *
 * No external dependencies. Supports 'es' and 'en'.
 * Usage: t('login.documentId', locale) → 'Documento de Identidad' | 'Document ID'
 *
 * Guidelines:
 * - Clinical / medical plan content is NOT translated (it comes from the doctor).
 * - Only UI chrome, labels, buttons, and navigation strings are translated.
 * - Add new keys to BOTH 'es' and 'en' — the fallback is the Spanish string.
 */

export type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, string>> = {
    es: {
        // Auth
        'login.documentId': 'Documento de Identidad',
        'login.password': 'Contraseña',
        'login.enter': 'Entrar',
        'login.connecting': 'Conectando...',
        'login.secureAccess': 'Acceso Seguro para Pacientes',
        'login.placeholder.documentId': 'Ej: 5963578',
        'login.placeholder.password': '••••••••',

        // Navigation
        'nav.home': 'Inicio',
        'nav.achievements': 'Logros',
        'nav.biomics': 'Biomics',
        'nav.store': 'Tienda',
        'nav.guide': 'Mi Guía Antivejez',
        'nav.keys5a': 'Claves 5A',
        'nav.therapies4r': 'Terapias 4R',
        'nav.settings': 'Configuración',

        // Settings
        'settings.title': 'Personalización',
        'settings.subtitle': 'Configura la identidad visual de tu Dashboard Antivejez.',
        'settings.appearance': 'Apariencia',
        'settings.language': 'Idioma',
        'settings.colorScheme': 'Tema de Color',
        'settings.colorScheme.auto': 'Automático (Sistema)',
        'settings.colorScheme.light': 'Claro',
        'settings.colorScheme.dark': 'Oscuro',
        'settings.language.es': 'Español',
        'settings.language.en': 'English',
        'settings.icons.nutrition': 'Icono de Alimentación',
        'settings.icons.activity': 'Icono de Actividad',
        'settings.icons.attitude': 'Icono de Actitud',
        'settings.icons.environment': 'Icono de Entorno',
        'settings.icons.rest': 'Icono de Descanso',
        'settings.quote': 'Tu entorno visual influye en tu adherencia. Elige iconos que resuenen con tu estilo de vida.',

        // Errors
        'error.login': 'Error al iniciar sesión',
        'error.loginDefault': 'Credenciales incorrectas. Intenta de nuevo.',

        // Common UI
        'common.back': 'Volver',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.loading': 'Cargando...',
        'common.offline': 'Modo Offline',
    },

    en: {
        // Auth
        'login.documentId': 'Identity Document',
        'login.password': 'Password',
        'login.enter': 'Sign In',
        'login.connecting': 'Connecting...',
        'login.secureAccess': 'Secure Patient Access',
        'login.placeholder.documentId': 'e.g. 5963578',
        'login.placeholder.password': '••••••••',

        // Navigation
        'nav.home': 'Home',
        'nav.achievements': 'Achievements',
        'nav.biomics': 'Biomics',
        'nav.store': 'Store',
        'nav.guide': 'My Anti-Aging Guide',
        'nav.keys5a': 'Keys 5A',
        'nav.therapies4r': 'Therapies 4R',
        'nav.settings': 'Settings',

        // Settings
        'settings.title': 'Customization',
        'settings.subtitle': 'Configure the visual identity of your Anti-Aging Dashboard.',
        'settings.appearance': 'Appearance',
        'settings.language': 'Language',
        'settings.colorScheme': 'Color Theme',
        'settings.colorScheme.auto': 'Auto (System)',
        'settings.colorScheme.light': 'Light',
        'settings.colorScheme.dark': 'Dark',
        'settings.language.es': 'Español',
        'settings.language.en': 'English',
        'settings.icons.nutrition': 'Nutrition Icon',
        'settings.icons.activity': 'Activity Icon',
        'settings.icons.attitude': 'Attitude Icon',
        'settings.icons.environment': 'Environment Icon',
        'settings.icons.rest': 'Rest Icon',
        'settings.quote': 'Your visual environment influences your adherence. Choose icons that resonate with your lifestyle.',

        // Errors
        'error.login': 'Login error',
        'error.loginDefault': 'Incorrect credentials. Please try again.',

        // Common UI
        'common.back': 'Back',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.loading': 'Loading...',
        'common.offline': 'Offline Mode',
    },
};

/**
 * Translates a key into the given locale.
 * Falls back to Spanish ('es') if key is missing in the requested locale.
 * Falls back to the key itself if missing in both.
 */
export const t = (key: string, locale: Locale = 'es'): string => {
    return (
        translations[locale]?.[key] ??
        translations['es']?.[key] ??
        key
    );
};

export default translations;
