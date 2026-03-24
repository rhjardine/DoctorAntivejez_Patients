import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WELLNESS } from '../../styles/wellnessPalette';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" } as any
    }),
};

const LandingPublicaPage: React.FC = () => {
    const navigate = useNavigate();
    const [section, setSection] = useState<1 | 2>(1);

    const handleStart = () => {
        setSection(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center overflow-x-hidden selection:bg-[#D97A5B] selection:text-white"
            style={{ background: WELLNESS.bg, color: WELLNESS.textPrimary, fontFamily: 'Poppins, sans-serif' }}
        >
            <AnimatePresence mode="wait">
                {section === 1 ? (
                    /* ── SCREEN 1: HERO/ENTRY ── */
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full max-w-md px-8 pt-16 pb-12 flex flex-col items-center"
                    >
                        {/* Header */}
                        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-16">
                            <h1 className="font-black tracking-[0.25em] text-3xl mb-2" style={{ color: WELLNESS.textPrimary }}>VYTALIX</h1>
                            <p className="text-[13px] font-bold tracking-widest uppercase opacity-60 italic" style={{ color: WELLNESS.earth }}>
                                by un equipo de especialistas en longevidad
                            </p>
                        </motion.div>

                        {/* Hero Content */}
                        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-center w-full mb-12">
                            <h2 className="text-[44px] font-black leading-[1.1] tracking-tighter mb-8" style={{ color: WELLNESS.textPrimary }}>
                                Descubre tu<br />
                                <span style={{ color: WELLNESS.terracotta }}>Edad Celular</span>
                            </h2>

                            <div className="inline-block px-5 py-2.5 mb-14 bg-white/40 backdrop-blur-sm rounded-full border border-[#7C9A7E]33" style={{ border: `1px solid ${WELLNESS.sage}40` }}>
                                <p className="text-[15px] font-bold italic" style={{ color: WELLNESS.sage }}>
                                    basado en indicadores de edad biológica y epigenética
                                </p>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full py-5 rounded-full font-black text-lg shadow-xl shadow-terracotta/20 active:scale-95 transition-all mb-12"
                                style={{ background: WELLNESS.terracotta, color: 'white' }}
                            >
                                Comenzar ahora
                            </button>

                            <div className="w-full h-px bg-[#3D2B1F26] mb-10" />

                            <div className="space-y-6">
                                <p className="text-[19px] font-bold italic leading-relaxed" style={{ color: WELLNESS.textPrimary }}>
                                    "¿A qué velocidad están envejeciendo tus células hoy?"
                                </p>
                                <p className="text-[16px] font-semibold leading-relaxed opacity-80" style={{ color: WELLNESS.textSecond }}>
                                    El envejecimiento ya no es un destino inevitable, es una decisión de estilo de vida.
                                </p>
                            </div>
                        </motion.div>

                        {/* Footer Spacer */}
                        <div className="mt-auto pt-10 text-center opacity-40">
                            <p className="text-[10px] font-black tracking-widest uppercase">Creado por Vytalix.io</p>
                        </div>
                    </motion.div>
                ) : (
                    /* ── SCREEN 2: ENTRY POINTS ── */
                    <motion.div
                        key="entry"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md px-6 pt-12 pb-12 flex flex-col items-center"
                    >
                        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-12">
                            <h1 className="font-black tracking-[0.2em] text-xl mb-3" style={{ color: WELLNESS.textPrimary }}>VYTALIX</h1>
                            <p className="text-[12px] font-bold tracking-widest uppercase opacity-60" style={{ color: WELLNESS.earth }}>
                                PLATAFORMA DIGITAL DE LONGEVIDAD
                            </p>
                        </motion.div>

                        <motion.h3
                            custom={1} variants={fadeUp} initial="hidden" animate="visible"
                            className="text-[20px] font-black tracking-[0.15em] uppercase mb-10 text-center"
                            style={{ color: WELLNESS.textPrimary }}
                        >
                            ELIGE TU PUNTO DE ENTRADA
                        </motion.h3>

                        <div className="w-full space-y-6 mb-12">
                            {/* Card 1 */}
                            <motion.div
                                custom={2} variants={fadeUp} initial="hidden" animate="visible"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/test')}
                                className="w-full p-7 bg-white rounded-[32px] shadow-sm border border-[#5C4A32]10 flex flex-col"
                                style={{ boxShadow: '0 10px 30px -10px rgba(92,74,50,0.08)' }}
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${WELLNESS.sage}15` }}>
                                    <ClipboardList size={24} color={WELLNESS.sage} />
                                </div>
                                <h4 className="text-[22px] font-black mb-2" style={{ color: WELLNESS.textPrimary }}>Test de Edad Celular</h4>
                                <div className="inline-block px-3 py-1 bg-sage-50/50 rounded-full mb-4 w-fit" style={{ background: `${WELLNESS.sage}1A` }}>
                                    <p className="text-[12px] font-bold" style={{ color: WELLNESS.sage }}>34 indicadores · 4 minutos</p>
                                </div>
                                <p className="text-[15px] font-semibold leading-relaxed opacity-70 mb-6" style={{ color: WELLNESS.textSecond }}>
                                    Cuestionario validado por especialistas en longevidad para estimar tu ritmo biológico.
                                </p>
                                <button className="w-fit flex items-center gap-2 font-black text-sm uppercase tracking-wider" style={{ color: WELLNESS.terracotta }}>
                                    Comenzar Ahora <ArrowRight size={16} />
                                </button>
                            </motion.div>

                            {/* Card 2 */}
                            <motion.div
                                custom={3} variants={fadeUp} initial="hidden" animate="visible"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/agebot')}
                                className="w-full p-7 bg-white rounded-[32px] shadow-sm border border-[#5C4A32]10 flex flex-col"
                                style={{ boxShadow: '0 10px 30px -10px rgba(92,74,50,0.08)' }}
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${WELLNESS.sage}15` }}>
                                    <Camera size={24} color={WELLNESS.sage} />
                                </div>
                                <h4 className="text-[22px] font-black mb-2" style={{ color: WELLNESS.textPrimary }}>Análisis Visual de Vitalidad</h4>
                                <div className="inline-block px-3 py-1 bg-sage-50/50 rounded-full mb-4 w-fit" style={{ background: `${WELLNESS.sage}1A` }}>
                                    <p className="text-[12px] font-bold" style={{ color: WELLNESS.sage }}>IA · Instantáneo</p>
                                </div>
                                <p className="text-[15px] font-semibold leading-relaxed opacity-70 mb-6" style={{ color: WELLNESS.textSecond }}>
                                    Tu rostro revela pistas sobre tu vitalidad. Captura una selfie para un análisis inmediato.
                                </p>
                                <button className="w-fit flex items-center gap-2 font-black text-sm uppercase tracking-wider" style={{ color: WELLNESS.terracotta }}>
                                    Comenzar Ahora <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        </div>

                        <motion.div
                            custom={4} variants={fadeUp} initial="hidden" animate="visible"
                            className="text-center opacity-40 mt-auto"
                        >
                            <p className="text-[10px] font-black tracking-widest uppercase">Creado por Vytalix.io</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPublicaPage;
