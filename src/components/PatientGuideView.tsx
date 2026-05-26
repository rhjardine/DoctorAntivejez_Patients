import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatientProtocol, TimeSlot, ProtocolCategory, COLORS } from '../types';
import {
  Sun,
  Moon,
  Sunset,
  CheckCircle2,
  Pill,
  Activity,
  Zap,
  ClipboardCheck,
  Trash2,
  RefreshCw,
  Flame,
  Sparkles as SparklesIcon,
  Leaf,
  Droplet,
  Stethoscope,
  ChevronRight,
  Check,
  ClipboardList,
  ChevronDown,
  FileSearch,
  MessageSquareQuote,
  AlertTriangle,
  Clock,
  Info,
  Bell,
  X,
  HeartPulse // Añadido para el Hero Section
} from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { normalizePatientProtocol } from '../services/clinicalPayloadNormalizer';

interface PatientGuideViewProps {
  items: PatientProtocol[];
  loading?: boolean;
  onInfoPress?: () => void;
  onToggleItem: (id: string) => void;
  onRefresh?: () => void;
}

type ViewMode = 'PLAN' | 'TRACK';

const LAST_SEEN_KEY = 'rejuvenate_last_guide_seen';

const CATEGORY_LABELS: Record<string, string> = {
  REMOVAL_PHASE: 'Fase de Remoción',
  REVITALIZATION_PHASE: 'Fase de Revitalización',
  REGENERATION_PHASE: 'Fase de Regeneración',
  RESTORATION_PHASE: 'Fase de Restauración',
  PRIMARY_NUTRACEUTICALS: 'Nutracéuticos Primarios',
  SECONDARY_NUTRACEUTICALS: 'Nutracéuticos Secundarios',
  COMPLEMENTARY_NUTRACEUTICALS: 'Nutracéuticos Complementarios',
  METABOLIC_ACTIVATOR: 'Activador Metabólico',
  COSMECEUTICALS: 'Cosmecéuticos',
  NATURAL_FORMULAS: 'Fórmulas Naturales',
  ANTI_AGING_SERUMS: 'Sueros — Shot Antivejez',
  ANTI_AGING_THERAPIES: 'Terapias Antienvejecimiento',
  BIO_NEURAL_THERAPY: 'Terapia BioNeural',
  THERAPY_CONTROL: 'Control de Terapia',
};

// Componente Sparkles SVG para la animación de edad biológica menor (Efecto Wow)
const Sparkles = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

