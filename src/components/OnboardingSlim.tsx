import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Microscope, ClipboardList, TrendingUp } from 'lucide-react';
import PulsoMatinoCard from './public/PulsoMatinoCard';

interface Props {
    onComplete: () => void;
}

export default function OnboardingSlim({ onComplete }: Props) {
    const [step, setStep] = useState(1);

    const completeAndExit = () => {
        localStorage.setItem('da_onboarding_slim_v1', 'done');
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0f1d38] flex flex-col justify-center items-center px-6 overflow-hidden">
            <AnimatePresence mode="wait">

                {step === 1 && (
                    <motion.div key="step1"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-sm flex flex-col items-center"
                    >
                        {/* Simple Microscope Icon placeholder */}
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-400/30">
                            <Microscope size={40} className="text-[#23BCEF]" />
                        </div>

                        <h1 className="text-2xl font-black text-white mb-2 text-center">Tu primera semana comienza ahora</h1>
                        <p className="text-cyan-200 text-sm text-center mb-10 w-4/5 leading-relaxed">
                            Haz UNA cosa hoy: registra tu energía matutina.
                        </p>

                        <PulsoMatinoCard onComplete={() => setTimeout(() => setStep(2), 1500)} />
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-sm flex flex-col items-center bg-white/5 rounded-[24px] border border-white/10 p-8"
                    >
                        <h2 className="text-xl font-bold text-white mb-8 text-center">Así funciona tu protocolo</h2>

                        <div className="flex justify-between items-center w-full mb-8 px-2 relative">
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -z-10" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-[#293B64] rounded-full flex items-center justify-center text-white ring-4 ring-[#0f1d38] border border-[#23BCEF]/30"><Microscope size={20} /></div>
                                <span className="text-[11px] font-semibold text-white/70">Evalúa</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-[#23BCEF] rounded-full flex items-center justify-center text-white ring-4 ring-[#0f1d38] shadow-lg shadow-[#23BCEF]/20"><ClipboardList size={20} /></div>
                                <span className="text-[11px] font-semibold text-white/70">Protocolo</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white ring-4 ring-[#0f1d38] shadow-lg shadow-green-500/20"><TrendingUp size={20} /></div>
                                <span className="text-[11px] font-semibold text-white/70">Mejora</span>
                            </div>
                        </div>

                        <p className="text-[13px] text-gray-300 text-center mb-8 leading-relaxed">
                            Tu médico diseña tu protocolo.<br />Tú lo sigues en la app.<br />El sistema mide tu progreso.
                        </p>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full bg-[#23BCEF] text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-cyan-400 transition-colors shadow-lg shadow-[#23BCEF]/20"
                        >
                            Entendido, vamos
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                                <ShieldCheck size={32} className="text-green-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-4 text-center">Privacidad garantizada</h2>
                        <p className="text-[14px] text-gray-300 text-center mb-10 leading-relaxed px-4">
                            Tus datos clínicos están protegidos con cifrado de grado militar. Solo tú y tu médico tienen acceso.
                        </p>

                        <button
                            onClick={completeAndExit}
                            className="w-full bg-white text-[#293B64] font-bold py-4 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Acepto y entro →
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
