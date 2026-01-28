
import React from 'react';
import {
  Apple, Utensils, Coffee, Salad, Grape,
  Zap, Activity, Dumbbell, Trophy, Bike,
  Smile, Brain, Heart, Sparkles, Star,
  Sprout, Leaf, Home, CloudSun, Wind,
  Bed, Moon, Clock, Bell, Check
} from 'lucide-react';
import { UserPreferences, COLORS } from '../types';
import { PrivacySettings } from './Settings/PrivacySettings';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const ICON_OPTIONS = {
  NUTRITION: [
    { id: 'Apple', icon: Apple },
    { id: 'Utensils', icon: Utensils },
    { id: 'Coffee', icon: Coffee },
    { id: 'Salad', icon: Salad },
    { id: 'Grape', icon: Grape }
  ],
  ACTIVITY: [
    { id: 'Zap', icon: Zap },
    { id: 'Activity', icon: Activity },
    { id: 'Dumbbell', icon: Dumbbell },
    { id: 'Trophy', icon: Trophy },
    { id: 'Bike', icon: Bike }
  ],
  ATTITUDE: [
    { id: 'Smile', icon: Smile },
    { id: 'Brain', icon: Brain },
    { id: 'Heart', icon: Heart },
    { id: 'Sparkles', icon: Sparkles },
    { id: 'Star', icon: Star }
  ],
  ENVIRONMENT: [
    { id: 'Sprout', icon: Sprout },
    { id: 'Leaf', icon: Leaf },
    { id: 'Home', icon: Home },
    { id: 'CloudSun', icon: CloudSun },
    { id: 'Wind', icon: Wind }
  ],
  REST: [
    { id: 'Bed', icon: Bed },
    { id: 'Moon', icon: Moon },
    { id: 'Clock', icon: Clock },
    { id: 'Bell', icon: Bell },
    { id: 'Check', icon: Check }
  ]
};

const SettingsView: React.FC<SettingsViewProps> = ({ preferences, onUpdatePreferences }) => {
  const handleIconSelect = (category: keyof UserPreferences['icons'], iconId: string) => {
    const newPrefs = {
      ...preferences,
      icons: {
        ...preferences.icons,
        [category]: iconId
      }
    };
    onUpdatePreferences(newPrefs);
  };

  const renderCategorySelection = (category: keyof UserPreferences['icons'], label: string) => {
    const options = ICON_OPTIONS[category];
    const currentIconId = preferences.icons[category];

    return (
      <div className="space-y-3">
        <h4 className="text-[11px] font-black text-darkBlue uppercase tracking-widest pl-1">{label}</h4>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentIconId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleIconSelect(category, opt.id)}
                className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all border-2 ${isSelected
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'bg-white border-slate-100 text-slate-300'
                  }`}
              >
                <Icon size={24} />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-6 pb-32 animate-in fade-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar h-full bg-[#F8FAFC]">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-darkBlue uppercase tracking-tighter">Personalización</h2>
        <p className="text-xs font-bold text-textMedium mt-2">Configura la identidad visual de tu Dashboard Antivejez.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 space-y-8">
        {renderCategorySelection('NUTRITION', 'Icono de Alimentación')}
        {renderCategorySelection('ACTIVITY', 'Icono de Actividad')}
        {renderCategorySelection('ATTITUDE', 'Icono de Actitud')}
        {renderCategorySelection('ENVIRONMENT', 'Icono de Entorno')}
        {renderCategorySelection('REST', 'Icono de Descanso')}
      </div>

      <div className="mt-8">
        <PrivacySettings />
      </div>

      <div className="mt-8 bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
        <p className="text-[10px] font-bold text-darkBlue/60 leading-relaxed italic text-center">
          "Tu entorno visual influye en tu adherencia. Elige iconos que resuenen con tu estilo de vida."
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
