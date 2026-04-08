import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, UserRound, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * UniversalEntry.tsx (H29 - Longevidad Orgánica)
 * 
 * Design Persona: Organic Longevity (Sand/Terracotta).
 * Strategy: Hierarchy-focused '3 Doors' implementation.
 */

const UniversalEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-vytalix-sand flex flex-col items-center px-6 py-12 font-sans overflow-x-hidden">

            {/* Brand Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <ShieldCheck className="text-vytalix-terracotta" size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-vytalix-graphite/60">
                        Vytalix Longevity
                    </span>
                </div>
                <h1 className="text-[34px] font-black leading-tight text-vytalix-graphite tracking-tight mb-4">
                    ¿Cómo deseas ingresar?
                </h1>
                <p className="text-[16px] text-vytalix-graphite/70 font-medium max-w-[280px] mx-auto">
                    Seleccion tu perfil para optimizar tu experiencia de salud.
                </p>
            </motion.div>

            {/* Primary Actions (Patient & Guest) */}
            <div className="w-full max-w-sm flex flex-col gap-5">

                {/* DOOR 1: SOY PACIENTE (PRIMARY) */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(179, 84, 70, 0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    style={{ backgroundColor: '#B35446' }} // vytalix-terracotta
                    className="w-full text-left rounded-[2.5rem] p-8 text-white transition-all relative overflow-hidden flex flex-col"
                >
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                            <Stethoscope size={28} strokeWidth={2.5} />
                        </div>
                        <ArrowRight size={22} strokeWidth={3} className="opacity-80" />
                    </div>

                    <h2 className="text-[24px] font-black mb-2">Soy paciente</h2>
                    <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                        Accede a tu plan de longevidad personalizado y seguimiento clínico.
                    </p>
                </motion.button>

                {/* DOOR 2: SOY INVITADO (SECONDARY) */}
                <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ backgroundColor: 'rgba(179, 84, 70, 0.04)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/longevidad')}
                    className="w-full text-left rounded-[2.5rem] p-7 border-2 border-vytalix-terracotta/30 bg-transparent transition-all flex items-center gap-5"
                >
                    <div className="w-12 h-12 rounded-2xl bg-vytalix-terracotta/10 flex items-center justify-center text-vytalix-terracotta">
                        <UserRound size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-extrabold text-vytalix-graphite">Soy invitado</h2>
                        <p className="text-[12px] text-vytalix-graphite/60 font-semibold tracking-wide">TEST DE LONGEVIDAD GRATUITO</p>
                    </div>
                    <ArrowRight size={18} className="text-vytalix-terracotta/40" />
                </motion.button>

            </div>

            {/* DOOR 3: SOY PROFESIONAL (TERTIARY / GHOST) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-auto pt-16 flex flex-col items-center gap-4"
            >
                <button
                    onClick={() => navigate('/medicos')}
                    className="px-6 py-3 text-[13px] font-bold uppercase tracking-[0.2em] text-clinical-navy/50 hover:text-clinical-navy transition-colors"
                >
                    ¿Eres profesional de salud? <span className="underline decoration-vytalix-terracotta/30 ml-1">Ver red médica</span>
                </button>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vytalix-graphite/30">
                    Vytalix Longevity Systems
                </p>
            </motion.div>

        </div>
    );
};

export default UniversalEntry;
