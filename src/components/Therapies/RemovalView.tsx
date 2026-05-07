import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Beaker, Droplets, Coffee, Syringe, Footprints, Waves,
    ChevronRight, X, Info
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { PurgeProtocolModal, ChelationProtocolModal } from './RemovalModals';

// --- Types & Data ---

interface TherapyItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    benefit: string;
    removalPower: number; // 0-100
    icon: React.ReactNode;
    modalId?: 'purga' | 'chelation' | null;
}

const THERAPIES: TherapyItem[] = [
    {
        id: 'purga',
        title: 'Purga Antivejez',
        subtitle: 'LIMPIEZA INTESTINAL CIRCADIANA',
        description: 'Protocolo de remoción intestinal líquida y controlada, optimizado para el ciclo circadiano de desintoxicación de 3:00 AM a 3:00 PM.',
        benefit: 'Reinicia el bioma intestinal y elimina desechos metabólicos acumulados por años.',
        removalPower: 95,
        icon: <Beaker size={24} />,
        modalId: 'purga'
    },
    {
        id: 'detox',
        title: 'Alimentación Detox',
        subtitle: 'LIMPIEZA NUTRICIONAL QUELANTE',
        description: 'Protocolo de nutrición basado en alimentos naturales que actúan como imanes de toxinas. Ayuda a resetear el sistema digestivo.',
        benefit: 'Reduce la carga inflamatoria sistémica y mejora la claridad mental.',
        removalPower: 75,
        icon: <Droplets size={24} />,
        modalId: null
    },
    {
        id: 'enemas',
        title: 'Enemas de Café',
        subtitle: 'PURIFICACIÓN BILIAR Y HEPÁTICA',
        description: 'Terapia que estimula la producción de glutatión maestro. Facilita la descarga de bilis cargada de toxinas directamente al colon.',
        benefit: 'Purifica el torrente sanguíneo y acelera la regeneración celular del hígado.',
        removalPower: 85,
        icon: <Coffee size={24} />,
        modalId: null
    },
    {
        id: 'chelation',
        title: 'Quelación Endovenosa',
        subtitle: 'DESINTOXICACIÓN VASCULAR Y CELULAR',
        description: 'Administración intravenosa de agentes quelantes (EDTA) para remover metales pesados y depósitos de calcio de las arterias.',
        benefit: 'Limpia el sistema cardiovascular, mejora la microcirculación y reduce el estrés oxidativo.',
        removalPower: 98,
        icon: <Syringe size={24} />,
        modalId: 'chelation'
    },
    {
        id: 'pediluvio',
        title: 'Pediluvio Iónico',
        subtitle: 'DRENAJE DE TOXINAS POR ÓSMOSIS',
        description: 'Baño de pies con electrolisis que extrae toxinas a través de los poros de la planta de los pies mediante intercambio iónico.',
        benefit: 'Equilibra el pH corporal y reduce la retención de líquidos.',
        removalPower: 60,
        icon: <Footprints size={24} />,
        modalId: null
    },
    {
        id: 'hydro',
        title: 'Hidroterapia de Colon',
        subtitle: 'HIGIENE PROFUNDA DEL COLON',
        description: 'Irrigación suave del colon con agua filtrada y ozonizada para remover materia fecal incrustada y parásitos.',
        benefit: 'Mejora la absorción de nutrientes y repara la permeabilidad intestinal.',
        removalPower: 90,
        icon: <Waves size={24} />,
        modalId: null
    }
];

// --- Modals ---

// --- Main View ---


// --- Main View ---

interface RemovalViewProps {
    onBack?: () => void;
}

const RemovalView: React.FC<RemovalViewProps> = ({ onBack }) => {
    const { session } = useAuthStore();
    const [openModal, setOpenModal] = useState<null | 'purga' | 'chelation'>(null);

    return (
        <div className="flex flex-col w-full pb-32">

            {/* Compact Clinical Banner (Header) */}
            <div className="mx-4 mt-6 bg-[#293b64] rounded-3xl p-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#23bcef]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onBack}
                                className="bg-white/10 p-1.5 rounded-lg text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
                            >
                                <ChevronRight size={16} className="rotate-180" />
                            </button>
                            <div className="bg-[#23bcef] p-1.5 rounded-lg text-white">
                                <Beaker size={14} fill="currentColor" fillOpacity={0.2} />
                            </div>
                            <span className="text-[#23bcef] font-black uppercase tracking-widest text-[9px]">Fase 1: Remoción</span>
                        </div>
                    </div>

                    <h2 className="text-white text-[11px] font-bold italic leading-relaxed mb-4 opacity-90 max-w-[90%]">
                        "{session?.name?.split(' ')[0]?.toUpperCase() || 'PACIENTE'}, para rejuvenecer, primero debemos remover. La acumulación de toxinas es la causa #1 de la inflamación crónica."
                    </h2>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="w-full h-1 bg-blue-900/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#23bcef]"
                                    initial={{ width: 0 }}
                                    animate={{ width: '35%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                        <span className="text-white font-black text-[8px] uppercase tracking-widest shrink-0">Nivel de Desbloqueo</span>
                    </div>
                </div>
            </div>

            {/* Therapies List */}
            <div className="flex flex-col gap-4 px-4 mt-6 text-[#293b64]">
                {THERAPIES.map((therapy, index) => (
                    <motion.div
                        key={therapy.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#293b64] shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-slate-100">
                                {therapy.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[#293b64] font-black text-lg leading-tight mb-1">{therapy.title}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-[#23bcef] text-[10px] font-black uppercase tracking-widest truncate">{therapy.subtitle}</p>
                                    {therapy.id === 'purga' && (
                                        <span className="bg-[#23bcef] text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm shadow-cyan-200">Protocolo Vital</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                            {therapy.description}
                        </p>

                        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 text-emerald-500">
                                    <Waves size={14} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-emerald-800/60 text-[9px] font-black uppercase tracking-widest block mb-1">Beneficio Celular:</span>
                                    <p className="text-emerald-800 text-xs font-bold leading-snug">{therapy.benefit}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Poder de Remoción</span>
                                    <span className="text-[#293b64] text-xs font-black">{therapy.removalPower}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#23bcef]"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${therapy.removalPower}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => therapy.modalId && setOpenModal(therapy.modalId)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${therapy.modalId
                                    ? 'bg-[#293b64] text-white shadow-lg hover:bg-[#1e2b4a]'
                                    : 'bg-slate-50 text-slate-300 cursor-default'
                                    }`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <PurgeProtocolModal isOpen={openModal === 'purga'} onClose={() => setOpenModal(null)} />
            <ChelationProtocolModal isOpen={openModal === 'chelation'} onClose={() => setOpenModal(null)} />

        </div>
    );
};

export default RemovalView;
