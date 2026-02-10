
import React, { useEffect, useState, useMemo } from 'react';
import { ProtocolService } from '../services/protocolService';
import { authService } from '../services/authService';
import { useProfileStore } from '../store/useProfileStore';
import { NutrigenomicPlan, MealType, NutrigenomicFood, BloodType, DietType } from '../types';
import {
  ChevronLeft, Sun, Sunset, Moon, Coffee, AlertCircle, Droplet,
  ChefHat, Leaf, Check, Heart, Info, Zap, Star, ShieldAlert, X,
  Activity, Microscope
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
  const { profileData } = useProfileStore(); // FIXED: Added missing hook usage
  const [plan, setPlan] = useState<NutrigenomicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MealType>('BREAKFAST');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<NutrigenomicFood | null>(null); // Added state
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

  const derivedForbidden = useMemo(() => {
    const effectiveBloodType = (profileData?.bloodType as BloodType) || plan?.bloodType || 'O';

    const bloodRules = BLOOD_TYPE_RESTRICTIONS[effectiveBloodType] || [];
    // Merge backend forbidden with local rules, removing duplicates
    return Array.from(new Set([...bloodRules, ...(plan?.forbidden || [])]));
  }, [plan, profileData]);

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

      {/* Food Details Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-sky-50 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-sky-100">
                    {selectedFood.category}
                  </span>
                  {selectedFood.isClinicalPriority && (
                    <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md shadow-primary/30">
                      <Zap size={10} fill="currentColor" /> Prioridad
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-darkBlue leading-tight">{selectedFood.name}</h2>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-emerald-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto Metabólico Estimado</h4>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-darkBlue">Alto</span>
                  <span className="text-xs font-bold text-emerald-500 mb-1">Optimización Mitocondrial</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Microscope size={64} className="text-amber-600" />
                </div>
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold border border-amber-200">Dr</span>
                    <h4 className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">Nota del Dr. Antivejez</h4>
                  </div>
                  <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                    "{selectedFood.notes || "Este alimento ha sido seleccionado específicamente para tu genotipo debido a su capacidad para reducir la inflamación sistémica y mejorar la señalización celular."}"
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedFood(null)}
              className="w-full bg-darkBlue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

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
                      onClick={() => setSelectedFood(food)} // Added click handler
                      className={`relative bg-white rounded-[1.75rem] p-5 shadow-sm border-2 transition-all flex items-center gap-4 cursor-pointer active:scale-[0.98] ${food.isClinicalPriority ? 'border-primary/20 bg-sky-50/20' : 'border-white hover:border-slate-100'
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
