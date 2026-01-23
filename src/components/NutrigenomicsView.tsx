
import React, { useEffect, useState, useMemo } from 'react';
import { ProtocolService } from '../services/protocolService';
import { authService } from '../services/authService';
import { useProfileStore } from '../store/useProfileStore';
import { NutrigenomicPlan, MealType, NutrigenomicFood, BloodType, DietType } from '../types';
import {
  ChevronLeft, Sun, Sunset, Moon, Coffee, AlertCircle, Droplet,
  ChefHat, Leaf, Check, Heart, Info, Zap, Star, ShieldAlert
} from 'lucide-react';

interface NutrigenomicsViewProps {
  onBack: () => void;
}

const FAVORITES_KEY = 'rejuvenate_favorite_foods';

// Rule Engine: Foods to avoid based on Blood Type
const BLOOD_TYPE_RESTRICTIONS: Record<BloodType, string[]> = {
  'O': ['Trigo', 'Maíz', 'Lentejas', 'Cerdo', 'Azúcar refinada', 'Lácteos'],
  'A': ['Carne Roja', 'Embutidos', 'Lácteos enteros', 'Trigo en exceso', 'Pimentón'],
  'B': ['Pollo', 'Maíz', 'Lentejas', 'Tomate', 'Maní', 'Trigo'],
  'AB': ['Carne Roja', 'Maíz', 'Frijoles negros', 'Semillas de sésamo', 'Pollo']
};

