import React, { useMemo } from 'react';
import {
    ChevronLeft, Coffee, Sun, Moon, Leaf,
    ShieldAlert, Stethoscope, Droplet, Star,
    ClipboardList, AlertTriangle, CheckCircle2,
    Dna
} from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { DEFAULTS_O_B, DEFAULTS_A_AB, DEFAULTS_COMUNES } from '../services/nutrigenomicaDefaults';

interface Props {
    onBack: () => void;
}

const MEAL_TABS = [
    { id: 'desayuno', label: 'Desayuno', icon: Coffee },
    { id: 'almuerzo', label: 'Almuerzo', icon: Sun },
    { id: 'cena', label: 'Cena', icon: Moon },
    { id: 'meriendas', label: 'Meriendas', icon: Leaf },
] as const;

type MealTab = typeof MEAL_TABS[number]['id'];

const TIPO_LABELS: Record<string, string> = {
    tipoNino: 'Niño',
    tipoMetabolica: 'Metabólica',
    tipoAntidiabetica: 'Antidiabética',
    tipoCitostatica: 'Citostática',
    tipoRenal: 'Renal',
};

const DoctorNutritionPlanView: React.FC<Props> = ({ onBack }) => {
    const { profileData } = useProfileStore();
    const alimentacion = profileData?.alimentacion;
    const [activeTab, setActiveTab] = React.useState<MealTab>('desayuno');

    const defaults = useMemo(() => {
        const grupo = alimentacion?.grupoSanguineo;
        return grupo === 'A_AB' ? DEFAULTS_A_AB : DEFAULTS_O_B;
    }, [alimentacion?.grupoSanguineo]);

    // Datos del plan – priorizar lo que guardó el médico, con fallback a defaults
    const planAlimentario = useMemo(() => ({
        desayuno: alimentacion?.planAlimentario?.desayuno ?? defaults.desayuno,
        almuerzo: alimentacion?.planAlimentario?.almuerzo ?? defaults.almuerzo,
        cena: alimentacion?.planAlimentario?.cenaComunes ?? defaults.cena.comunes,
        meriendas: alimentacion?.planAlimentario?.meriendas ?? DEFAULTS_COMUNES.meriendas,
    }), [alimentacion, defaults]);

    const tiposActivos = useMemo(() => {
        if (!alimentacion) return [];
        return Object.entries(TIPO_LABELS)
            .filter(([key]) => (alimentacion as any)[key] === true)
            .map(([, label]) => label);
    }, [alimentacion]);

    const alimentos = {
        desayuno: planAlimentario.desayuno,
        almuerzo: planAlimentario.almuerzo,
        cena: planAlimentario.cena,
        meriendas: planAlimentario.meriendas,
    } as Record<MealTab, string[]>;

    // -- Sin datos del médico --
    if (!alimentacion) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC] p-10 text-center">
                <div className="bg-amber-50 p-6 rounded-[2.5rem] mb-6 border border-amber-100">
                    <AlertTriangle size={48} className="text-amber-500 mx-auto" />
                </div>
                <h3 className="text-xl font-black text-[#293b64] uppercase tracking-tighter mb-2">Plan en Preparación</h3>
                <p className="text-xs font-bold text-slate-500 italic mb-8">
                    Tu médico aún no ha configurado y enviado tu plan de alimentación nutrigenómica personalizado.
                </p>
                <button
                    onClick={onBack}
                    className="bg-[#293b64] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] animate-in slide-in-from-right duration-500 absolute inset-0 z-40 overflow-hidden">

            {/* Header */}
            <div className="bg-[#293b64] px-4 pt-12 pb-5 shadow-xl z-20">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-base font-black text-white leading-none tracking-tight uppercase">
                            Plan Nutrigenómico
                        </h2>
                        <span className="text-[10px] font-bold text-[#23BCEF] uppercase tracking-[0.2em] mt-0.5 block">
                            Grupo {alimentacion.grupoSanguineo === 'O_B' ? 'O / B' : 'A / AB'} • Personalizado
                        </span>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center bg-[#23BCEF]/20 rounded-xl">
                        <Dna size={20} className="text-[#23BCEF]" />
                    </div>
                </div>

                {/* Tipos de dieta activos */}
                {tiposActivos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                        {tiposActivos.map(tipo => (
                            <span
                                key={tipo}
                                className="bg-white/10 border border-white/20 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"
                            >
                                <Star size={8} className="text-[#23BCEF]" fill="currentColor" />
                                Dieta {tipo}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs de comidas */}
            <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar py-3 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
                {MEAL_TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all border-2 whitespace-nowrap ${isActive
                                ? 'bg-[#23BCEF] border-[#23BCEF] text-white shadow-lg scale-105'
                                : 'bg-slate-50 border-transparent text-slate-400'
                                }`}
                        >
                            <Icon size={14} />
                            {label.toUpperCase()}
                        </button>
                    );
                })}
            </div>

            {/* Contenido principal */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">

                {/* Lista de alimentos */}
                <div className="px-4 pt-4 space-y-3">
                    {(alimentos[activeTab] ?? []).map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-xl bg-[#23BCEF]/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} className="text-[#23BCEF]" />
                            </div>
                            <span className="text-sm font-bold text-[#293b64] leading-snug">{item}</span>
                        </div>
                    ))}
                    {(alimentos[activeTab] ?? []).length === 0 && (
                        <p className="text-center text-xs text-slate-400 font-bold italic pt-8">
                            No hay alimentos configurados para este momento.
                        </p>
                    )}
                </div>

                {/* Alimentos a Evitar */}
                <div className="mx-4 mt-6">
                    <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-5 flex gap-4 items-start">
                        <div className="bg-red-500 p-3 rounded-2xl text-white shadow-md shrink-0 mt-0.5">
                            <ShieldAlert size={22} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-red-700 uppercase tracking-widest mb-2">
                                Evitar (Incompatibles con tu ADN)
                            </h4>
                            <ul className="space-y-1.5">
                                {DEFAULTS_COMUNES.alimentosEvitar.map((item, idx) => (
                                    <li key={idx} className="text-xs text-red-900 font-bold leading-snug flex items-start gap-1.5">
                                        <span className="mt-1 shrink-0">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Nota del Médico */}
                {alimentacion.notasMedico && (
                    <div className="mx-4 mt-5">
                        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs border border-amber-200">
                                    Dr
                                </div>
                                <h4 className="text-[10px] font-black text-amber-800/70 uppercase tracking-widest">
                                    Nota del Médico
                                </h4>
                            </div>
                            <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                                "{alimentacion.notasMedico}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Info de sincronización */}
                <div className="mx-4 mt-5 mb-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <Stethoscope size={16} className="text-slate-400 shrink-0" />
                        <p className="text-[10px] font-bold text-slate-400 leading-snug">
                            {alimentacion.enviada
                                ? `Plan sincronizado por tu médico`
                                : `Plan configurado por tu médico y pendiente de sincronización final`
                            }
                        </p>
                    </div>
                </div>

                <div className="pt-4 pb-24 text-center opacity-30">
                    <p className="text-[9px] font-black text-[#293b64] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Star size={8} /> Nutrigenómica Doctor Antivejez <Star size={8} />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DoctorNutritionPlanView;
