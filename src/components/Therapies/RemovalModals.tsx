import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Clock, AlertTriangle, CheckCircle2,
    Droplet, Shield, Zap, Dna, Activity,
    ChevronRight, Stethoscope
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { useAuthStore } from '../../store/useAuthStore';

// --- Components ---

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * PurgeProtocolModal: Interactive logic for substance selection and adherence logging.
 */
export const PurgeProtocolModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { session } = useAuthStore();
    const [selectedSubstance, setSelectedSubstance] = useState<string | null>(null);
    const firstName = session?.name?.split(' ')[0]?.toUpperCase() || 'PACIENTE';

    const substances = [
        { id: 'ricino', name: 'Aceite de Ricino', desc: 'Desintoxicación profunda y rápida.' },
        { id: 'magnesia', name: 'Leche de Magnesia', desc: 'Efecto suave y regulador.' },
        { id: 'epson', name: 'Sal de Epson', desc: 'Remoción biliar y de metales.' }
    ];

    const handleAccept = () => {
        if (selectedSubstance) {
            useProfileStore.getState().updateAdherence('PURGE', { substance: selectedSubstance });
            onClose();
            // In a real app, we would call toast.success("Protocolo de Purga aceptado");
            // Since we don't have a toast library, we'll assume the interaction is enough or use a simple feedback.
            console.log("Protocolo de Purga aceptado");
        }
    };

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
                        {/* Header */}
                        <div className="bg-[#23bcef] p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Purga Antivejez</h3>
                                <p className="text-[10px] font-bold opacity-80 tracking-[0.2em] uppercase">Protocolo Intestinal</p>
                            </div>
                            <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto pb-12 space-y-6">
                            {/* Quote */}
                            <p className="text-[#293b64] font-bold italic text-sm leading-relaxed border-l-4 border-[#23bcef] pl-4">
                                "{firstName}, para rejuvenecer, primero debemos remover. La acumulación de toxinas es la causa #1 de la inflamación crónica."
                            </p>

                            {/* Section 1: Purpose */}
                            <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 flex gap-4">
                                <div className="bg-[#23bcef] text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-100">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[#293b64] font-black text-sm uppercase tracking-tight">Ritmo Circadiano</h4>
                                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                        Optimizamos la remoción durante el <span className="text-[#23bcef]">ciclo circadiano</span> de desintoxicación (3:00 AM - 3:00 PM).
                                    </p>
                                </div>
                            </div>

                            {/* Alert: Recomendada */}
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
                                <div className="bg-amber-400 p-1.5 rounded-lg text-white">
                                    <AlertTriangle size={14} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest">CENA RECOMENDADA</p>
                                    <p className="text-amber-700 text-xs font-bold leading-tight">Sopa de vegetales ligera o ayuno después de las 6:00 PM.</p>
                                </div>
                            </div>

                            {/* Section 2: Substance Selection */}
                            <div className="space-y-3">
                                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-1">Sustancia a Utilizar</h4>
                                <div className="grid gap-3">
                                    {substances.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setSelectedSubstance(sub.id)}
                                            className={`p-4 rounded-[1.5rem] border-2 text-left transition-all duration-300 flex items-center justify-between group ${selectedSubstance === sub.id
                                                ? 'bg-blue-50 border-[#23bcef] ring-4 ring-cyan-50'
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-black text-sm ${selectedSubstance === sub.id ? 'text-[#23bcef]' : 'text-[#293b64]'}`}>{sub.name}</p>
                                                <p className="text-slate-500 text-[10px] font-semibold">{sub.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedSubstance === sub.id ? 'bg-[#23bcef] border-[#23bcef]' : 'border-slate-200'
                                                }`}>
                                                {selectedSubstance === sub.id && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Expected Effects */}
                            <div className="bg-[#10b981] rounded-3xl p-5 text-white flex gap-4 shadow-lg shadow-emerald-50">
                                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                                    <Activity size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-tight">Efectos Esperados</h4>
                                    <p className="text-emerald-50 text-xs font-semibold leading-relaxed">
                                        Provocará entre 2 a 3 evacuaciones líquidas. Este proceso es normal y necesario para la limpieza.
                                    </p>
                                </div>
                            </div>

                            {/* Section 4: Post-Purge */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <Droplet className="text-[#23bcef]" size={20} />
                                    <h5 className="text-[#293b64] font-black text-[10px] uppercase">Agua Mineral</h5>
                                    <p className="text-slate-500 text-[9px] font-bold">Reponer electrolitos.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <Shield className="text-emerald-500" size={20} />
                                    <h5 className="text-[#293b64] font-black text-[10px] uppercase">Dieta Detox</h5>
                                    <p className="text-slate-500 text-[9px] font-bold">Reiniciar bioma.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="p-6 pt-0 mt-auto shrink-0 bg-white border-t border-slate-50">
                            <button
                                onClick={handleAccept}
                                disabled={!selectedSubstance}
                                className={`w-full font-black uppercase tracking-[0.2em] py-5 rounded-[1.5rem] transition-all duration-300 shadow-xl ${selectedSubstance
                                    ? 'bg-[#293b64] text-white hover:bg-[#1e2b4a] active:scale-[0.98]'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    }`}
                            >
                                Entendido y Aceptado
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * ChelationProtocolModal: Visual impact for EDTA and vascular detox objectives.
 */
export const ChelationProtocolModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
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
                        {/* Header */}
                        <div className="bg-[#293b64] p-6 text-white flex justify-between items-center shrink-0 border-b-2 border-cyan-400">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Quelación Endovenosa</h3>
                                <p className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Limpieza Vascular Profunda</p>
                            </div>
                            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto pb-12 space-y-6">
                            {/* Section 1: Vital Purpose */}
                            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Zap size={80} className="rotate-12" />
                                </div>
                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-cyan-500/20 p-2 rounded-lg">
                                            <Zap size={18} className="text-cyan-400" />
                                        </div>
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Propósito Vital</h4>
                                    </div>
                                    <p className="text-sm font-bold leading-relaxed text-slate-300">
                                        Remoción de desechos metabólicos, metales pesados y calcio de las paredes arteriales.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2: Active Ingredient (EDTA) */}
                            <div className="bg-[#1e2b4a] rounded-[2rem] p-6 border-2 border-cyan-500/30 shadow-[0_0_15px_rgba(35,188,239,0.3)] flex items-center justify-between group">
                                <div className="space-y-1">
                                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Ingrediente Activo</p>
                                    <h4 className="text-5xl font-black text-white tracking-tighter">EDTA</h4>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase">Ácido Edético Magistral</p>
                                </div>
                                <div className="text-cyan-400/20 group-hover:text-cyan-400/40 transition-colors duration-500">
                                    <Dna size={80} />
                                </div>
                            </div>

                            {/* Section 3: Objectives */}
                            <div className="space-y-4">
                                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-1">Objetivos de Remoción</h4>
                                <div className="space-y-3">
                                    {[
                                        { title: 'Calcificaciones', desc: 'Descalcificación de arterias coronarias y renales.', icon: <Droplet className="text-blue-400" size={18} /> },
                                        { title: 'Metales Pesados', desc: 'Atrapa Plomo, Mercurio, Aluminio y Cadmio.', icon: <Shield className="text-emerald-400" size={18} /> },
                                        { title: 'Radicales Libres', desc: 'Neutraliza el estrés oxidativo masivo.', icon: <Zap className="text-amber-400" size={18} /> }
                                    ].map((obj, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 hover:border-cyan-200 transition-colors">
                                            <div className="shrink-0 pt-1">{obj.icon}</div>
                                            <div className="space-y-1">
                                                <h5 className="text-[#293b64] font-black text-xs uppercase">{obj.title}</h5>
                                                <p className="text-slate-500 text-[11px] font-semibold leading-snug">{obj.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4: Frequency & Safety */}
                            <div className="grid gap-3">
                                <div className="bg-slate-100/50 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-slate-400" size={18} />
                                        <p className="text-[#293b64] font-bold text-xs uppercase">Frecuencia</p>
                                    </div>
                                    <p className="text-[#293b64] font-black text-xs">1 SESIÓN / SEMANA</p>
                                </div>

                                {/* Critical Warning Card */}
                                <div className="bg-[#fee2e2] p-5 rounded-3xl border border-red-100 flex gap-4">
                                    <div className="bg-red-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                                        <Stethoscope size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-red-700 font-extrabold text-sm uppercase tracking-tight">Supervisión Médica</h4>
                                        <p className="text-red-800 text-xs font-bold leading-relaxed">
                                            Este protocolo debe ser administrado exclusivamente por personal de salud certificado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="p-6 pt-0 mt-auto shrink-0 bg-white border-t border-slate-50">
                            <button
                                onClick={onClose}
                                className="w-full bg-[#293b64] text-white font-black uppercase tracking-[0.2em] py-5 rounded-[1.5rem] hover:bg-[#1e2b4a] transition-all duration-300 shadow-xl active:scale-[0.98]"
                            >
                                Confirmar y Agendar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
