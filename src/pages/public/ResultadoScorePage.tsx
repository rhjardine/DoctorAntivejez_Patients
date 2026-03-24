import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, ShieldCheck, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { WELLNESS } from '../../styles/wellnessPalette';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';

/* ─── Design tokens ────────────────────────────────────────────────── */
const BG = `linear-gradient(160deg, ${WELLNESS.earthDark} 0%, #3D2B1F 100%)`;

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
    EXCELENTE: { color: WELLNESS.good, bg: `${WELLNESS.good}22`, border: `${WELLNESS.good}55`, label: 'Excelente Vitalidad' },
    BUENO: { color: WELLNESS.sage, bg: `${WELLNESS.sage}22`, border: `${WELLNESS.sage}55`, label: 'Buena Condición' },
    REGULAR: { color: WELLNESS.warn, bg: `${WELLNESS.warn}22`, border: `${WELLNESS.warn}55`, label: 'Área de Oportunidad' },
    CRITICO: { color: WELLNESS.alert, bg: `${WELLNESS.alert}22`, border: `${WELLNESS.alert}55`, label: 'Atención Prioritaria' },
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
    if (v >= 75) return WELLNESS.good;
    if (v >= 50) return WELLNESS.sage;
    if (v >= 30) return WELLNESS.warn;
    return WELLNESS.alert;
}

