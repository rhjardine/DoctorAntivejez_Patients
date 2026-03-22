import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, ArrowRight } from 'lucide-react';

const NAVY = '#293B64';
const CYAN = '#23BCEF';

type Category = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'CRITICO';

interface TestResult {
    score: number;
    rawPoints: number;
    category: Category;
    yearsBiological: number;
    gapText: string;
    dimensiones: Record<string, number>;
}

const CATEGORY_META: Record<Category, { color: string; bg: string; icon: React.ReactNode; label: string; message: string }> = {
    EXCELENTE: {
        color: '#22c55e', bg: 'rgba(34,197,94,0.12)',
        icon: <CheckCircle size={28} />,
        label: 'Excelente Vitalidad',
        message: 'Tu perfil de vitalidad refleja hábitos muy saludables. El Dr. Méndez puede ayudarte a optimizar aún más tu longevidad.'
    },
    BUENO: {
        color: CYAN, bg: `${CYAN}20`,
        icon: <TrendingUp size={28} />,
        label: 'Buena Condición',
        message: 'Tienes una buena base de salud. Hay áreas puntuales que, con orientación médica, pueden mejorar significativamente tu vitalidad.'
    },
    REGULAR: {
        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
        icon: <AlertTriangle size={28} />,
        label: 'Área de Oportunidad',
        message: 'Tu evaluación indica que estás experimentando signos de envejecimiento acelerado. Una consulta con el Dr. Méndez puede marcar la diferencia.'
    },
    CRITICO: {
        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
        icon: <XCircle size={28} />,
        label: 'Atención Prioritaria',
        message: 'Tus respuestas indican múltiples señales de alerta. Te recomendamos urgentemente una evaluación con el Dr. Méndez para un plan de acción personalizado.'
    },
};

const GROUP_NAMES: Record<string, string> = {
    grupo1: 'Energía y Estado Mental',
    grupo2: 'Sueño y Cognición',
    grupo3: 'Composición Corporal',
    grupo4: 'Signos de Envejecimiento',
    grupo5: 'Rango de Edad',
};

const ResultadoScorePage: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResult | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('da_test_result');
        if (raw) {
            try { setResult(JSON.parse(raw)); } catch { navigate('/test'); }
        } else {
            navigate('/longevidad');
        }
    }, [navigate]);

    if (!result) return null;

    const meta = CATEGORY_META[result.category];

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-12"
            style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #1a2d52 100%)` }}
        >
            <div className="w-full max-w-sm px-5 pt-14">

                {/* Score Circle */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col items-center mb-8"
                >
                    <div className="relative w-36 h-36 mb-5">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke={meta.color} strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 52 * result.score / 100} ${2 * Math.PI * 52}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {result.score}
                            </span>
                            <span className="text-xs text-white/60 font-medium">/ 100</span>
                        </div>
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl mb-3"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon}
                        <span className="font-bold text-base">{meta.label}</span>
                    </div>

                    <p className="text-center text-sm leading-relaxed px-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {meta.message}
                    </p>
                </motion.div>

                {/* Biological Age */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-3xl p-5 mb-5"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: CYAN, fontFamily: 'Poppins' }}>
                        Edad Biológica Estimada
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white" style={{ fontFamily: 'Poppins' }}>
                            {result.yearsBiological}
                        </span>
                        <span className="text-xl text-white/60 mb-1">años</span>
                    </div>
                    <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        * Estimación orientativa. La edad biológica precisa requiere evaluación clínica completa.
                    </p>
                </motion.div>

                {/* Dimensiones */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="rounded-3xl p-5 mb-6"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: CYAN }}>
                        Por Dimensión
                    </p>
                    <div className="space-y-3">
                        {Object.entries(result.dimensiones).map(([key, val]) => (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-white/70">{GROUP_NAMES[key] || key}</span>
                                    <span className="text-xs font-bold text-white">{val}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${val}%` }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-full rounded-full"
                                        style={{ background: val >= 70 ? '#22c55e' : val >= 45 ? CYAN : '#f59e0b' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA — Consulta */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="flex flex-col gap-3"
                >
                    <button
                        onClick={() => navigate('/consulta')}
                        className="w-full font-bold text-[16px] flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                            background: CYAN, color: NAVY, borderRadius: 28,
                            padding: '16px 0', fontFamily: 'Poppins, sans-serif'
                        }}
                    >
                        Solicitar Consulta Exploratoria <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={() => navigate('/test')}
                        className="w-full font-medium text-sm transition-all active:scale-95"
                        style={{ color: 'rgba(255,255,255,0.5)', padding: '12px 0' }}
                    >
                        Repetir el test
                    </button>
                </motion.div>

                {/* Disclaimer */}
                <p className="text-center mt-6 text-[10px] leading-relaxed px-4"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Esta evaluación es una estimación orientativa basada en sus respuestas. La determinación precisa
                    de su edad biológica requiere evaluación clínica completa con el Dr. Méndez.
                </p>
            </div>
        </div>
    );
};

export default ResultadoScorePage;