// Variantes de animación para Framer Motion (Efecto Cascada)
const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PatientGuideView: React.FC<PatientGuideViewProps> = ({
  items,
  loading,
  onInfoPress,
  onToggleItem,
  onRefresh,
}) => {
  const { profileData } = useProfileStore();
  const [viewMode, setViewMode] = useState<ViewMode>('PLAN');
  const [activeTab, setActiveTab] = useState<TimeSlot>('MORNING');
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewGuideBanner, setShowNewGuideBanner] = useState(false);

  // Extracción de Edades para el Hero Section
  const bioAge = profileData?.biologicalAge || 0;
  const chronoAge = profileData?.chronologicalAge || 0;
  const isYounger = bioAge > 0 && bioAge < chronoAge;

  // Check if a newer guide is available vs last seen
  useEffect(() => {
    if (profileData?.guides?.length > 0) {
      const latestGuide = profileData.guides[0];
      const latestDate = latestGuide?.createdAt;
      if (!latestDate) return;
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      if (!lastSeen || new Date(latestDate) > new Date(lastSeen)) {
        setShowNewGuideBanner(true);
      }
    }
  }, [profileData]);

  const dismissBanner = () => {
    if (profileData?.guides?.length > 0) {
      const latestDate = profileData.guides[0]?.createdAt;
      if (latestDate) localStorage.setItem(LAST_SEEN_KEY, latestDate);
    }
    setShowNewGuideBanner(false);
  };

  // Data Binding Fix: normalize the latest Next/webapp payload shape and fall back to props.
  const { effectiveItems, parseError } = useMemo(() => {
    try {
      const normalizedItems = normalizePatientProtocol(profileData);
      return { 
        effectiveItems: normalizedItems.length > 0 ? normalizedItems : items, 
        parseError: false 
      };
    } catch (error) {
      if (error instanceof Error && error.message === "CLINICAL_PARSE_FAILED") {
        return { effectiveItems: [], parseError: true };
      }
      throw error;
    }
  }, [profileData, items]);

  // Group items by category dynamically
  const activeCategories = useMemo(() => {
    const groups: Record<string, PatientProtocol[]> = {};
    effectiveItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [effectiveItems]);

  const sortedActiveCategoryTypes = useMemo(() => {
    return (Object.keys(activeCategories) as ProtocolCategory[]).sort();
  }, [activeCategories]);

  const completedCount = effectiveItems.filter(
    (i) => i.status === 'completed',
  ).length;
  const totalCount = effectiveItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleManualRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1500);
    }
  };

  const toggleCategory = (type: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'REMOVAL_PHASE':
        return <Trash2 size={14} />;
      case 'REVITALIZATION_PHASE':
        return <RefreshCw size={14} />;
      case 'PRIMARY_NUTRACEUTICALS':
        return <Pill size={14} />;
      case 'SECONDARY_NUTRACEUTICALS':
        return <Pill size={14} className="opacity-70" />;
      case 'METABOLIC_ACTIVATOR':
        return <Flame size={14} />;
      case 'COSMECEUTICALS':
        return <SparklesIcon size={14} />;
      case 'NATURAL_FORMULAS':
        return <Leaf size={14} />;
      case 'ANTI_AGING_SERUMS':
        return <Droplet size={14} />;
      case 'ANTI_AGING_THERAPIES':
        return <Activity size={14} />;
      case 'THERAPY_CONTROL':
        return <FileSearch size={14} />;
      default:
        return <Zap size={14} />;
    }
  };

  const getSlotLabel = (slot: TimeSlot) => {
    switch (slot) {
      case 'MORNING':
        return 'Mañana';
      case 'AFTERNOON':
        return 'Tarde';
      case 'EVENING':
        return 'Noche';
      default:
        return 'Cualquier momento';
    }
  };

  // Skeleton Mejorado (Efecto Wow)
  const renderSkeleton = () => (
    <div className="flex flex-col gap-4 p-4">
      {/* Skeleton del Hero Section */}
      <div className="bg-gradient-to-br from-[#293B64] to-slate-800 rounded-3xl p-6 shadow-lg animate-pulse h-48 w-full mb-2"></div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-[2rem] p-5 shadow-sm border-2 border-slate-50 animate-pulse"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );

  const renderItemCard = (item: PatientProtocol) => {
    const isCompleted = item.status === 'completed';
    const hasNotes = !!item.observations && item.observations.trim().length > 0;
    const isNoteExpanded = expandedNotes.has(item.id);

    return (
      <motion.div
        variants={itemVariants}
        key={item.id}
        className={`group relative flex flex-col bg-white rounded-[2rem] shadow-sm transition-all duration-300 border-2 overflow-hidden ${isCompleted
            ? 'bg-emerald-50/30 border-emerald-100 opacity-80'
            : 'border-white hover:border-sky-100 shadow-md shadow-slate-200/50'
          }`}
      >
        <div
          onClick={() => onToggleItem(item.id)}
          className="flex items-center gap-5 p-5 cursor-pointer"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0 ${isCompleted
                ? 'bg-emerald-500 text-white rotate-[360deg]'
                : 'bg-slate-50 border border-slate-200 text-transparent group-hover:border-primary'
              }`}
          >
            <Check
              size={24}
              strokeWidth={4}
              className={
                isCompleted ? 'scale-100' : 'scale-0 transition-transform'
              }
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-black text-base leading-tight transition-all truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-[#293B64]'
                }`}
            >
              {item.itemName}
            </h3>

            <div className="flex flex-col gap-1.5 mt-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${isCompleted
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-sky-50 text-primary'
                    }`}
                >
                  {getIconByType(item.category)}
                  <span>Dosis: {item.dose}</span>
                </div>
              </div>
              {item.schedule && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-textMedium italic">
                  <Clock size={12} className="text-slate-300" />
                  <span>{item.schedule}</span>
                </div>
              )}
            </div>
          </div>

          {hasNotes && (
            <button
              onClick={(e) => toggleNote(item.id, e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${isNoteExpanded
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-50 text-slate-300'
                }`}
            >
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${isNoteExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Branded Collapsible Note Area */}
        {hasNotes && isNoteExpanded && (
          <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 rounded-2xl border flex gap-3 shadow-inner bg-amber-50 border-amber-100">
              <div className="shrink-0 text-amber-500">
                <MessageSquareQuote size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-amber-700">
                  Observación del Médico
                </span>
                <p className="text-xs leading-relaxed font-bold italic text-amber-900 whitespace-pre-wrap break-words">
                  {item.observations}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderTrackMode = () => {
    const filteredItems = effectiveItems.filter((item) => {
      if (activeTab === 'ANYTIME') return true;
      return item.timeSlot === activeTab || item.timeSlot === 'ANYTIME';
    });

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1 bg-[#F8FAFC]"
      >
        <div className="px-6 py-3 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Adherencia al Tratamiento
            </span>
            <span className="text-sm font-black text-primary">
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out shadow-sm shadow-primary/30"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex p-4 gap-3 bg-white">
          {(['MORNING', 'AFTERNOON', 'EVENING'] as TimeSlot[]).map((slot) => {
            const isActive = activeTab === slot;
            let Icon = Sun;
            if (slot === 'AFTERNOON') Icon = Sunset;
            if (slot === 'EVENING') Icon = Moon;

            return (
              <button
                key={slot}
                onClick={() => setActiveTab(slot)}
                className={`flex-1 flex flex-col items-center justify-center p-3.5 rounded-[1.5rem] transition-all border-2 ${isActive ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'}`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 3 : 2}
                  className="mb-1"
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-500'}`}
                >
                  {getSlotLabel(slot)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto no-scrollbar pb-10">
          {filteredItems.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 text-center opacity-30">
              <ClipboardList size={54} className="mb-4 text-slate-300" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Sin tareas en este bloque
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item) => renderItemCard(item))
          )}
          {/* Rigor Clínico Persistent Access */}
          <motion.div variants={itemVariants} className="pt-6 pb-24 text-center">
            <button
              onClick={onInfoPress}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary hover:bg-white transition-all shadow-sm"
            >
              <Info size={14} />
              Rigor Clínico y Biomarcadores
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderPlanMode = () => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 bg-[#F8FAFC] px-4 py-3 space-y-4 overflow-y-auto no-scrollbar pb-32"
      >
        {/* HERO SECTION: EDAD BIOLÓGICA (Efecto Wow) */}
        <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-br from-[#293B64] to-slate-900 rounded-3xl p-6 text-white shadow-xl mb-4">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <HeartPulse className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <h2 className="text-primary/90 text-sm font-bold uppercase tracking-wider mb-1">
              Mi Perfil de Longevidad
            </h2>
            <p className="text-slate-300 text-[11px] mb-6">Basado en tus últimos biomarcadores clínicos</p>

            <div className="flex items-end gap-6">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold mb-1 tracking-widest">Edad Celular</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">{bioAge || '--'}</span>
                  <span className="text-primary text-lg font-medium">años</span>
                </div>
              </div>

              <div className="pb-1 border-l border-slate-700 pl-6">
                <p className="text-slate-400 text-[10px] uppercase font-semibold mb-1 tracking-widest">Edad Cronológica</p>
                <p className="text-xl font-medium text-slate-300">{chronoAge || '--'} años</p>
              </div>
            </div>

            {isYounger && (
              <div className="mt-6 inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-black tracking-wide border border-primary/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                ¡Felicidades! Tu edad celular es {chronoAge - bioAge} años menor.
              </div>
            )}
          </div>
        </motion.div>

        {sortedActiveCategoryTypes.map((catType) => {
          const categoryItems = activeCategories[catType];
          const isExpanded = expandedCategories[catType] ?? true;

          return (
            <motion.div
              variants={itemVariants}
              key={catType}
              className="rounded-[1.5rem] overflow-hidden shadow-lg border border-slate-100"
            >
              <button
                onClick={() => toggleCategory(catType)}
                className="w-full bg-[#293B64] text-white px-5 py-4 flex items-center justify-between transition-colors hover:bg-[#1A253C]"
              >
                <div className="flex items-center gap-3">
                  {getIconByType(catType)}
                  <h3 className="font-black text-[13px] uppercase tracking-widest text-left">
                    {CATEGORY_LABELS[catType] || catType}
                  </h3>
                </div>
                <ChevronDown
                  size={20}
                  className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`bg-white transition-all overflow-hidden ${isExpanded ? 'max-h-[3000px]' : 'max-h-0'}`}
              >
                <div className="p-4 space-y-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 shadow-inner"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-darkBlue text-base leading-tight flex-1">
                          {item.itemName}
                        </h4>
                        <span className="text-[9px] font-black text-primary bg-white px-3 py-1.5 rounded-xl uppercase tracking-tighter border border-sky-100 shadow-sm">
                          {getSlotLabel(item.timeSlot)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 mb-4">
                        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100">
                          <Stethoscope size={14} className="text-primary" />
                          <p className="text-xs font-black text-darkBlue uppercase tracking-tighter">
                            Dosis:{' '}
                            <span className="text-primary">{item.dose}</span>
                          </p>
                        </div>
                        {item.schedule && (
                          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100">
                            <Clock size={14} className="text-slate-400" />
                            <p className="text-xs font-bold text-textMedium italic">
                              {item.schedule}
                            </p>
                          </div>
                        )}
                      </div>
                      {item.observations && (
                        <div className="p-4 rounded-2xl border flex gap-3 shadow-inner bg-amber-50 border-amber-100">
                          <MessageSquareQuote
                            size={16}
                            className="text-amber-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black uppercase block mb-1 text-amber-700 tracking-widest">
                              Observación del Médico
                            </span>
                            <p className="text-xs leading-relaxed font-bold italic text-amber-900 whitespace-pre-wrap break-words">
                              {item.observations}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <>
      {/* New Guide Notification Banner */}
      {showNewGuideBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-amber-400 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-amber-900 animate-pulse" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-900">
                Protocolo Actualizado
              </p>
              <p className="text-xs font-bold text-amber-800">
                Tu doctor ha actualizado tu guía de tratamiento
              </p>
            </div>
          </div>
          <button
            onClick={dismissBanner}
            className="w-8 h-8 flex items-center justify-center bg-amber-500 rounded-xl text-amber-900 hover:bg-amber-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="bg-white pt-6 pb-4 px-6 border-b border-slate-100 shadow-sm z-20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-[20px] font-black text-[#293B64] leading-none tracking-tighter uppercase">
                Tu Guía de Salud Personalizada
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-primary animate-pulse'}`}
                ></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Sincronizado via Prisma
                </span>
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              className={`w-12 h-12 bg-sky-50 rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner transition-transform active:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <ClipboardCheck size={24} />
            </button>
          </div>

          {effectiveItems.length > 0 && !loading && (
            <div className="bg-slate-50 p-1 rounded-2xl flex relative h-11 shadow-inner border border-slate-100 mt-2">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md transition-all duration-300 border border-slate-100 ${viewMode === 'TRACK' ? 'left-[calc(50%+2px)]' : 'left-1'}`}
              ></div>
              <button
                onClick={() => setViewMode('PLAN')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[9.5px] font-black uppercase tracking-widest z-10 transition-colors ${viewMode === 'PLAN' ? 'text-primary' : 'text-slate-400'}`}
              >
                <FileSearch size={14} /> Ver Guía
              </button>
              <button
                onClick={() => setViewMode('TRACK')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[9.5px] font-black uppercase tracking-widest z-10 transition-colors ${viewMode === 'TRACK' ? 'text-primary' : 'text-slate-400'}`}
              >
                <CheckCircle2 size={14} /> Registrar Avances
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          {parseError ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 shadow-inner border border-red-100">
                <AlertTriangle size={48} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">
                  Error de Sincronización
                </h3>
                <p className="text-sm font-bold text-red-500 leading-relaxed max-w-xs italic">
                  Error sincronizando tu guía médica. El formato recibido no es compatible. Por favor contacta soporte.
                </p>
              </div>
              <button
                onClick={handleManualRefresh}
                className="bg-darkBlue text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                Reintentar
              </button>
            </div>
          ) : loading ? (
            renderSkeleton()
          ) : effectiveItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-sky-50 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
                <Stethoscope size={48} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#293B64] uppercase tracking-tighter">
                  Preparando tu Protocolo
                </h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-xs italic">
                  "Tu doctor está preparando tu protocolo personalizado. Pronto
                  recibirás tus indicaciones basadas en tu ciencia biológica."
                </p>
              </div>
              <button
                onClick={handleManualRefresh}
                className="bg-[#293B64] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                Verificar Actualizaciones
              </button>
            </div>
          ) : viewMode === 'TRACK' ? (
            renderTrackMode()
          ) : (
            renderPlanMode()
          )}
        </div>
      </div>
    </>
  );
};

export default PatientGuideView;