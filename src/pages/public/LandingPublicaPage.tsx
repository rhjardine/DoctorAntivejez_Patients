import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * LandingPublicaPage (Vytalix Premium Redesign - H29)
 * 
 * High-rigor public entry for the longevity funnel.
 * Features: Titanium palette, Inter typography, Turquoise-Tech highlights, and trust indicators.
 */

const BG = '#F8FAFC'; // Titanium White/Gray
const PRIMARY_BLUE = '#23BCEF'; // Turquoise Blue
const TEXT_DARK = '#0F172A'; // Slate-900 (Authority)
const TEXT_GRAY = '#64748B'; // Slate-500

const LandingPublicaPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100dvh',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'hidden',
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{ width: '100%', maxWidth: 440, padding: '0 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* ── SECCIÓN HERO ── */}
                <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                    {/* Logotipo VYTALIX */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        style={{ textAlign: 'center', marginBottom: 40 }}
                    >
                        <div style={{
                            fontSize: 22, fontWeight: 900, letterSpacing: 5,
                            color: TEXT_DARK, fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>
                            VYTALIX
                        </div>
                        <div style={{
                            fontSize: 14, fontWeight: 700, letterSpacing: 1, color: PRIMARY_BLUE,
                            textTransform: 'uppercase', marginTop: 8
                        }}>
                            por especialistas en longevidad
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        style={{ textAlign: 'center', marginBottom: 20 }}
                    >
                        <div style={{ fontSize: 36, fontWeight: 400, color: TEXT_DARK, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            Descubre tu
                        </div>
                        <div style={{ fontSize: 42, fontWeight: 900, color: PRIMARY_BLUE, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
                            Edad Celular
                        </div>
                    </motion.div>

                    {/* Pill científico */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        style={{
                            background: 'rgba(35,188,239,0.08)',
                            border: '1px solid rgba(35,188,239,0.2)',
                            borderRadius: 16, padding: '8px 20px',
                            fontSize: 13, fontWeight: 500, color: '#334155',
                            textAlign: 'center', marginBottom: 44
                        }}
                    >
                        Basado en indicadores de edad biológica y epigenética
                    </motion.div>

                    {/* CTA Primario */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(35 188 239 / 0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/longevidad-tests')}
                            style={{
                                width: '100%', background: PRIMARY_BLUE, color: 'white',
                                border: 'none', borderRadius: 20, padding: '20px 0',
                                fontSize: 18, fontWeight: 800, fontFamily: "'Inter', sans-serif",
                                cursor: 'pointer', letterSpacing: 0.5, marginBottom: 16,
                                boxShadow: '0 10px 15px -3px rgb(35 188 239 / 0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                            }}
                        >
                            Comenzar ahora
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </motion.button>

                        {/* Micro-Trust Indicator (H29) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TEXT_GRAY, marginBottom: 40 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>Análisis anónimo y cifrado localmente</span>
                        </div>
                    </motion.div>

                    {/* LA PREGUNTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        style={{ textAlign: 'center', marginBottom: 12 }}
                    >
                        <p style={{
                            fontSize: 17, fontStyle: 'italic', color: TEXT_DARK,
                            lineHeight: 1.5, fontWeight: 400
                        }}>
                            "¿A qué velocidad están envejeciendo tus células hoy?"
                        </p>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: 16, color: TEXT_GRAY, textAlign: 'center',
                            lineHeight: 1.6, marginBottom: 60, fontWeight: 500,
                            padding: '0 10px'
                        }}
                    >
                        El envejecimiento ya no es un destino inevitable,
                        es una <span style={{ color: TEXT_DARK, fontWeight: 700 }}>decisión de estilo de vida</span>.
                    </motion.p>
                </div>

                {/* ── FOOTER ── */}
                <div style={{
                    textAlign: 'center', paddingBottom: 40, opacity: 0.5
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: TEXT_DARK, textTransform: 'uppercase' }}>
                        Creado por <span style={{ color: PRIMARY_BLUE }}>Vytalix.io</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LandingPublicaPage;
