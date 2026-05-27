import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nutritionService } from '../services/nutritionService';
import { authService } from '../services/authService';
import { useProfileStore } from '../store/useProfileStore';
import { NutrigenomicPlan, MealType, NutrigenomicFood, BloodType, DietType } from '../types';
import {
  ChevronLeft, Sun, Sunset, Moon, Coffee, AlertCircle, Droplet,
  ChefHat, Leaf, Check, Heart, Info, Zap, Star, ShieldAlert, X,
  Activity, Microscope, Utensils
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

// --- COMPONENTES SKELETON (EFECTO CARGA PREMIUM) ---
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm w-full">
    <div className="flex gap-4 items-center animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0"></div>
      <div className="flex-1 space-y-3 py-1 w-full">
        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
      </div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0"></div>
    </div>
  </div>
);

const SkeletonNutrition = () => (
  <div className="space-y-6 w-full h-full bg-[#F8FAFC]">
    <div className="bg-gradient-to-br from-emerald-800 to-teal-950 px-6 pt-12 pb-8 shadow-xl z-20 animate-pulse h-40 w-full rounded-b-3xl"></div>
    <div className="flex gap-2 px-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
    </div>
    <div className="px-4 space-y-4">
      <div className="h-20 bg-red-50 rounded-[2rem] animate-pulse"></div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

// --- VARIANTES DE ANIMACIÓN ---
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const NutrigenomicsView: React.FC<NutrigenomicsViewProps> = ({ onBack }) => {
  const { profileData } = useProfileStore();
  const [plan, setPlan] = useState<NutrigenomicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MealType>('BREAKFAST');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<NutrigenomicFood | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await nutritionService.getSmartNutritionPlan();
        setPlan(data);
      } catch (e) {
        console.error("Error loading nutrigenomics", e);
      } finally {
        setTimeout(() => setLoading(false), 600); // Simulamos delay para el Wow Effect
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
    return Array.from(new Set([...bloodRules, ...(plan?.forbidden || [])]));
  }, [plan, profileData]);

  const groupedFoods = useMemo(() => {
    if (!plan) return {};
    const foodsInMeal = plan.foods.filter(f => f.mealTypes.includes(activeTab));
    const groups: Record<string, NutrigenomicFood[]> = {};

    foodsInMeal.forEach(food => {
      const cat = food.category || 'General';
      if (!groups[cat]) groups[cat] = [];

      const isPriority = food.isClinicalPriority ||
        (plan.dietTypes.includes('METABOLIC') && (cat === 'Proteína' || cat === 'Grasas Saludables')) ||
        (plan.dietTypes.includes('RENAL') && cat === 'Vegetales');

      groups[cat].push({ ...food, isClinicalPriority: isPriority });
    });
    return groups;
  }, [plan, activeTab]);

  if (loading) {
    return <SkeletonNutrition />;
  }

  if (!plan) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] p-10 text-center"
      >
        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
          <ChefHat size={40} className="text-emerald-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-[#293B64] uppercase tracking-tighter mb-2">Plan en Preparación</h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed italic mb-8 max-w-xs">
          Tu equipo médico está diseñando tu plan de alimentación basado en tu genética y metabolismo celular.
        </p>
        <button onClick={onBack} className="bg-[#293B64] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
          Volver al Inicio
        </button>
      </motion.div>
    );
  }

  const categoryOrder = ['Beneficios', 'Neutros', 'Evitar'];
  const sortedCategories = Object.keys(groupedFoods).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] animate-in slide-in-from-right duration-500 absolute inset-0 z-40 overflow-hidden">

      {/* Food Details Modal con Animación Premium */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                      {selectedFood.category}
                    </span>
                    {selectedFood.isClinicalPriority && (
                      <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md shadow-primary/30">
                        <Zap size={10} fill="currentColor" /> Prioridad
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-[#293B64] leading-tight">{selectedFood.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto Metabólico Estimado</h4>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-[#293B64]">Alto</span>
                    <span className="text-xs font-bold text-emerald-500 mb-1">Optimización Mitocondrial</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Microscope size={64} className="text-amber-600" />
                  </div>
                  <div className="relative z-10 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold border border-amber-200">Dr</span>
                      <h4 className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">Nota del Especialista</h4>
                    </div>
                    <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                      "{selectedFood.notes || "Alimento seleccionado específicamente para tu genotipo debido a su capacidad para reducir la inflamación y mejorar la señalización celular."}"
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFood(null)}
                className="w-full bg-[#293B64] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER PREMIUM (Hero Section con Gradiente) */}
      <div className="relative bg-gradient-to-br from-emerald-800 to-teal-950 px-4 pt-12 pb-6 shadow-xl z-20 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Utensils className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl active:scale-90 transition-transform backdrop-blur-sm">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-black text-white leading-none tracking-tight uppercase">Nutrición Genómica</h2>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em] mt-1 block">Tipo {plan.bloodType} • {plan.dietTypes.join(' + ')}</span>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl backdrop-blur-sm">
              <Droplet size={20} className="text-emerald-300" fill="currentColor" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {plan.dietTypes.map(type => (
              <span key={type} className="bg-white/10 border border-white/20 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                <Star size={10} className="text-accentYellow" fill="currentColor" />
                Enfoque {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* TABS ELEGANTES */}
      <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar py-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealType[]).map((tab) => {
          const isActive = activeTab === tab;
          const Icon = tab === 'BREAKFAST' ? Coffee : tab === 'LUNCH' ? Sun : tab === 'DINNER' ? Moon : Leaf;
          const label = tab === 'BREAKFAST' ? 'Desayuno' : tab === 'LUNCH' ? 'Almuerzo' : tab === 'DINNER' ? 'Cena' : 'Meriendas';

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black transition-all border-2 shrink-0 ${isActive
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                }`}
            >
              <Icon size={16} />
              {label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto no-scrollbar pb-32"
      >
        {/* BANNER DE RESTRICCIONES (Motor de Reglas) */}
        {derivedForbidden.length > 0 && (
          <motion.div variants={itemVariants} className="p-4">
            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-5 flex gap-4 items-center shadow-inner">
              <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-rose-700 uppercase tracking-[0.15em] mb-1">Evitar (Incompatibles)</h4>
                <p className="text-xs text-rose-900 font-bold leading-relaxed">
                  {derivedForbidden.join(' • ')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* LISTADO DE ALIMENTOS CON ANIMACIÓN */}
        <div className="px-4 space-y-8 mt-2">
          {sortedCategories.map((category) => (
            <motion.div variants={itemVariants} key={category}>
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/40"></div>
                <h3 className="text-sm font-black text-[#293B64] uppercase tracking-widest">
                  {category}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {groupedFoods[category]?.map((food) => {
                  const isFav = favorites.includes(food.id);
                  return (
                    <motion.div
                      variants={itemVariants}
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={`relative bg-white rounded-[1.75rem] p-5 shadow-sm border-2 transition-all flex items-center gap-4 cursor-pointer active:scale-[0.98] ${food.isClinicalPriority ? 'border-emerald-200 bg-emerald-50/30' : 'border-white hover:border-slate-100'
                        }`}
                    >
                      {food.isClinicalPriority && (
                        <div className="absolute -top-2 right-6 bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md shadow-emerald-500/30">
                          <Zap size={10} fill="currentColor" />
                          Prioridad Clínica
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${food.isClinicalPriority ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-emerald-600'
                        }`}>
                        <Check size={22} strokeWidth={4} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[#293B64] text-base leading-tight truncate">{food.name}</h4>
                        {food.notes && (
                          <p className="text-[11px] font-bold text-slate-400 mt-1 truncate italic">
                            {food.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(food.id, e)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFav ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                          }`}
                      >
                        <Heart size={18} fill={isFav ? "white" : "none"} strokeWidth={3} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="pt-12 pb-24 text-center opacity-40">
          <p className="text-[9px] font-black text-[#293B64] uppercase tracking-widest flex items-center justify-center gap-2">
            <Star size={10} /> Algoritmos Nutricionales Doctor Antivejez <Star size={10} />
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NutrigenomicsView;