import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, ShieldCheck, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

/* ─── Design tokens ────────────────────────────────────────────────── */
const NAVY = '#293B64';
const CYAN = '#23BCEF';
const GREEN = '#4CAF50';
const AMBER = '#FFA726';
const CORAL = '#E53935';

const BG = 'linear-gradient(160deg, #293B64 0%, #0f1d38 100%)';

type Category = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'CRITICO';

interface TestResult {
    score: number;
    rawPoints?: number;
    category: Category;
    yearsBiological?: number;
    gapText?: string;
    dimensiones: Record<string, number>;
}

/* ─── Category metadata ────────────────────────────────────────────── */
const CAT: Record<Category, { color: string; bg: string; border: string; label: string }> = {
    EXCELENTE: { color: GREEN, bg: `${GREEN}22`, border: `${GREEN}55`, label: 'Excelente Vitalidad' },
    BUENO: { color: CYAN, bg: `${CYAN}22`, border: `${CYAN}55`, label: 'Buena Condición' },
    REGULAR: { color: AMBER, bg: `${AMBER}22`, border: `${AMBER}55`, label: 'Área de Oportunidad' },
    CRITICO: { color: CORAL, bg: `${CORAL}22`, border: `${CORAL}55`, label: 'Atención Prioritaria' },
};

const DIMENSIONS: { key: string; label: string }[] = [
    { key: 'grupo1', label: 'Energía y Estado Mental' },
    { key: 'grupo2', label: 'Sueño y Cognición' },
    { key: 'grupo3', label: 'Composición Corporal' },
    { key: 'grupo4', label: 'Signos de Vitalidad' },
    { key: 'grupo5', label: 'Capacidad Física' },
];

/* ─── Semicircular Gauge ────────────────────────────────────────────── */
const SemiGauge: React.FC<{ score: number; color: string }> = ({ score, color }) => {
    const R = 80;
    const cx = 100;
    const cy = 100;
    const circumference = Math.PI * R; // half-circle
    // SVG arc: start at 180° (left), end at 0° (right)
    const arcLength = circumference * (score / 100);

    return (
        <svg viewBox="0 0 200 110" className="w-56 h-auto">
            {/* Track */}
            <path
                d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={12}
                strokeLinecap="round"
            />
            {/* Progress — animate via dashoffset */}
            <motion.path
                d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                fill="none"
                stroke={color}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - arcLength }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
        </svg>
    );
};

/* ─── Dimension bar color ───────────────────────────────────────────── */
function barColor(v: number) {
    if (v >= 75) return GREEN;
    if (v >= 50) return CYAN;
    if (v >= 30) return AMBER;
    return CORAL;
}

