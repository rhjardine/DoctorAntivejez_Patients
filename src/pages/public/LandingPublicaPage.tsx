import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

// --- PALETA VYTALIX 2026 ---
const COLORS = {
    bg: '#F8F1E9', // Crema cálido
    terracotta: '#D97A5B', // Acento primario
    sage: '#8FB8A0', // Acento secundario y natural
    textPrimary: '#4A3F35', // Marrón cálido para alto contraste
    textSecondary: '#6B5E50', // Marrón suave
    white: '#FFFFFF',
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    }),
};

// Componente: Micro-animaciones de texturas naturales/luz
const FloatingLeaves = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
            <motion.div
                className="absolute w-[20rem] h-[20rem] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(217,122,91,0.12) 0%, rgba(248,241,233,0) 70%)', top: '-5%', right: '-10%' }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute w-[28rem] h-[28rem] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(143,184,160,0.12) 0%, rgba(248,241,233,0) 70%)', bottom: '15%', left: '-20%' }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-[40%] left-[10%] w-[16rem] h-[16rem] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(248,241,233,0) 70%)' }}
                animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
};

const LandingPublicaPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="relative w-full min-h-screen flex flex-col items-center overflow-x-hidden selection:bg-[#D97A5B] selection:text-white"
            style={{ background: COLORS.bg, color: COLORS.textPrimary, fontFamily: 'Inter, Poppins, sans-serif' }}
        >
            <FloatingLeaves />

            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">

                {/* 1. Header superior */}
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="w-full flex flex-col items-center mt-12 mb-16 px-2">
                    <h1
                        className="font-black tracking-[0.2em] uppercase"
                        style={{ fontSize: '28px', color: COLORS.textPrimary }}
                    >
                        VYTALIX
                    </h1>
                    <p
                        className="font-semibold tracking-[0.05em] text-center uppercase mt-3 opacity-90"
                        style={{ fontSize: '18px', color: COLORS.sage, lineHeight: 1.4 }}
                    >
                        Plataforma Digital de Longevidad
                    </p>
                </motion.div>

                {/* 2. Hero principal */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="w-full flex flex-col items-center text-center mb-10">
                    <h2
                        className="font-bold leading-[1.05] tracking-tight mb-8"
                        style={{ fontSize: '46px', color: COLORS.textPrimary }}
                    >
                        Tu vitalidad,<br />en tus manos
                    </h2>
                    <p
                        className="font-semibold px-2 mb-12 leading-snug"
                        style={{ fontSize: '22px', color: COLORS.textPrimary }}
                    >
                        Descubre cómo se siente<br />tener<br />más energía cada día
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 12px 30px -5px rgba(217,122,91,0.5)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/test')}
                        className="w-full font-bold shadow-xl flex items-center justify-center transition-all bg-[#D97A5B]"
                        style={{
                            color: COLORS.white,
                            borderRadius: '9999px',
                            minHeight: '64px',
                            fontSize: '20px',
                            boxShadow: '0 10px 25px -6px rgba(217,122,91,0.4)',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        Comenzar ahora
                    </motion.button>
                </motion.div>

                {/* Separator / Scroll hint */}
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="w-full flex flex-col items-center justify-center mb-16 opacity-30 mt-8">
                    <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#4A3F35] to-transparent" />
                </motion.div>

                {/* 3. Sección "Descubre tu Edad Celular" */}
                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="w-full flex flex-col items-center text-center mb-16 mt-4">
                    <h3
                        className="font-bold leading-[1.05] tracking-tight mb-6"
                        style={{ fontSize: '42px', color: COLORS.textPrimary }}
                    >
                        Descubre tu<br />
                        <span style={{ color: COLORS.terracotta }}>Edad Celular</span>
                    </h3>

                    <div
                        className="inline-block px-5 py-3 mb-12"
                        style={{
                            background: 'rgba(143,184,160,0.15)',
                            borderRadius: '9999px',
                            border: '1px solid rgba(143,184,160,0.3)'
                        }}
                    >
                        <p className="font-semibold italic" style={{ fontSize: '18px', color: COLORS.sage, lineHeight: 1.3 }}>
                            basado en indicadores de edad biológica y epigenética
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 12px 30px -5px rgba(217,122,91,0.5)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/test')}
                        className="w-full font-bold shadow-xl flex items-center justify-center mb-14 transition-all bg-[#D97A5B]"
                        style={{
                            color: COLORS.white,
                            borderRadius: '9999px',
                            minHeight: '64px',
                            fontSize: '20px',
                            boxShadow: '0 10px 25px -6px rgba(217,122,91,0.4)'
                        }}
                    >
                        Comenzar ahora
                    </motion.button>

                    <div className="w-full h-[1px] mb-10" style={{ background: 'rgba(74,63,53,0.15)' }} />

                    <div className="px-2">
                        <p className="font-bold italic mb-6" style={{ fontSize: '20px', color: COLORS.textPrimary, lineHeight: 1.4 }}>
                            "¿A qué velocidad están envejeciendo tus células hoy?"
                        </p>
                        <p className="font-semibold opacity-90" style={{ fontSize: '18px', color: COLORS.textSecondary, lineHeight: 1.5 }}>
                            El envejecimiento ya no es un destino inevitable, es una decisión de estilo de vida.
                        </p>
                    </div>
                </motion.div>

                {/* 4. Cards Section (Elige tu punto de entrada) */}
                <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="w-full flex flex-col items-center mb-20 mt-10">
                    <p className="font-bold tracking-[0.15em] uppercase mb-10 text-center" style={{ fontSize: '18px', color: COLORS.textPrimary, opacity: 0.8 }}>
                        Elige tu punto de entrada
                    </p>

                    <div className="w-full flex flex-col gap-6">
                        {/* Card 1 */}
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ y: -4, boxShadow: '0 15px 40px -10px rgba(74,63,53,0.15)' }}
                            onClick={() => navigate('/test')}
                            className="w-full p-8 flex flex-col items-start cursor-pointer transition-all duration-300"
                            style={{
                                background: COLORS.white,
                                borderRadius: '28px',
                                boxShadow: '0 10px 30px -10px rgba(74,63,53,0.08)',
                                border: '1px solid rgba(74,63,53,0.06)'
                            }}
                        >
                            <div
                                className="w-14 h-14 flex items-center justify-center mb-6"
                                style={{ background: 'rgba(143,184,160,0.15)', borderRadius: '9999px' }}
                            >
                                <ClipboardList size={26} color={COLORS.sage} />
                            </div>
                            <h4 className="font-bold mb-3" style={{ fontSize: '22px', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                                Test de Edad Celular
                            </h4>
                            <div
                                className="px-5 py-2 mb-4 inline-block"
                                style={{ background: 'rgba(143,184,160,0.12)', borderRadius: '9999px' }}
                            >
                                <span className="font-bold" style={{ fontSize: '16px', color: COLORS.sage }}>
                                    34 indicadores · 4 minutos
                                </span>
                            </div>
                            <p className="font-semibold opacity-90 mt-2" style={{ fontSize: '18px', color: COLORS.textSecondary, lineHeight: 1.5 }}>
                                Cuestionario validado por especialistas en longevidad
                            </p>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ y: -4, boxShadow: '0 15px 40px -10px rgba(74,63,53,0.15)' }}
                            onClick={() => navigate('/agebot')}
                            className="w-full p-8 flex flex-col items-start cursor-pointer transition-all duration-300"
                            style={{
                                background: COLORS.white,
                                borderRadius: '28px',
                                boxShadow: '0 10px 30px -10px rgba(74,63,53,0.08)',
                                border: '1px solid rgba(74,63,53,0.06)'
                            }}
                        >
                            <div
                                className="w-14 h-14 flex items-center justify-center mb-6"
                                style={{ background: 'rgba(143,184,160,0.15)', borderRadius: '9999px' }}
                            >
                                <Camera size={26} color={COLORS.sage} />
                            </div>
                            <h4 className="font-bold mb-3" style={{ fontSize: '22px', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                                Análisis Visual de Vitalidad
                            </h4>
                            <div
                                className="px-5 py-2 mb-4 inline-block"
                                style={{ background: 'rgba(143,184,160,0.12)', borderRadius: '9999px' }}
                            >
                                <span className="font-bold" style={{ fontSize: '16px', color: COLORS.sage }}>
                                    IA · Instantáneo
                                </span>
                            </div>
                            <p className="font-semibold opacity-90 mt-2" style={{ fontSize: '18px', color: COLORS.textSecondary, lineHeight: 1.5 }}>
                                Tu rostro revela pistas sobre tu ritmo de envejecimiento
                            </p>
                        </motion.div>
                    </div>

                    <p className="font-semibold italic text-center mt-10 opacity-70" style={{ fontSize: '16px', color: COLORS.textSecondary }}>
                        Ambos análisis son gratuitos y orientativos.
                    </p>
                </motion.div>

                {/* 5. Footer inferior */}
                <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="w-full pb-14 pt-8 text-center flex flex-col items-center">
                    <p className="font-bold tracking-[0.15em] mb-2" style={{ fontSize: '16px', color: COLORS.textSecondary, opacity: 0.8 }}>
                        Powered by
                    </p>
                    <p className="font-bold tracking-[0.2em]" style={{ fontSize: '20px', color: COLORS.textPrimary }}>
                        VYTALIX.IO
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default LandingPublicaPage;
