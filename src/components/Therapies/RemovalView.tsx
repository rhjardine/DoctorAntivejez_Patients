import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Beaker, Droplets, Coffee, Syringe, Footprints, Waves,
    ChevronRight, X, Info
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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

const PurgaProtocolModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="bg-[#293b64] p-6 text-white flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-black uppercase tracking-widest">Protocolo Purga</h3>
                            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#23bcef]">
                                    <Beaker size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[#293b64] leading-tight">Limpieza Intestinal</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fase 1: Preparación</p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                                Este protocolo requiere preparación previa de 24 horas. Sigue las indicaciones médicas estrictamente para asegurar la efectividad de la remoción de toxinas.
                            </p>

                            <div className="space-y-3">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                                    <span className="bg-[#23bcef] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</span>
                                    <p className="text-sm font-bold text-slate-700">Ayuno sólido a partir de las 6:00 PM del día anterior.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                                    <span className="bg-[#23bcef] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
                                    <p className="text-sm font-bold text-slate-700">Ingesta de solución purgante a las 3:00 AM (Ritmo Circadiano).</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                                    <span className="bg-[#23bcef] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</span>
                                    <p className="text-sm font-bold text-slate-700">Hidratación constante con suero oral durante el proceso.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0 mt-auto shrink-0">
                            <button onClick={onClose} className="w-full bg-[#23bcef] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-200">
                                Entendido
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ChelationProtocolModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="bg-[#293b64] p-6 text-white flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-black uppercase tracking-widest">Quelación IV</h3>
                            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#23bcef]">
                                    <Syringe size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[#293b64] leading-tight">Remoción de Metales</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocolo Clínico</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={16} className="text-amber-500" />
                                    <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Requisito Previo</span>
                                </div>
                                <p className="text-xs text-amber-800 font-bold">
                                    Requiere exámenes de función renal (Creatinina y Urea) recientes antes de la aplicación.
                                </p>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                                La terapia de quelación utiliza EDTA y otros agentes para atrapar metales pesados como plomo, mercurio y cadmio, permitiendo su eliminación a través de la orina.
                            </p>
                        </div>
                        <div className="p-6 pt-0 mt-auto shrink-0">
                            <button onClick={onClose} className="w-full bg-[#23bcef] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-200">
                                Confirmar Cita
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


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
                        "{session?.name?.split(' ')[0] || 'Paciente'}, para rejuvenecer, primero debemos remover. La acumulación de toxinas es la causa #1 de la inflamación crónica."
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
            <PurgaProtocolModal isOpen={openModal === 'purga'} onClose={() => setOpenModal(null)} />
            <ChelationProtocolModal isOpen={openModal === 'chelation'} onClose={() => setOpenModal(null)} />

        </div>
    );
};

export default RemovalView;
