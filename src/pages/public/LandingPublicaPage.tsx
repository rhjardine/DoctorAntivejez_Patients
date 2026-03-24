import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BG = '#F5F0E8';
const EARTH_DK = '#5C4A32';
const SAGE = '#7C9A7E';
const TERRA = '#C4714A';
const TXT_PRI = '#3D2B1F';
const TXT_SEC = '#7A6555';
const TXT_HINT = '#A89880';
const BG_CARD = '#FDFAF4';

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
            fontFamily: 'Poppins, sans-serif',
        }}>
            <div style={{ width: '100%', maxWidth: 440, padding: '0 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* ── SECCIÓN HERO ── */}
                <div style={{ paddingTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                    {/* Logotipo VYTALIX */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        style={{ textAlign: 'center', marginBottom: 32 }}
                    >
                        <div style={{
                            fontSize: 22, fontWeight: 900, letterSpacing: 5,
                            color: EARTH_DK, fontFamily: 'Poppins, sans-serif'
                        }}>
                            VYTALIX
                        </div>
                        <div style={{
                            fontSize: 11, letterSpacing: 2, color: SAGE,
                            textTransform: 'uppercase', marginTop: 4
                        }}>
                            por especialistas en longevidad
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        style={{ textAlign: 'center', marginBottom: 16 }}
                    >
                        <div style={{ fontSize: 34, fontWeight: 400, color: TXT_PRI, lineHeight: 1.1 }}>
                            Descubre tu
                        </div>
                        <div style={{ fontSize: 38, fontWeight: 900, color: TERRA, lineHeight: 1.05 }}>
                            Edad Celular
                        </div>
                    </motion.div>

                    {/* Pill científico */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        style={{
                            background: 'rgba(124,154,126,0.12)',
                            border: '1px solid rgba(124,154,126,0.28)',
                            borderRadius: 24, padding: '7px 18px',
                            fontSize: 12, fontStyle: 'italic', color: SAGE,
                            textAlign: 'center', marginBottom: 32
                        }}
                    >
                        basado en indicadores de edad biológica y epigenética
                    </motion.div>

                    {/* CTA Primario */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/longevidad-tests')}
                        style={{
                            width: '100%', background: TERRA, color: '#FDFAF4',
                            border: 'none', borderRadius: 32, padding: '17px 0',
                            fontSize: 17, fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                            cursor: 'pointer', letterSpacing: 0.3, marginBottom: 20
                        }}
                    >
                        Comenzar ahora
                    </motion.button>

                    {/* Separador */}
                    <div style={{ width: '100%', height: 1, background: 'rgba(61,43,31,0.1)', marginBottom: 20 }} />

                    {/* LA PREGUNTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        style={{ textAlign: 'center', marginBottom: 8 }}
                    >
                        <p style={{
                            fontSize: 16, fontStyle: 'italic', color: TXT_PRI,
                            lineHeight: 1.5, fontFamily: 'Poppins, sans-serif'
                        }}>
                            "¿A qué velocidad están envejeciendo tus células hoy?"
                        </p>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: 14, color: TXT_SEC, textAlign: 'center',
                            lineHeight: 1.6, marginBottom: 48
                        }}
                    >
                        El envejecimiento ya no es un destino inevitable,
                        es una decisión de estilo de vida.
                    </motion.p>
                </div>

                <div className="h-4" />

                {/* ── FOOTER ── */}
                <div style={{
                    textAlign: 'center', paddingBottom: 32, opacity: 0.4
                }}>
                    <p style={{ fontSize: 10, letterSpacing: 2, color: EARTH_DK, textTransform: 'uppercase' }}>
                        Creado por Vytalix.io
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LandingPublicaPage;