/* ─── Main Component ────────────────────────────────────────────────── */
const ResultadoScorePage: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResult | null>(null);

    // Lead capture state
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const alreadyCaptured = !!sessionStorage.getItem('da_lead_email');

    useEffect(() => {
        const raw = sessionStorage.getItem('da_test_result');
        if (raw) {
            try { setResult(JSON.parse(raw)); } catch { navigate('/longevidad'); }
        } else {
            navigate('/longevidad');
        }
    }, [navigate]);

    if (!result) return null;

    const cat = CAT[result.category];
    const score = result.score;

    /* ── Emotional hook text ── */
    const hookConfig = score < 60
        ? {
            color: AMBER, icon: <AlertTriangle size={20} />,
            text: `Tu biología muestra señales de envejecimiento acelerado. Hay una brecha estimada de ${result.yearsBiological ? result.yearsBiological - 45 : 15} años entre tu edad cronológica y tu vitalidad actual.`,
        }
        : score < 80
            ? {
                color: CYAN, icon: <TrendingUp size={20} />,
                text: 'Tu vitalidad está en rango aceptable, pero existe margen significativo de optimización. Con el protocolo correcto, puedes recuperar entre 5 y 10 años de vitalidad biológica.',
            }
            : {
                color: GREEN, icon: <ShieldCheck size={20} />,
                text: 'Tu biología responde bien a tus hábitos actuales. Con un protocolo de optimización personalizado, puedes consolidar y extender este estado de vitalidad.',
            };

    /* ── Handle lead submission ── */
    const handleLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadName || !leadEmail) return;
        setLeadStatus('sending');
        sessionStorage.setItem('da_lead_name', leadName);
        sessionStorage.setItem('da_lead_email', leadEmail);

        try {
            const res = await fetch('/api-render/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadName, email: leadEmail,
                    score, category: result.category,
                    source: 'test_antivejez',
                }),
            });
            if (!res.ok) throw new Error('API unavailable');
        } catch {
            // Fallback: store locally
            console.warn('[AgeBot] /api/leads unavailable — storing lead locally');
            const pending = JSON.parse(localStorage.getItem('da_pending_leads') || '[]');
            pending.push({ name: leadName, email: leadEmail, score, ts: Date.now() });
            localStorage.setItem('da_pending_leads', JSON.stringify(pending));
        }

        setLeadStatus('sent');
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-12"
            style={{ background: BG }}>
            <div className="w-full max-w-sm px-5 pt-10">

                {/* ── BLOQUE 1: Hero Score ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center mb-6"
                >
                    {/* Semicircular gauge */}
                    <div className="relative flex flex-col items-center">
                        <SemiGauge score={score} color={cat.color} />
                        {/* Number over the gauge center */}
                        <div className="absolute bottom-0 flex flex-col items-center" style={{ bottom: 4 }}>
                            <motion.span
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                                className="font-black text-white"
                                style={{ fontSize: 48, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}
                            >
                                {score}
                            </motion.span>
                            <span className="text-[11px] uppercase tracking-widest font-semibold mt-1"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Score de Vitalidad
                            </span>
                        </div>
                    </div>

                    {/* Category badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center gap-2 px-5 py-2 rounded-full mt-4"
                        style={{ background: cat.bg, border: `1.5px solid ${cat.border}`, color: cat.color }}
                    >
                        <span className="font-bold text-sm">{cat.label}</span>
                    </motion.div>
                </motion.div>

                {/* ── BLOQUE 2: Emotional Hook ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="rounded-[20px] p-5 mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <div className="flex items-start gap-3 mb-4">
                        <div className="mt-0.5" style={{ color: hookConfig.color }}>{hookConfig.icon}</div>
                        <p className="text-sm leading-relaxed text-white">{hookConfig.text}</p>
                    </div>
                    {/* Disclaimer — always visible */}
                    <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <p className="text-[10px] leading-relaxed italic"
                            style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Esta evaluación es orientativa. Los valores aquí presentados son estimaciones basadas en sus respuestas
                            y no constituyen un diagnóstico médico. Para determinar su edad biológica real (biofísica, bioquímica
                            y genética) se requiere evaluación clínica presencial o virtual con el Dr. Juan Carlos Méndez.
                        </p>
                    </div>
                </motion.div>

                {/* ── BLOQUE 3: Dimension Bars ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="rounded-[20px] p-5 mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <p className="text-[13px] uppercase tracking-widest font-semibold mb-4" style={{ color: CYAN }}>
                        Tu Mapa de Vitalidad
                    </p>
                    <div className="space-y-4">
                        {DIMENSIONS.map((d, i) => {
                            const val = result.dimensiones[d.key] ?? 50;
                            const col = barColor(val);
                            return (
                                <div key={d.key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[12px] font-medium text-white">{d.label}</span>
                                        <span className="text-[12px] font-bold" style={{ color: col }}>{val}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: col }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${val}%` }}
                                            transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Cada dimensión identifica áreas prioritarias para tu protocolo personalizado.
                    </p>
                </motion.div>

                {/* ── BLOQUE 4: Lead Capture + Conversion ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="rounded-[20px] p-5 mb-4"
                    style={{ background: `${CYAN}14`, border: `1px solid ${CYAN}40` }}
                >
                    <AnimatePresence mode="wait">
                        {/* Lead form — shown if email not yet captured */}
                        {!alreadyCaptured && leadStatus !== 'sent' && (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onSubmit={handleLead}
                            >
                                <p className="text-[14px] font-semibold text-white mb-2">
                                    Guarda tu resultado y recibe el análisis completo
                                </p>
                                <p className="text-[12px] mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Te enviamos el desglose detallado de tus 5 dimensiones de vitalidad y las recomendaciones iniciales del equipo.
                                </p>
                                <div className="flex flex-col gap-3 mb-4">
                                    <input
                                        type="text" placeholder="Tu nombre" required
                                        value={leadName} onChange={e => setLeadName(e.target.value)}
                                        className="w-full rounded-xl text-white text-sm px-4 py-3 outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                                            fontFamily: 'Poppins, sans-serif', color: 'white',
                                        }}
                                    />
                                    <input
                                        type="email" placeholder="tu@email.com" required
                                        value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                                        className="w-full rounded-xl text-white text-sm px-4 py-3 outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                                            fontFamily: 'Poppins, sans-serif', color: 'white',
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={leadStatus === 'sending'}
                                    className="w-full font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                                    style={{ background: CYAN, color: NAVY, borderRadius: 28, padding: '13px 0', fontFamily: 'Poppins' }}
                                >
                                    {leadStatus === 'sending'
                                        ? <Loader2 size={20} className="animate-spin" />
                                        : 'Guardar mi resultado →'}
                                </button>
                                <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    Sin spam. Solo información relevante sobre tu salud.
                                </p>
                            </motion.form>
                        )}

                        {/* Success state → transition to CTA after 2s */}
                        {leadStatus === 'sent' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center py-4"
                                onAnimationComplete={() => setTimeout(() => setLeadStatus('idle'), 2000)}
                            >
                                <CheckCircle size={40} style={{ color: GREEN }} className="mb-3" />
                                <p className="text-white font-bold text-base mb-1">¡Listo!</p>
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Recibirás tu análisis detallado en breve.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── CTA: Consulta options ── */}
                {(alreadyCaptured || leadStatus === 'idle') && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        className="flex flex-col gap-3"
                    >
                        <p className="text-[16px] font-black text-white mb-1" style={{ fontFamily: 'Poppins' }}>
                            Avanza a Consulta Exploratoria
                        </p>

                        {/* Opción A — Gratis */}
                        <button
                            onClick={() => navigate('/consulta?tipo=basica')}
                            className="w-full text-left rounded-2xl p-4 transition-all active:scale-95"
                            style={{ border: `1.5px solid rgba(255,255,255,0.2)`, background: 'transparent' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                    USD 0 · Gratis
                                </span>
                            </div>
                            <p className="text-white font-bold text-[14px]">Consulta Virtual Básica (20 min)</p>
                            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Análisis inicial con profesional de salud
                            </p>
                        </button>

                        {/* Opción B — Paga */}
                        <button
                            onClick={() => navigate('/consulta?tipo=profunda')}
                            className="w-full text-left rounded-2xl p-4 relative transition-all active:scale-95"
                            style={{ border: `1.5px solid ${CYAN}`, background: `${CYAN}18` }}
                        >
                            {/* Recomendado badge */}
                            <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                                style={{ background: CYAN, color: NAVY }}>
                                Recomendado
                            </span>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                    style={{ background: `${CYAN}30`, color: CYAN }}>
                                    USD 49
                                </span>
                            </div>
                            <p className="text-white font-bold text-[14px]">Consulta Profunda + Reporte Ómico (45 min)</p>
                            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Análisis completo de biofísica + laboratorio
                            </p>
                        </button>

                        {/* Quick action repeat test */}
                        <button onClick={() => navigate('/test')}
                            className="w-full text-center py-3 text-[12px] transition-all"
                            style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Repetir el test →
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResultadoScorePage;
