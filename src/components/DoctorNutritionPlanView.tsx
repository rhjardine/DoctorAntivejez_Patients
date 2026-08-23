import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Coffee,
  Sun,
  Moon,
  Leaf,
  ShieldAlert,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Dna,
  BookOpen,
  Heart,
  Info,
} from 'lucide-react';
import MealNotesField from './MealNotesField';
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

// Solo dos entradas, por indicación médica. Las pestañas "5A" y "4R" que había
// aquí duplicaban las principales de HomePage (MainTab.KEYS_5A y
// THERAPIES_4R), así que al quitarlas no queda ninguna sección huérfana.
const SECTION_TABS = [
  { id: 'diario', label: 'Plan', icon: ClipboardList },
  { id: 'guia', label: 'Guía', icon: BookOpen },
] as const;

type SectionTab = (typeof SECTION_TABS)[number]['id'];

// Las comidas ya no son pestañas: se recorren en scroll vertical continuo, en
// el orden en que transcurre el día.
const MEALS = [
  { id: 'desayuno', label: 'Desayuno', icon: Coffee },
  { id: 'almuerzo', label: 'Almuerzo', icon: Sun },
  { id: 'cena', label: 'Cena', icon: Moon },
  { id: 'meriendas', label: 'Merienda', icon: Leaf },
] as const;

type MealId = (typeof MEALS)[number]['id'];

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

  // Datos del plan – priorizar lo que guardó el médico, con fallback a defaults.
  //
  // ⚠️ ADR-007: el fallback es contenido genérico por grupo sanguíneo, NO una
  // prescripción. Se marca cuál es cuál para que la pantalla pueda decirlo, en
  // vez de presentar una pauta orientativa como si el médico la hubiera firmado.
  const planAlimentario = useMemo(() => {
    const prescrito: Record<MealId, string[] | undefined> = {
      desayuno: alimentacion?.planAlimentario?.desayuno,
      almuerzo: alimentacion?.planAlimentario?.almuerzo,
      cena: alimentacion?.planAlimentario?.cenaComunes,
      meriendas: alimentacion?.planAlimentario?.meriendas,
    };
    const generico: Record<MealId, string[]> = {
      desayuno: defaults.desayuno,
      almuerzo: defaults.almuerzo,
      cena: defaults.cena.comunes,
      meriendas: DEFAULTS_COMUNES.meriendas,
    };

    return MEALS.reduce(
      (acc, { id }) => {
        const delMedico = prescrito[id];
        acc[id] = {
          items: delMedico ?? generico[id] ?? [],
          isPrescribed: Array.isArray(delMedico) && delMedico.length > 0,
        };
        return acc;
      },
      {} as Record<MealId, { items: string[]; isPrescribed: boolean }>,
    );
  }, [alimentacion, defaults]);

  /** True si el médico no prescribió ninguna comida: todo lo visible es genérico. */
  const planEsGenerico = useMemo(
    () => MEALS.every(({ id }) => !planAlimentario[id].isPrescribed),
    [planAlimentario],
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

  // `claves5a` y `terapias4r` alimentaban las pestañas 5A y 4R que esta pantalla
  // ya no tiene: viven en HomePage, que es su sitio.

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
          <div className="px-5 pt-5 pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* ADR-007: no presentar una pauta orientativa como si fuera prescripción. */}
            {planEsGenerico && (
              <div
                role="status"
                className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100"
              >
                <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed text-amber-900">
                  Tu médico aún no ha registrado tu plan personalizado. Lo que ves
                  es una <strong>pauta orientativa general</strong> según tu grupo
                  sanguíneo, no una prescripción.
                </p>
              </div>
            )}

            {/* Scroll vertical continuo: desayuno → almuerzo → cena → merienda */}
            {MEALS.map(({ id, label, icon: Icon }) => {
              const { items, isPrescribed } = planAlimentario[id];

              return (
                <section key={id} aria-labelledby={`meal-${id}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#23BCEF]/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#107da8]" />
                    </div>
                    <h3
                      id={`meal-${id}`}
                      className="text-[13px] font-black uppercase tracking-widest text-[#293b64]"
                    >
                      {label}
                    </h3>
                    {!isPrescribed && !planEsGenerico && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                        Orientativo
                      </span>
                    )}
                  </div>

                  {items.length > 0 ? (
                    <div className="space-y-2.5">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-[1.25rem] px-4 py-3.5 shadow-sm border border-slate-100 flex items-center gap-3"
                        >
                          <CheckCircle2
                            size={16}
                            className="text-[#23BCEF] shrink-0"
                          />
                          <span className="text-sm font-bold text-[#293b64] leading-snug">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-400 italic px-1">
                      Sin indicaciones para esta comida.
                    </p>
                  )}

                  <MealNotesField mealId={id} mealLabel={label} />
                </section>
              );
            })}
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
