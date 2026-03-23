import React from 'react';
import { UserPreferences, COLORS } from '../types';
import { PrivacySettings } from './Settings/PrivacySettings';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLocale } from '../hooks/useLocale';
import { Globe, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ preferences, onUpdatePreferences }) => {
  const { colorScheme, setColorScheme } = useDarkMode();
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="flex flex-col p-6 pb-32 animate-in fade-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar h-full bg-[var(--background)]">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[var(--dark-navy)] dark:text-white uppercase tracking-tighter">{t('settings.title')}</h2>
        <p className="text-xs font-bold text-[var(--text-secondary)] mt-2">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-[var(--surface)] rounded-[2.5rem] p-6 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sun size={20} />
            </div>
            <h3 className="text-sm font-black text-[var(--dark-navy)] dark:text-[var(--text-primary)] uppercase tracking-widest">{t('settings.appearance')}</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', icon: Sun, label: t('settings.colorScheme.light') },
              { id: 'dark', icon: Moon, label: t('settings.colorScheme.dark') },
              { id: 'auto', icon: Monitor, label: t('settings.colorScheme.auto') }
            ].map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id as any)}
                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${colorScheme === scheme.id
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
              >
                <scheme.icon size={20} />
                <span className="text-[10px] font-bold uppercase">{scheme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-[var(--surface)] rounded-[2.5rem] p-6 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Globe size={20} />
            </div>
            <h3 className="text-sm font-black text-[var(--dark-navy)] dark:text-[var(--text-primary)] uppercase tracking-widest">{t('settings.language')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'es', label: t('settings.language.es') },
              { id: 'en', label: t('settings.language.en') }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLocale(lang.id as any)}
                className={`p-4 rounded-3xl border-2 font-bold uppercase text-xs transition-all ${locale === lang.id
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>


      </div>

      <div className="mt-8">
        <PrivacySettings />
      </div>

      <div className="mt-8 bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
        <p className="text-[10px] font-bold text-[var(--dark-navy)] dark:text-[var(--text-primary)] opacity-60 leading-relaxed italic text-center">
          "{t('settings.quote')}"
        </p>
      </div>

      <div className="mt-12 pb-8 text-center opacity-30">
        <p className="text-[9px] font-black text-[var(--dark-navy)] dark:text-white uppercase tracking-[0.3em]">
          Vytalix.io
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
