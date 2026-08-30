import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatientProtocol, TimeSlot, ProtocolCategory, COLORS } from '../types';
import {
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
  Check,
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
import {
  groupForCategory,
  THERAPY_GROUP_LABELS,
  type TherapyGroup,
} from '../config/therapyGroups';

interface PatientGuideViewProps {
  items: PatientProtocol[];
  loading?: boolean;
  onInfoPress?: () => void;
  onRefresh?: () => void;
  /** Mensaje visible cuando una marca de adherencia no pudo registrarse. */
  syncError?: string | null;
  onDismissSyncError?: () => void;
}

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
  onRefresh,
  syncError,
  onDismissSyncError,
}) => {
  const { profileData } = useProfileStore();
  const [activeGroup, setActiveGroup] = useState<TherapyGroup>('ORAL');
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

  // Ítems de la pestaña activa: Terapia Oral o Terapéutica (ver config/therapyGroups).
  const groupItems = useMemo(
    () =>
      effectiveItems.filter(
        (item) => groupForCategory(item.category) === activeGroup,
      ),
    [effectiveItems, activeGroup],
  );

  /** Cuántos ítems tiene cada pestaña, para no ofrecer una que está vacía. */
  const groupCounts = useMemo(
    () =>
      effectiveItems.reduce(
        (acc, item) => {
          acc[groupForCategory(item.category)] += 1;
          return acc;
        },
        { ORAL: 0, CLINICAL: 0 } as Record<TherapyGroup, number>,
      ),
    [effectiveItems],
  );

  // Group items by category dynamically
  const activeCategories = useMemo(() => {
    const groups: Record<string, PatientProtocol[]> = {};
    groupItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [groupItems]);

  const sortedActiveCategoryTypes = useMemo(() => {
    return (Object.keys(activeCategories) as ProtocolCategory[]).sort();
  }, [activeCategories]);

  const completedCount = groupItems.filter(
    (i) => i.status === 'completed',
  ).length;
  const totalCount = groupItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleManualRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1500);
    }
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


  /**
   * Terapéutica: procedimientos de consulta.
   *
   * Listado vertical continuo y **solo lectura**, por indicación médica: es una
   * receta oficial, no una lista de tareas. Sin casillas ni acciones — el
   * paciente no ejecuta estos tratamientos, se los aplican en consulta.
   */
  const renderClinicalMode = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] px-5 pt-5 pb-16 space-y-3">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-100 mb-1">
        <Stethoscope size={16} className="text-[#107da8] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium leading-relaxed text-[#293b64]/70">
          Estos procedimientos se realizan <strong>en consulta</strong>. Es tu
          indicación médica oficial; no requiere que registres nada.
        </p>
      </div>

      {groupItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-[1.25rem] px-4 py-4 shadow-sm border border-slate-100"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-black text-[#293b64] leading-snug">
              {item.itemName}
            </h4>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#107da8] bg-[#23bcef]/10 px-2 py-1 rounded-lg whitespace-nowrap shrink-0">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
          </div>

          {(item.dose || item.schedule) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {item.dose && (
                <span className="text-xs font-bold text-slate-500">
                  Dosis: {item.dose}
                </span>
              )}
              {item.schedule && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Clock size={12} /> {item.schedule}
                </span>
              )}
            </div>
          )}

          {item.observations && (
            <p className="mt-2.5 text-[11px] font-medium italic leading-relaxed text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              {item.observations}
            </p>
          )}
        </div>
      ))}
    </div>
  );


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

        {/* Listado vertical continuo, por indicación médica: sin acordeones.
            El paciente lee su tratamiento de arriba abajo sin tener que abrir
            nada. La cabecera de categoría se conserva —ya no como control, sino
            como rótulo— porque agrupa el protocolo tal y como lo prescribió el
            médico y perder esa estructura sería perder información clínica. */}
        {sortedActiveCategoryTypes.map((catType) => {
          const categoryItems = activeCategories[catType];

          return (
            <motion.div
              variants={itemVariants}
              key={catType}
              className="rounded-[1.5rem] overflow-hidden shadow-lg border border-slate-100"
            >
              <div className="w-full bg-[#293B64] text-white px-5 py-3 flex items-center gap-3">
                {getIconByType(catType)}
                <h3 className="font-black text-[13px] uppercase tracking-widest text-left">
                  {CATEGORY_LABELS[catType] || catType}
                </h3>
              </div>
              <div className="bg-white">
                {/* Formato compacto, por indicación médica: nombre, dosis y
                    horario en una línea. Cada dato aparece solo si el médico lo
                    indicó, de modo que un ítem sin posología no deja un hueco. */}
                <div className="p-3 space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 rounded-[1.25rem] bg-slate-50/50 border border-slate-100"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-black text-darkBlue text-[15px] leading-snug flex-1">
                          {item.itemName}
                        </h4>
                        <span className="text-[9px] font-black text-primary bg-white px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-sky-100 shrink-0">
                          {getSlotLabel(item.timeSlot)}
                        </span>
                      </div>

                      {(item.dose || item.schedule) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          {item.dose && (
                            <span className="text-[11px] font-bold text-[#107da8]">
                              {item.dose}
                            </span>
                          )}
                          {item.dose && item.schedule && (
                            <span className="text-[11px] text-slate-300">·</span>
                          )}
                          {item.schedule && (
                            <span className="flex items-center gap-1 text-[11px] font-medium italic text-slate-500">
                              <Clock size={11} className="text-slate-300" />
                              {item.schedule}
                            </span>
                          )}
                        </div>
                      )}

                      {item.observations && (
                        <div className="mt-2.5 p-3 rounded-xl border flex gap-2.5 bg-amber-50 border-amber-100">
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
      {/* Adherence Sync Failure Banner — clinical safety: the patient must know
          when a change was NOT recorded, instead of seeing a checkmark that
          never reaches their doctor. */}
      {syncError && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-5 py-4 bg-red-500 shadow-lg animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-white flex-shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white">
                No se registró tu cambio
              </p>
              <p className="text-xs font-bold text-red-50">{syncError}</p>
            </div>
          </div>
          {onDismissSyncError && (
            <button
              onClick={onDismissSyncError}
              aria-label="Cerrar aviso"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-600 rounded-xl text-white hover:bg-red-700 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
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

          {/* Terapia Oral vs Terapéutica. Solo se ofrece cuando el paciente
              tiene ítems de ambos tipos: una pestaña vacía es ruido. */}
          {effectiveItems.length > 0 && !loading && groupCounts.CLINICAL > 0 && (
            <div className="flex gap-2 mt-3">
              {(['ORAL', 'CLINICAL'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  aria-pressed={activeGroup === group}
                  className={`flex-1 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-widest border-2 transition-all ${
                    activeGroup === group
                      ? 'bg-[#293b64] border-[#293b64] text-white shadow-md'
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {THERAPY_GROUP_LABELS[group]}
                </button>
              ))}
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
          ) : activeGroup === 'CLINICAL' ? (
            renderClinicalMode()
          ) : (
            renderPlanMode()
          )}
        </div>
      </div>
    </>
  );
};

export default PatientGuideView;