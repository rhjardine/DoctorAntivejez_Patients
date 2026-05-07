import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Coffee,
  Sun,
  Moon,
  Leaf,
  ShieldAlert,
  Stethoscope,
  Droplet,
  Star,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Dna,
  BookOpen,
  Heart,
  Activity,
  Zap,
} from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProtocolService } from '../services/protocolService';
import {
  DEFAULTS_O_B,
  DEFAULTS_A_AB,
  DEFAULTS_COMUNES,
} from '../services/nutrigenomicaDefaults';

interface Props {
  onBack: () => void;
}

const SECTION_TABS = [
  { id: 'diario', label: 'Plan', icon: ClipboardList },
  { id: 'guia', label: 'Guía', icon: BookOpen },
  { id: 'claves', label: '5A', icon: Zap },
  { id: 'terapias', label: '4R', icon: Activity },
] as const;

type SectionTab = (typeof SECTION_TABS)[number]['id'];

const MEAL_TABS = [
  { id: 'desayuno', label: 'Desayuno', icon: Coffee },
  { id: 'almuerzo', label: 'Almuerzo', icon: Sun },
  { id: 'cena', label: 'Cena', icon: Moon },
  { id: 'meriendas', label: 'Meriendas', icon: Leaf },
] as const;

type MealTab = (typeof MEAL_TABS)[number]['id'];

const TIPO_LABELS: Record<string, string> = {
  tipoNino: 'Niño',
  tipoMetabolica: 'Metabólica',
  tipoAntidiabetica: 'Antidiabética',
  tipoCitostatica: 'Citostática',
  tipoRenal: 'Renal',
};

