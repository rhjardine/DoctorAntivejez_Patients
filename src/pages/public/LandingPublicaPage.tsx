import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { WELLNESS } from '../../styles/wellnessPalette';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';

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
            className="w-full flex flex-col items-center overflow-y-auto no-scrollbar"
            style={{ background: WELLNESS.bg }}
        >
            {/* ──────── HERO SECTION (100dvh approx) ──────── */}
            <div className="w-full min-h-[100dvh] max-w-sm px-6 pt-14 pb-12 flex flex-col items-center text-center">

                {/* Minimalist Logo equivalent */}
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-10 flex flex-col items-center">
                    <h2
                        style={{ color: WELLNESS.earthDark, fontSize: 22, letterSpacing: 6, fontFamily: 'Poppins, sans-serif' }}
                        className="font-black mb-1"
                    >
                        VYTALIX
                    </h2>
                    <p style={{ color: WELLNESS.earth, fontSize: 10 }} className="italic">
                        by un equipo de especialistas en longevidad
                    </p>
                </motion.div>

                {/* Main Headline */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-8 flex flex-col items-center">
                    <h1
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 500, color: WELLNESS.textPrimary, lineHeight: 1.1 }}
                        className="mb-1"
                    >
                        Descubre tu
                    </h1>
                    <h1
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: 38, fontWeight: 900, color: WELLNESS.terracotta, lineHeight: 1.1 }}
                        className="mb-4"
                    >
                        {VITALITY_LABELS.age_front}
                    </h1>

                    <div
                        className="px-4 py-1.5 rounded-full"
                        style={{ background: `${WELLNESS.sage}1A`, border: `1px solid ${WELLNESS.sage}4D` }}
                    >
                        <p style={{ color: WELLNESS.earth, fontSize: 11 }} className="italic">
                            {VITALITY_LABELS.age_sub}
                        </p>
                    </div>
                </motion.div>

                {/* Primary CTA */}
                <motion.button
                    custom={2} variants={fadeUp} initial="hidden" animate="visible"
                    onClick={() => navigate('/test')}
                    style={{
                        background: '#C4714A',
                        color: '#FDFAF4',
                        borderRadius: '32px',
                        padding: '16px 0',
                        width: '100%',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '16px',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        transition: 'background 0.2s ease',
                    }}
                >
                    Comenzar ahora
                </motion.button>

                {/* The Powerful Question */}
                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', padding: '0 24px', width: '100%', marginTop: '8px' }}>
                    <div style={{ height: '1px', background: 'rgba(93,74,50,0.15)', margin: '20px 0' }} />
                    <p style={{ fontSize: '15px', color: '#3D2B1F', fontStyle: 'italic', lineHeight: 1.6, fontFamily: 'Poppins, sans-serif' }}>
                        "¿A qué velocidad están envejeciendo tus células hoy?"
                    </p>
                    <p style={{ fontSize: '13px', color: '#7A6555', marginTop: '8px', lineHeight: 1.5 }}>
                        El envejecimiento ya no es un destino inevitable,<br />es una decisión de estilo de vida.
                    </p>
                </motion.div>

                {/* Scroll hint spacer */}
                <div className="flex-1 min-h-[40px]"></div>
            </div>

            {/* ──────── SECTION 2: ENTRY POINTS ──────── */}
            <div
                className="w-full px-5 py-14 flex flex-col items-center rounded-t-[2.5rem]"
                style={{ background: WELLNESS.bgDeep }}
            >
                <motion.h3
                    custom={0} variants={fadeUp} initial="hidden" animate="visible"
                    style={{ color: WELLNESS.earth, fontSize: 13, letterSpacing: 2 }}
                    className="font-bold uppercase text-center mb-6"
                >
                    Elige tu punto de entrada
                </motion.h3>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    {/* Card 1 — Test de Edad Celular */}
                    <motion.div
                        custom={1} variants={fadeUp} initial="hidden" animate="visible"
                        style={{
                            background: '#FDFAF4',
                            border: '1px solid rgba(139,115,85,0.2)',
                            borderRadius: '18px',
                            padding: '20px',
                            textAlign: 'left'
                        }}
                        onClick={() => navigate('/test')}
                        className="cursor-pointer transition-transform active:scale-[0.98]"
                    >
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: 'rgba(124,154,126,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px',
                        }}>
                            <ClipboardList size={20} color="#7C9A7E" />
                        </div>
                        <h3 style={{ fontSize: '16px', color: '#5C4A32', fontWeight: 600 }}>
                            {VITALITY_LABELS.test_name}
                        </h3>
                        <span style={{
                            fontSize: '11px', color: '#7C9A7E',
                            background: 'rgba(124,154,126,0.1)',
                            borderRadius: '10px', padding: '4px 10px',
                            display: 'inline-block', marginTop: '6px',
                        }}>
                            34 indicadores · 4 minutos
                        </span>
                        <p style={{ fontSize: '13px', color: '#7A6555', marginTop: '10px' }}>
                            Cuestionario validado por especialistas en longevidad
                        </p>
                    </motion.div>

                    {/* Card 2 — AgeBot Facial */}
                    <motion.div
                        custom={2} variants={fadeUp} initial="hidden" animate="visible"
                        style={{
                            background: '#FDFAF4',
                            border: '1px solid rgba(139,115,85,0.2)',
                            borderRadius: '18px',
                            padding: '20px',
                            textAlign: 'left'
                        }}
                        onClick={() => navigate('/agebot')}
                        className="cursor-pointer transition-transform active:scale-[0.98]"
                    >
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: 'rgba(124,154,126,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px',
                        }}>
                            <Camera size={20} color="#7C9A7E" />
                        </div>
                        <h3 style={{ fontSize: '16px', color: '#5C4A32', fontWeight: 600 }}>
                            Análisis Visual de Vitalidad
                        </h3>
                        <span style={{
                            fontSize: '11px', color: '#7C9A7E',
                            background: 'rgba(124,154,126,0.1)',
                            borderRadius: '10px', padding: '4px 10px',
                            display: 'inline-block', marginTop: '6px',
                        }}>
                            IA · Instantáneo
                        </span>
                        <p style={{ fontSize: '13px', color: '#7A6555', marginTop: '10px' }}>
                            Tu rostro revela pistas sobre tu ritmo de envejecimiento
                        </p>
                    </motion.div>
                </div>

                <motion.p
                    custom={3} variants={fadeUp} initial="hidden" animate="visible"
                    className="text-[11px] text-center mt-6 mb-10"
                    style={{ color: WELLNESS.textHint }}
                >
                    Ambos análisis son gratuitos y orientativos.
                </motion.p>

                {/* Login Link for existing patients */}
                <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', opacity: 0.5, paddingBottom: '48px' }}>
                    <span style={{ fontSize: '11px', color: '#8B7355' }}>
                        ¿Ya eres parte del programa?{' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Ingresar →
                        </span>
                    </span>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPublicaPage;