const NutrigenomicsView: React.FC<NutrigenomicsViewProps> = ({ onBack }) => {
  const [plan, setPlan] = useState<NutrigenomicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MealType>('BREAKFAST');
  const [favorites, setFavorites] = useState<string[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await ProtocolService.fetchNutrigenomicPlan(user.id);
        setPlan(data);
      } catch (e) {
        console.error("Error loading nutrigenomics", e);
      } finally {
        setLoading(false);
      }
    };

    const loadFavorites = () => {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        try { setFavorites(JSON.parse(stored)); } catch (e) { }
      }
    };

    loadData();
    loadFavorites();
  }, [user?.id]);

  const toggleFavorite = (foodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorite = favorites.includes(foodId);
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== foodId)
      : [...favorites, foodId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  // Rule Engine: Derive forbidden items if backend doesn't provide them all
  const derivedForbidden = useMemo(() => {
    // Phase 5: Use Profile Store Blood Type
    const profileStore = useProfileStore.getState();
    const effectiveBloodType = (profileStore.profileData?.bloodType as BloodType) || plan?.bloodType || 'O';

    const bloodRules = BLOOD_TYPE_RESTRICTIONS[effectiveBloodType] || [];
    // Merge backend forbidden with local rules, removing duplicates
    return Array.from(new Set([...bloodRules, ...(plan?.forbidden || [])]));
  }, [plan]);

  const groupedFoods = useMemo(() => {
    if (!plan) return {};
    const foodsInMeal = plan.foods.filter(f => f.mealTypes.includes(activeTab));
    const groups: Record<string, NutrigenomicFood[]> = {};

    foodsInMeal.forEach(food => {
      const cat = food.category || 'General';
      if (!groups[cat]) groups[cat] = [];

      // Inject Clinical Priority Badge logic if not present from server
      const isPriority = food.isClinicalPriority ||
        (plan.dietTypes.includes('METABOLIC') && (cat === 'Proteína' || cat === 'Grasas Saludables')) ||
        (plan.dietTypes.includes('RENAL') && cat === 'Vegetales');

      groups[cat].push({ ...food, isClinicalPriority: isPriority });
    });
    return groups;
  }, [plan, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-darkBlue mt-6 animate-pulse uppercase tracking-[0.3em]">Sincronizando Perfil ADN...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] p-10 text-center">
        <div className="bg-sky-50 p-6 rounded-[2.5rem] mb-6">
          <ChefHat size={48} className="text-primary" />
        </div>
        <h3 className="text-xl font-black text-darkBlue uppercase tracking-tighter mb-2">Plan en Preparación</h3>
        <p className="text-xs font-bold text-textMedium italic mb-8">
          Tu doctor está diseñando tu plan de alimentación basado en tu grupo sanguíneo y metabolismo.
        </p>
        <button onClick={onBack} className="bg-darkBlue text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
          Volver al Inicio
        </button>
      </div>
    );
  }

  const sortedCategories = Object.keys(groupedFoods).sort();

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] animate-in slide-in-from-right duration-500 absolute inset-0 z-40 overflow-hidden">

      {/* Header - Profile Sync UI */}
      <div className="bg-darkBlue px-4 pt-12 pb-6 shadow-xl z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl active:scale-90 transition-transform">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-white leading-none tracking-tight uppercase">Plan Nutrigenómico</h2>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 block">Tipo {plan.bloodType} • {plan.dietTypes.join(' + ')}</span>
          </div>
          <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-xl">
            <Droplet size={20} className="text-primary" fill="currentColor" />
          </div>
        </div>

        {/* Diet Type Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {plan.dietTypes.map(type => (
            <span key={type} className="bg-white/10 border border-white/20 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Star size={10} className="text-accentYellow" fill="currentColor" />
              Enfoque {type}
            </span>
          ))}
        </div>
      </div>

      {/* Meal Tabs */}
      <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar py-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealType[]).map((tab) => {
          const isActive = activeTab === tab;
          const Icon = tab === 'BREAKFAST' ? Coffee : tab === 'LUNCH' ? Sun : tab === 'DINNER' ? Moon : Leaf;
          const label = tab === 'BREAKFAST' ? 'Desayuno' : tab === 'LUNCH' ? 'Almuerzo' : tab === 'DINNER' ? 'Cena' : 'Meriendas';

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${isActive
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-slate-50 border-transparent text-slate-400'
                }`}
            >
              <Icon size={16} />
              {label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">

        {/* Forbidden Items - Rule Engine Visualized */}
        <div className="p-4">
          <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-5 flex gap-4 items-center shadow-inner">
            <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-black text-red-700 uppercase tracking-[0.15em] mb-1">Evitar (Incompatibles con ADN)</h4>
              <p className="text-xs text-red-900 font-bold leading-relaxed">
                {derivedForbidden.join(' • ')}
              </p>
            </div>
          </div>
        </div>

        {/* Foods Mapping */}
        <div className="px-4 space-y-8">
          {sortedCategories.map((category) => (
            <div key={category} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-sm shadow-primary/40"></div>
                <h3 className="text-sm font-black text-darkBlue uppercase tracking-widest">
                  {category}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {groupedFoods[category].map((food) => {
                  const isFav = favorites.includes(food.id);
                  return (
                    <div
                      key={food.id}
                      className={`relative bg-white rounded-[1.75rem] p-5 shadow-sm border-2 transition-all flex items-center gap-4 ${food.isClinicalPriority ? 'border-primary/20 bg-sky-50/20' : 'border-white hover:border-slate-100'
                        }`}
                    >
                      {food.isClinicalPriority && (
                        <div className="absolute -top-2 right-6 bg-primary text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md">
                          <Zap size={10} fill="currentColor" />
                          Prioridad Clínica
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${food.isClinicalPriority ? 'bg-primary text-white' : 'bg-slate-50 text-primary'
                        }`}>
                        <Check size={22} strokeWidth={4} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-darkBlue text-base leading-tight truncate">{food.name}</h4>
                        {food.notes && (
                          <p className="text-[11px] font-bold text-slate-400 mt-1 truncate italic">
                            {food.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(food.id, e)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFav ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-200'
                          }`}
                      >
                        <Heart size={18} fill={isFav ? "white" : "none"} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-12 pb-24 text-center opacity-40">
          <p className="text-[9px] font-black text-darkBlue uppercase tracking-widest flex items-center justify-center gap-2">
            <Star size={10} /> Algoritmos Nutricionales Doctor Antivejez <Star size={10} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutrigenomicsView;