/* ─── Main Component ────────────────────────────────────────────────── */
const ResultadoScorePage: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResult | null>(null);

    // Lead capture state
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const alreadyCaptured = !!sessionStorage.getItem('vx_lead_email');

    useEffect(() => {
        const raw = sessionStorage.getItem('vx_test_result');
        if (raw) {
            try { setResult(JSON.parse(raw)); } catch { navigate('/longevidad'); }
        } else {
            navigate('/longevidad');
        }
    }, [navigate]);

    if (!result) return null;

    const cat = CAT[result.category];
    const score = result.score;

    /* ── Hook text: dato → contexto → oportunidad ── */
    const hookConfig = score < 40
        ? {
            color: WELLNESS.alert, icon: <AlertTriangle size={20} />,
            title: 'Tu score indica áreas de atención prioritaria',
            rangeBadge: 'Rango de optimización activa',
            context: 'Tu biología está respondiendo a patrones de hábito que aceleran el envejecimiento celular. El 70% de estos factores son modificables con el protocolo correcto.',
            opportunity: 'Una evaluación clínica puede identificar exactamente cuáles son tus 2–3 prioridades de mayor impacto.',
        }
        : score < 60
            ? {
                color: WELLNESS.warn, icon: <AlertTriangle size={20} />,
                title: 'Tu score muestra margen significativo de mejora',
                rangeBadge: 'Rango de progresión activa',
                context: 'Tu biología tiene bases sólidas pero hay factores que están frenando tu potencial de vitalidad. Son abordables.',
                opportunity: 'Con un protocolo ajustado a tu perfil, es posible ganar entre 5 y 10 años de vitalidad en 6 meses documentados.',
            }
            : score < 80
                ? {
                    color: WELLNESS.sage, icon: <TrendingUp size={20} />,
                    title: 'Tu score refleja hábitos con espacio de optimización',
                    rangeBadge: 'Rango de consolidación',
                    context: 'Tienes una base bien establecida. La diferencia entre "bien" y "óptimo" suele ser un ajuste en 2–3 variables clave.',
                    opportunity: 'El protocolo personalizado puede llevarte al rango óptimo y sostenerlo a largo plazo con seguimiento médico.',
                }
                : {
                    color: WELLNESS.good, icon: <ShieldCheck size={20} />,
                    title: 'Tu score está en el rango de alto rendimiento biológico',
                    rangeBadge: 'Rango óptimo',
                    context: 'Tus hábitos actuales están funcionando. El trabajo ahora es sostener y extender este estado con precisión clínica.',
                    opportunity: 'Un protocolo de mantenimiento avanzado puede preservar este estado 15–20 años más allá del promedio.',
                };

    /* ── Handle lead submission ── */
    const handleLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadName || !leadEmail) return;
        setLeadStatus('sending');
        sessionStorage.setItem('vx_lead_name', leadName);
        sessionStorage.setItem('vx_lead_email', leadEmail);

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
                        <SemiGauge score={score} color={WELLNESS.tealMicro} />
                        {/* Number over the gauge center */}
                        <div className="absolute bottom-0 flex flex-col items-center" style={{ bottom: 4 }}>
                            <motion.span
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                                className="font-black"
                                style={{ fontSize: 48, fontFamily: 'Poppins, sans-serif', lineHeight: 1, color: WELLNESS.bgCard }}
                            >
                                {score}
                            </motion.span>
                            <span className="text-[11px] uppercase tracking-widest font-semibold mt-1"
                                style={{ color: `${WELLNESS.bgCard}B3` }}>
                                {VITALITY_LABELS.age_front}
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

                {/* ── BLOQUE 2: Hook — dato → contexto → oportunidad ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="rounded-[20px] p-5 mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <div className="flex items-start gap-3 mb-3">
                        <div className="mt-0.5 shrink-0" style={{ color: hookConfig.color }}>{hookConfig.icon}</div>
                        <div>
                            <p className="text-sm font-bold leading-snug mb-1" style={{ color: WELLNESS.bgCard }}>{hookConfig.title}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block"
                                style={{ background: `${hookConfig.color}20`, color: hookConfig.color }}>
                                Score {score}/100 — {hookConfig.rangeBadge}
                            </span>
                        </div>
                    </div>
                    <p className="text-[13px] leading-relaxed mb-2" style={{ color: `${WELLNESS.bgCard}BF` }}>
                        {hookConfig.context}
                    </p>
                    <p className="text-[13px] leading-relaxed font-medium" style={{ color: `${WELLNESS.bgCard}E6` }}>
                        {hookConfig.opportunity}
                    </p>
                    {/* Disclaimer */}
                    <div className="border-t mt-4 pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <p className="text-[10px] leading-relaxed italic"
                            style={{ color: `${WELLNESS.bgCard}73` }}>
                            Nota: Este análisis es una estimación basada en sus respuestas de hábitos y no constituye un diagnóstico médico.
                            La edad biológica real se determina mediante evaluación biofísica, bioquímica y genética en consulta con el
                            equipo médico especialista.
                        </p>
                    </div>
                </motion.div>

                {/* ── BLOQUE 3: Dimension Bars ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="rounded-[20px] p-5 mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                    <p className="text-[13px] uppercase tracking-widest font-semibold mb-4" style={{ color: WELLNESS.tealMicro }}>
                        Tu Mapa de Vitalidad
                    </p>
                    <div className="space-y-4">
                        {DIMENSIONS.map((d, i) => {
                            const val = result.dimensiones[d.key] ?? 50;
                            const col = barColor(val);
                            return (
                                <div key={d.key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[12px] font-medium" style={{ color: WELLNESS.bgCard }}>{d.label}</span>
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
                    style={{ background: `${WELLNESS.tealMicro}1A`, border: `1px solid ${WELLNESS.tealMicro}40` }}
                >
                    <AnimatePresence mode="wait">
                        {/* Lead form — shown if email not yet captured */}
                        {!alreadyCaptured && leadStatus !== 'sent' && (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onSubmit={handleLead}
                            >
                                <p className="text-[14px] font-semibold mb-2" style={{ color: WELLNESS.bgCard }}>
                                    Recibe tu análisis completo de un especialista en longevidad
                                </p>
                                <p className="text-[12px] mb-5 leading-relaxed" style={{ color: `${WELLNESS.bgCard}A6` }}>
                                    Te enviamos el desglose detallado de tus 5 dimensiones de vitalidad y las recomendaciones iniciales del equipo médico.
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
                                    style={{ background: WELLNESS.tealMicro, color: WELLNESS.earthDark, borderRadius: 28, padding: '13px 0', fontFamily: 'Poppins' }}
                                >
                                    {leadStatus === 'sending'
                                        ? <Loader2 size={20} className="animate-spin" />
                                        : 'Guardar mi resultado →'}
                                </button>
                                <p className="text-center text-[10px] mt-3" style={{ color: `${WELLNESS.bgCard}66` }}>
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
                                <CheckCircle size={40} style={{ color: WELLNESS.tealMicro }} className="mb-3" />
                                <p className="font-bold text-base mb-1" style={{ color: WELLNESS.bgCard }}>¡Listo!</p>
                                <p className="text-sm" style={{ color: `${WELLNESS.bgCard}A6` }}>
                                    Recibirás tu análisis detallado en breve.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── CTA: Siguiente paso en el protocolo ── */}
                {(alreadyCaptured || leadStatus === 'idle') && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        className="flex flex-col gap-3"
                    >
                        <p className="text-[16px] font-black mb-1" style={{ fontFamily: 'Poppins', color: WELLNESS.bgCard }}>
                            Elige tu siguiente paso
                        </p>

                        {/* Opción A — Programa de Optimización */}
                        <button
                            onClick={() => navigate('/consulta?tipo=basica')}
                            className="w-full text-left rounded-2xl p-4 transition-all active:scale-95"
                            style={{ border: `1.5px solid rgba(255,255,255,0.2)`, background: 'transparent' }}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                    Sin costo · 20 min
                                </span>
                            </div>
                            <p className="font-bold text-[14px]" style={{ color: WELLNESS.bgCard }}>Programa de Optimización</p>
                            <p className="text-[12px] mt-1 leading-snug" style={{ color: `${WELLNESS.bgCard}8C` }}>
                                Revisión de tu score con un profesional médico y definición de tus 2 prioridades
                            </p>
                            <div className="mt-2.5 flex flex-col gap-1">
                                {['Análisis de tus 5 dimensiones', 'Identificación de áreas críticas', 'Recomendaciones iniciales del equipo médico'].map(b => (
                                    <p key={b} className="text-[11px] flex items-start gap-1.5" style={{ color: `${WELLNESS.bgCard}80` }}>
                                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span> {b}
                                    </p>
                                ))}
                            </div>
                        </button>

                        {/* Opción B — Acompañamiento Médico */}
                        <button
                            onClick={() => navigate('/consulta?tipo=profunda')}
                            className="w-full text-left rounded-2xl p-4 relative transition-all active:scale-95"
                            style={{ border: `1.5px solid ${WELLNESS.tealMicro}`, background: `${WELLNESS.tealMicro}18` }}
                        >
                            <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                                style={{ background: WELLNESS.tealMicro, color: WELLNESS.earthDark }}>
                                Recomendado
                            </span>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                    style={{ background: `${WELLNESS.tealMicro}30`, color: WELLNESS.tealMicro }}>
                                    USD 49 · 45 min
                                </span>
                            </div>
                            <p className="font-bold text-[14px]" style={{ color: WELLNESS.bgCard }}>Evaluación de Longevidad</p>
                            <p className="text-[12px] mt-1 leading-snug" style={{ color: `${WELLNESS.bgCard}8C` }}>
                                Evaluación biofísica completa con especialista + reporte de optimización
                            </p>
                            <div className="mt-2.5 flex flex-col gap-1">
                                {[
                                    'Evaluación biofísica con especialista',
                                    'Reporte de Edad Celular completa',
                                    'Plan de optimización de 30 días',
                                    'Acceso al ecosistema Longevidad'
                                ].map(b => (
                                    <p key={b} className="text-[11px] flex items-start gap-1.5" style={{ color: `${WELLNESS.bgCard}99` }}>
                                        <span style={{ color: WELLNESS.tealMicro }}>•</span> {b}
                                    </p>
                                ))}
                            </div>
                        </button>

                        {/* Quick action repeat test */}
                        <button onClick={() => navigate('/test')}
                            className="w-full text-center py-3 text-[12px] transition-all"
                            style={{ color: `${WELLNESS.bgCard}59` }}>
                            Repetir evaluación →
                        </button>
                    </motion.div>
                )}
                {/* ── LINK DISCRETO PACIENTES ── */}
                <div className="text-center opacity-60 mb-6">
                    <span className="text-[12px]" style={{ color: WELLNESS.bgCard }}>
                        ¿Ya eres parte del programa?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="underline font-bold"
                            style={{ color: WELLNESS.bgCard }}
                        >
                            Ingresar →
                        </button>
                    </span>
                </div>

                {/* Final Footer */}
                <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] opacity-30 mt-4 mb-4" style={{ color: WELLNESS.bgCard }}>
                    Creado por Vytalix.io
                </p>
            </div>
        </div>
    );
};

export default ResultadoScorePage;