const DoctorNutritionPlanView: React.FC<Props> = ({ onBack }) => {
  const { session } = useAuthStore();
  const { profileData, setProfileData } = useProfileStore();
  const alimentacion = profileData?.alimentacion;
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [hasAttemptedPlanLoad, setHasAttemptedPlanLoad] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionTab>('diario');
  const [activeMeal, setActiveMeal] = useState<MealTab>('desayuno');

  useEffect(() => {
    if (
      !session ||
      isLoadingPlan ||
      hasAttemptedPlanLoad ||
      alimentacion !== undefined
    )
      return;

    const loadDoctorNutritionPlan = async () => {
      setIsLoadingPlan(true);
      try {
        const profile = await ProtocolService.getMyProfile();
        if (profile) {
          setProfileData({
            biologicalAge:
              profile.biophysics?.biologicalAge ??
              profile.biologicalAge ??
              null,
            chronologicalAge: profile.chronologicalAge ?? null,
            guides: profile.guides || [],
            foodPlans: profile.foodPlans || [],
            bloodType: profile.bloodType || null,
            latestNlr: profile.latestNlr || null,
            firstName: profile.firstName,
            alimentacion: profile.alimentacion ?? null,
            fetchedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error(
          '[DoctorNutritionPlanView] Error loading nutrition plan',
          error,
        );
      } finally {
        setHasAttemptedPlanLoad(true);
        setIsLoadingPlan(false);
      }
    };

    loadDoctorNutritionPlan();
  }, [
    session,
    isLoadingPlan,
    hasAttemptedPlanLoad,
    alimentacion,
    setProfileData,
  ]);

  const defaults = useMemo(() => {
    const grupo = alimentacion?.grupoSanguineo;
    return grupo === 'A_AB' ? DEFAULTS_A_AB : DEFAULTS_O_B;
  }, [alimentacion?.grupoSanguineo]);

  // Datos del plan – priorizar lo que guardó el médico, con fallback a defaults
  const planAlimentario = useMemo(
    () => ({
      desayuno: alimentacion?.planAlimentario?.desayuno ?? defaults.desayuno,
      almuerzo: alimentacion?.planAlimentario?.almuerzo ?? defaults.almuerzo,
      cena: alimentacion?.planAlimentario?.cenaComunes ?? defaults.cena.comunes,
      meriendas:
        alimentacion?.planAlimentario?.meriendas ?? DEFAULTS_COMUNES.meriendas,
    }),
    [alimentacion, defaults],
  );

  const alimentosEvitar = useMemo(
    () =>
      alimentacion?.alimentosEvitar
        ? alimentacion.alimentosEvitar.split('\n')
        : DEFAULTS_COMUNES.alimentosEvitar,
    [alimentacion],
  );

  const sustitutos = useMemo(
    () =>
      alimentacion?.sustitutos
        ? alimentacion.sustitutos.split('\n')
        : DEFAULTS_COMUNES.sustitutos,
    [alimentacion],
  );

  const claves5a = useMemo(
    () => alimentacion?.claves5a || DEFAULTS_COMUNES.claves5a,
    [alimentacion],
  );
  const terapias4r = useMemo(
    () => alimentacion?.terapias4r || DEFAULTS_COMUNES.terapias4r,
    [alimentacion],
  );

  const tiposActivos = useMemo(() => {
    if (!alimentacion) return [];
    return Object.entries(TIPO_LABELS)
      .filter(([key]) => (alimentacion as any)[key] === true)
      .map(([, label]) => label);
  }, [alimentacion]);

  if (isLoadingPlan || (!hasAttemptedPlanLoad && alimentacion === undefined)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-10 text-center">
        <div className="w-14 h-14 border-4 border-[#23BCEF] border-t-transparent rounded-full animate-spin mb-6" />
        <h3 className="text-xl font-black text-[#293b64] uppercase tracking-tighter mb-2">
          Sincronizando alimentación
        </h3>
        <p className="text-xs font-bold text-slate-500 italic">
          Consultando la indicación médica enviada desde la webapp.
        </p>
      </div>
    );
  }

  // -- Sin datos del médico --
  if (!alimentacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-10 text-center">
        <div className="bg-amber-50 p-6 rounded-[2.5rem] mb-6 border border-amber-100 animate-pulse">
          <AlertTriangle size={48} className="text-amber-500 mx-auto" />
        </div>
        <h3 className="text-xl font-black text-[#293b64] uppercase tracking-tighter mb-2">
          Plan en Preparación
        </h3>
        <p className="text-xs font-bold text-slate-500 italic mb-8">
          Tu médico aún no ha configurado y enviado tu plan de alimentación
          nutrigenómica personalizado.
        </p>
        <button
          onClick={onBack}
          className="bg-[#293b64] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] animate-in slide-in-from-right duration-500 fixed inset-0 z-50 overflow-hidden">
      {/* Header Moderno */}
      <div className="bg-[#293b64] px-5 pt-12 pb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#23BCEF]/10 rounded-full -mr-16 -mt-16 blur-3xl" />

        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl active:scale-90 transition-all border border-white/5"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="text-center flex-1 px-4">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#23BCEF] animate-pulse" />
              <span className="text-[9px] font-black text-[#23BCEF] uppercase tracking-[0.2em] opacity-90">
                Dr. Antivejez · 2024
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight leading-none uppercase">
              Guía de Alimentación
            </h2>
            <h2 className="text-lg font-black text-[#23BCEF] tracking-tight leading-none uppercase mt-0.5">
              Personalizada
            </h2>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-[#23BCEF]/20 rounded-2xl border border-[#23BCEF]/30 shadow-[0_0_15px_rgba(35,188,239,0.2)]">
            <Dna size={22} className="text-[#23BCEF] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Barra de Tabs de Sección (Bottom navigation style) */}
      <div className="flex bg-white px-2 py-3 border-b border-slate-100 shadow-sm gap-1 overflow-x-auto no-scrollbar">
        {SECTION_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex flex-1 items-center justify-center gap-2 py-3 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-[#293b64] text-white shadow-lg scale-105'
                  : 'bg-transparent text-slate-400 font-bold'
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] uppercase font-black tracking-wider">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC]">
        {/* 1. SECCIÓN: PLAN DIARIO (CON TABS DE COMIDA) */}
        {activeSection === 'diario' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Meal Tabs */}
            <div className="flex gap-2 px-5 py-4 overflow-x-auto no-scrollbar">
              {MEAL_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveMeal(id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black transition-all border-2 whitespace-nowrap ${
                    activeMeal === id
                      ? 'bg-[#23BCEF] border-[#23BCEF] text-white shadow-md'
                      : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={14} />
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* List of items */}
            <div className="px-5 space-y-3 pb-10">
              {(planAlimentario[activeMeal] || []).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#23BCEF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#23BCEF] transition-colors">
                    <CheckCircle2
                      size={18}
                      className="text-[#23BCEF] group-hover:text-white"
                    />
                  </div>
                  <span className="text-sm font-bold text-[#293b64] leading-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. SECCIÓN: GUÍA GENERAL */}
        {activeSection === 'guia' && (
          <div className="px-5 pt-6 space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Evitar */}
            <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-500 rounded-xl text-white">
                  <ShieldAlert size={20} />
                </div>
                <h4 className="text-[11px] font-black text-red-700 uppercase tracking-widest">
                  Incompatibles
                </h4>
              </div>
              <div className="space-y-2">
                {alimentosEvitar.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-xs text-red-900 font-bold leading-relaxed opacity-90"
                  >
                    <span className="shrink-0 text-red-400">•</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Sustitutos */}
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                  <Heart size={20} />
                </div>
                <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                  Sustitutos Sanos
                </h4>
              </div>
              <div className="space-y-2">
                {sustitutos.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-xs text-emerald-900 font-bold leading-relaxed opacity-90"
                  >
                    <span className="shrink-0 text-emerald-400">•</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. SECCIÓN: CLAVES 5A */}
        {activeSection === 'claves' && (
          <div className="px-5 pt-6 space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {claves5a.map((clave: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#23BCEF]/10 flex items-center justify-center text-xl shadow-inner">
                    {clave.icono}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#293b64] uppercase tracking-widest">
                      {clave.clave}
                    </h4>
                    <div className="h-1 w-8 bg-[#23BCEF] rounded-full mt-1 opacity-50" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  {clave.items.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 text-xs font-bold text-slate-500 leading-relaxed pl-2"
                    >
                      <span className="text-[#23BCEF] mt-0.5 whitespace-nowrap">
                        🔸
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. SECCIÓN: TERAPIAS 4R */}
        {activeSection === 'terapias' && (
          <div className="px-5 pt-6 space-y-5 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {terapias4r.map((t: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#23BCEF]" />
                <div className="mb-4">
                  <h3 className="text-sm font-black text-[#293b64] uppercase tracking-tight">
                    {t.nombre}
                  </h3>
                  <p className="text-[11px] font-black text-[#23BCEF] italic mt-0.5 opacity-80">
                    "{t.slogan}"
                  </p>
                </div>
                <ul className="space-y-3">
                  {t.items.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-3 text-xs font-bold text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100"
                    >
                      <Zap
                        size={14}
                        className="text-amber-400 shrink-0"
                        fill="currentColor"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Footer del plan */}
        <div className="px-5 py-10 opacity-40 text-center">
          <p className="text-[8px] font-black text-[#293b64] uppercase tracking-[0.3em]">
            Documento Médico Digital • Protocolo Antivejez
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorNutritionPlanView;
