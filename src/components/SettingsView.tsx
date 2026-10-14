import React from 'react';
import { UserPreferences, COLORS, EscalaTexto } from '../types';
import { PrivacySettings } from './Settings/PrivacySettings';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLocale } from '../hooks/useLocale';
import { useUIStore } from '../store/useUIStore';
import { Globe, Sun, Moon, Monitor, Type } from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

/** Opciones de tamaño; `muestra` es el cuerpo con que se dibuja la «Aa». */
const ESCALAS: { id: EscalaTexto; etiqueta: string; muestra: number }[] = [
  { id: 'compacta', etiqueta: 'Compacta', muestra: 15 },
  { id: 'normal',   etiqueta: 'Normal',   muestra: 18 },
  { id: 'grande',   etiqueta: 'Grande',   muestra: 22 },
  { id: 'maxima',   etiqueta: 'Muy grande', muestra: 26 },
];

const SettingsView: React.FC<SettingsViewProps> = ({ preferences, onUpdatePreferences }) => {
  const { colorScheme, setColorScheme } = useDarkMode();
  const { t, locale, setLocale } = useLocale();
  const setEscalaTexto = useUIStore((st) => st.setEscalaTexto);

  return (
    <div className="flex flex-col p-6 pb-32 animate-in fade-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar h-full bg-[var(--background)]">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[var(--dark-navy)] dark:text-white uppercase tracking-tighter">{t('settings.title')}</h2>
        <p className="text-xs font-bold text-[var(--text-secondary)] mt-2">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Tamaño del texto.
            Va primero a propósito: es el ajuste que más cambia la vida de un
            paciente mayor, y el único que no debería tener que pedirle a nadie.
            El ejemplo de abajo se reescala en vivo, así que se elige viendo el
            resultado en lugar de adivinando. */}
        <div className="bg-[var(--surface)] rounded-[2.5rem] p-6 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Type size={20} />
            </div>
            <h3 className="text-sm font-black text-[var(--dark-navy)] dark:text-[var(--text-primary)] tracking-tight">
              Tamaño del texto
            </h3>
          </div>
          <p className="text-xs font-bold text-[var(--text-secondary)] mb-5">
            Elige el que te resulte cómodo de leer. Puedes cambiarlo cuando quieras.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {ESCALAS.map(({ id, etiqueta, muestra }) => {
              const activa = (preferences.escalaTexto ?? 'normal') === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEscalaTexto(id)}
                  aria-pressed={activa}
                  className={`min-h-[64px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all active:scale-95 ${activa
                    ? 'bg-primary/10 border-primary text-[var(--dark-navy)] dark:text-white'
                    : 'bg-[var(--background)] border-transparent text-[var(--text-secondary)]'
                    }`}
                >
                  <span style={{ fontSize: muestra }} className="font-black leading-none">Aa</span>
                  <span className="text-xs font-bold">{etiqueta}</span>
                </button>
              );
            })}
          </div>
        </div>

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
                <span className="text-[calc(12px*var(--escala-texto,1))] font-bold uppercase">{scheme.label}</span>
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
        <p className="text-[calc(12px*var(--escala-texto,1))] font-bold text-[var(--dark-navy)] dark:text-[var(--text-primary)] opacity-60 leading-relaxed italic text-center">
          "{t('settings.quote')}"
        </p>
      </div>

      <div className="mt-12 pb-8 text-center opacity-30">
        <p className="text-[calc(12px*var(--escala-texto,1))] font-black text-[var(--dark-navy)] dark:text-white uppercase tracking-[0.3em]">
          Vytalix.io
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
