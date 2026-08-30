import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicHeader from '../../components/public/PublicHeader';

// Paleta corporativa. Los nombres anteriores (EARTH, SAGE, TERRA) venían de la
// paleta "Longevidad Orgánica" de una etapa previa y apuntaban los tres al
// mismo turquesa fuera de marca.
const BG = '#f8fafc';
const BG_CARD = '#ffffff';
const NAVY = '#293b64';
/** Cian corporativo oscurecido a AA (4.65:1) — texto e iconos sobre claro. */
const CYAN_INK = '#107da8';
/** Tinte cian para fondos de pastilla e icono. */
const CYAN_TINT = 'rgba(35,188,239,0.12)';
const TXT_SEC = '#64748b';

const TestsSelectorPage: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => navigate('/test');

    return (
        <div style={{
            minHeight: '100dvh', background: BG,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            fontFamily: 'Poppins, sans-serif', overflowX: 'hidden'
        }}>
            <PublicHeader
                theme="wellness"
                title="Evaluación Inicial"
                showBack={true}
                onBack={() => navigate('/longevidad')}
            />
            <div style={{ width: '100%', maxWidth: 440, padding: '0 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ paddingTop: 24, textAlign: 'center', marginBottom: 32 }}
                >
                    <p style={{
                        fontSize: 16, letterSpacing: 1, color: CYAN_INK,
                        textTransform: 'uppercase', opacity: 0.9, fontWeight: 600
                    }}>
                        Plataforma Digital de Longevidad
                    </p>
                </motion.div>

                {/* Card 1 — Test Clásico */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/test')}
                    style={{
                        width: '100%', background: BG_CARD,
                        border: '1px solid rgba(41,59,100,0.1)',
                        borderRadius: 20, padding: '24px 20px',
                        marginBottom: 14, cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Ícono */}
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: CYAN_TINT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 14
                    }}>
                        <ClipboardList size={22} color={CYAN_INK} />
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8, lineHeight: 1.2 }}>
                        Test de Edad Celular
                    </h3>

                    <span style={{
                        display: 'inline-block',
                        background: CYAN_TINT,
                        borderRadius: 12, padding: '4px 12px',
                        fontSize: 12, color: CYAN_INK, marginBottom: 10
                    }}>
                        34 indicadores · 4 minutos
                    </span>

                    <p style={{ fontSize: 14, color: TXT_SEC, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        Cuestionario validado por especialistas en longevidad.
                        Evalúa energía, cognición, composición corporal y signos vitales.
                    </p>
                </motion.div>

                {/* Card 2 — AgeBot Facial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => navigate('/agebot')}
                    style={{
                        width: '100%', background: BG_CARD,
                        border: '1px solid rgba(41,59,100,0.1)',
                        borderRadius: 20, padding: '24px 20px',
                        marginBottom: 28, cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: CYAN_TINT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 14
                    }}>
                        <Camera size={22} color={CYAN_INK} />
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8, lineHeight: 1.2 }}>
                        Análisis Visual de Vitalidad
                    </h3>

                    <span style={{
                        display: 'inline-block',
                        background: CYAN_TINT,
                        borderRadius: 12, padding: '4px 12px',
                        fontSize: 12, color: CYAN_INK, marginBottom: 10
                    }}>
                        IA · Análisis instantáneo
                    </span>

                    <p style={{ fontSize: 14, color: TXT_SEC, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        Tu rostro revela pistas sobre tu ritmo de envejecimiento.
                        Análisis de 23+ puntos de referencia con inteligencia artificial.
                    </p>
                </motion.div>

                <p style={{ fontSize: 13, color: TXT_SEC, opacity: 0.8, textAlign: 'center', marginBottom: 40, lineHeight: 1.5 }}>
                    Selecciona uno de los métodos anteriores para iniciar tu evaluación de vitalidad.
                </p>

                {/* Footer */}
                <p style={{ fontSize: 10, letterSpacing: 2, color: NAVY, opacity: 0.4, textTransform: 'uppercase', textAlign: 'center' }}>
                    Creado por Vytalix.io
                </p>
            </div>
        </div>
    );
};

export default TestsSelectorPage;
