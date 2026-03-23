import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const NAVY = '#293B64';
const CYAN = '#23BCEF';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5 }
    }),
} as const;

const LandingPublicaPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-10"
            style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #1a2d52 100%)` }}
        >
            {/* HERO */}
            <div className="w-full max-w-sm px-6 pt-14 pb-6 flex flex-col items-center text-center">

                {/* Badge */}
                <motion.div
                    custom={0} variants={fadeUp} initial="hidden" animate="visible"
                    style={{ color: CYAN, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Poppins, sans-serif' }}
                    className="mb-8 font-semibold flex flex-col items-center gap-1.5"
                >
                    <span className="opacity-80">Plataforma Digital de Longevidad</span>
                    <span className="font-black text-[12px] tracking-[0.2em]">Dr. Juan Carlos Méndez</span>
                </motion.div>

                {/* Logo with glow */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="relative mb-8">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-3xl pointer-events-none"
                        style={{ background: `${CYAN}55` }} />
                    <img src="/Logo_azul_oscuro.png" alt="Doctor Antivejez"
                        className="w-44 h-auto object-contain z-10 relative drop-shadow-xl"
                        style={{ filter: 'brightness(1.6)' }} />
                </motion.div>

                {/* Headline */}
                <motion.h1
                    custom={2} variants={fadeUp} initial="hidden" animate="visible"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 900, color: 'white', lineHeight: 1.2 }}
                    className="mb-3"
                >
                    Descubre tu Edad Biológica
                </motion.h1>

                {/* Sub */}
                <motion.p
                    custom={3} variants={fadeUp} initial="hidden" animate="visible"
                    style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 320, lineHeight: 1.6 }}
                    className="mb-10"
                >
                    Elige el método de evaluación que prefieres para comenzar tu viaje hacia la longevidad.
                </motion.p>
            </div>

            {/* CARDS */}
            <div className="w-full max-w-sm px-5 flex flex-col gap-4">

                {/* Card 1 — Test Clásico */}
                <motion.div
                    custom={4} variants={fadeUp} initial="hidden" animate="visible"
                    className="rounded-3xl p-6"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${CYAN}30` }}>
                            <ClipboardList size={22} style={{ color: CYAN }} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Test Clásico Antivejez</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${CYAN}30`, color: CYAN }}>
                                    45 preguntas
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Cuestionario de vitalidad validado por el Dr. Juan Carlos Méndez · 30 años de experiencia.
                    </p>
                    <button
                        onClick={() => navigate('/test')}
                        className="w-full font-bold text-[15px] transition-all active:scale-95"
                        style={{
                            background: CYAN, color: NAVY, borderRadius: 28,
                            padding: '14px 0', fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        Iniciar Test de 4 minutos →
                    </button>
                </motion.div>

                {/* Card 2 — AgeBot Facial */}
                <motion.div
                    custom={5} variants={fadeUp} initial="hidden" animate="visible"
                    className="rounded-3xl p-6"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${CYAN}30` }}>
                            <Camera size={22} style={{ color: CYAN }} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>AgeBot Facial</p>
                            <p className="text-xs font-medium" style={{ color: CYAN }}>¿Cuántos años luce tu cara?</p>
                        </div>
                    </div>
                    <p className="text-xs mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Escáner IA instantáneo + estimación de edad biológica facial.
                    </p>
                    <button
                        onClick={() => navigate('/agebot')}
                        className="w-full font-bold text-[15px] transition-all active:scale-95"
                        style={{
                            background: CYAN, color: NAVY, borderRadius: 28,
                            padding: '14px 0', fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        Tomar foto o subir imagen
                    </button>
                </motion.div>
            </div>

            {/* Footer note */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mt-8 px-8 text-center flex flex-col items-center gap-4">
                <button onClick={() => navigate('/medicos')}
                    className="text-xs transition-opacity hover:opacity-80 pb-1"
                    style={{ color: CYAN, borderBottom: `1px solid ${CYAN}50` }}>
                    Conoce nuestra red de médicos especialistas →
                </button>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    Ambos tests son gratuitos y te conectan con una consulta exploratoria con nuestra red médica.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="text-[12px] underline underline-offset-2 font-medium transition-opacity hover:opacity-80"
                    style={{ color: CYAN }}
                >
                    ¿Ya eres paciente? Iniciar sesión →
                </button>
            </motion.div>
        </div>

    );
};

export default LandingPublicaPage;
