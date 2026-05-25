import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';
import WellnessDisclaimer from '../../components/public/WellnessDisclaimer';

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
const CAT: Record<
  Category,
  { color: string; bg: string; border: string; label: string; text: string }
> = {
  EXCELENTE: {
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.1)',
    border: 'rgba(20,184,166,0.3)',
    label: 'Excelente Vitalidad',
    text: 'text-[#14b8a6]',
  },
  BUENO: {
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.1)',
    border: 'rgba(20,184,166,0.3)',
    label: 'Buena Condición',
    text: 'text-[#14b8a6]',
  },
  REGULAR: {
    color: '#293b64',
    bg: 'rgba(41,59,100,0.1)',
    border: 'rgba(41,59,100,0.3)',
    label: 'Área de Oportunidad',
    text: 'text-[#293b64]',
  },
  CRITICO: {
    color: '#293b64',
    bg: 'rgba(41,59,100,0.1)',
    border: 'rgba(41,59,100,0.3)',
    label: 'Atención Prioritaria',
    text: 'text-[#293b64]',
  },
};

const DIMENSIONS: { key: string; label: string }[] = [
  { key: 'grupo1', label: 'Energía y Estado Mental' },
  { key: 'grupo2', label: 'Sueño y Cognición' },
  { key: 'grupo3', label: 'Composición Corporal' },
  { key: 'grupo4', label: 'Signos de Vitalidad' },
  { key: 'grupo5', label: 'Capacidad Física' },
];

/* ─── Semicircular Gauge ────────────────────────────────────────────── */
const SemiGauge: React.FC<{ score: number; color: string }> = ({
  score,
  color,
}) => {
  const R = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * R; // half-circle
  const arcLength = circumference * (score / 100);

  return (
    <svg viewBox="0 0 200 110" className="w-56 h-auto">
      {/* Track */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        stroke="rgba(59,54,49,0.06)"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Progress */}
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
  if (v >= 60) return '#14b8a6'; // Teal
  return '#293b64'; // Navy
}

const ResultadoScorePage: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<
    'basica' | 'profunda' | null
  >(null);

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>(
    'idle',
  );
  const alreadyCaptured = !!sessionStorage.getItem('vx_lead_email');

  useEffect(() => {
    const raw = sessionStorage.getItem('vx_test_result');
    const ageBotRaw = sessionStorage.getItem('da_agebot_result');

    if (raw) {
      try {
        setResult(JSON.parse(raw));
        sessionStorage.setItem('da_result_source', 'test');
      } catch {
        navigate('/longevidad');
      }
    } else if (ageBotRaw) {
      try {
        const ageBotData = JSON.parse(ageBotRaw);
        const estimatedScore = Math.max(
          20,
          Math.min(85, Math.round(100 - (ageBotData.estimatedAge - 30) * 0.8)),
        );

        const category: Category =
          estimatedScore >= 80
            ? 'EXCELENTE'
            : estimatedScore >= 60
              ? 'BUENO'
              : estimatedScore >= 40
                ? 'REGULAR'
                : 'CRITICO';

        setResult({
          score: estimatedScore,
          category,
          dimensiones: {
            grupo1: estimatedScore,
            grupo2: estimatedScore,
            grupo3: estimatedScore,
            grupo4: estimatedScore,
            grupo5: estimatedScore,
          },
        });
        sessionStorage.setItem('da_result_source', 'agebot');
      } catch {
        navigate('/longevidad');
      }
    } else {
      navigate('/longevidad');
    }
  }, [navigate]);

  if (!result) return null;

  const cat = CAT[result.category];
  const score = result.score;

  const hookConfig =
    score < 50
      ? {
          color: '#293b64',
          icon: <AlertTriangle size={20} />,
          title: 'Tu score indica áreas de atención prioritaria',
          rangeBadge: 'Optimización Activa',
          context:
            'Tu biología está respondiendo a patrones que aceleran el envejecimiento celular. El 70% de estos factores son modificables con el protocolo correcto.',
          opportunity:
            'Una evaluación clínica puede identificar exactamente cuáles son tus prioridades de mayor impacto vital.',
        }
      : {
          color: '#14b8a6',
          icon: <ShieldCheck size={20} />,
          title: 'Tu score refleja una base sólida de vitalidad',
          rangeBadge: 'Rango de Excelencia',
          context:
            'Tus hábitos actuales están funcionando. La diferencia entre salud "estándar" y longevidad "premium" está en la precisión clínica.',
          opportunity:
            'El protocolo personalizado puede consolidar este estado y preservarlo 15–20 años más allá del promedio biológico.',
        };

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
          name: leadName,
          email: leadEmail,
          score,
          category: result.category,
          source: 'test_antivejez',
        }),
      });
      if (!res.ok) throw new Error('API unavailable');
    } catch {
      const pending = JSON.parse(
        localStorage.getItem('da_pending_leads') || '[]',
      );
      pending.push({ name: leadName, email: leadEmail, score, ts: Date.now() });
      localStorage.setItem('da_pending_leads', JSON.stringify(pending));
    }

    setLeadStatus('sent');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-20 bg-vytalix-sand">
      <div className="w-full max-w-[420px] px-6 pt-12">
        {/* ── BLOQUE 1: Hero Score ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative flex flex-col items-center mb-4">
            <SemiGauge
              score={score}
              color={score >= 60 ? '#14b8a6' : '#293b64'}
            />
            <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-6xl font-black text-vytalix-graphite tracking-tighter leading-none"
              >
                {score}
              </motion.span>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-vytalix-graphite/30 mt-2">
                SCORE VITAL
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-sm"
            style={{
              background: cat.bg,
              border: `1px solid ${cat.border}`,
              color: cat.color,
            }}
          >
            {cat.label}
          </motion.div>

          {sessionStorage.getItem('da_result_source') === 'agebot' && (
            <div className="mt-8 p-5 bg-white rounded-3xl border border-vytalix-terracotta/20 animate-pulse-subtle">
              <div className="flex items-start gap-4 mb-4">
                <Info className="w-6 h-6 shrink-0 text-vytalix-terracotta" />
                <p className="text-[13px] font-medium leading-relaxed text-vytalix-graphite/70">
                  Este score es una{' '}
                  <strong className="text-vytalix-terracotta">
                    estimación biométrica facial
                  </strong>
                  . Realiza el test clínico para precisión total.
                </p>
              </div>
              <button
                onClick={() => navigate('/test')}
                className="w-full py-3 bg-vytalix-sand text-vytalix-terracotta font-black text-[11px] uppercase tracking-widest rounded-xl border border-vytalix-terracotta/30"
              >
                Iniciar Test Completo →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── BLOQUE 2: Hook ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2rem] p-8 border border-vytalix-graphite/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0" style={{ color: hookConfig.color }}>
              {hookConfig.icon}
            </div>
            <div>
              <p className="text-lg font-black leading-tight text-vytalix-graphite tracking-tight mb-2">
                {hookConfig.title}
              </p>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-vytalix-sand border border-vytalix-graphite/5"
                style={{ color: hookConfig.color }}
              >
                {hookConfig.rangeBadge}
              </span>
            </div>
          </div>
          <p className="text-[14px] leading-relaxed text-vytalix-graphite/60 mb-6 font-medium">
            {hookConfig.context}
          </p>
          <div className="p-4 bg-vytalix-sand/50 rounded-2xl border border-vytalix-graphite/5">
            <p className="text-[13px] leading-relaxed text-vytalix-graphite font-semibold">
              {hookConfig.opportunity}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-vytalix-graphite/5">
            <WellnessDisclaimer text="Este análisis es una estimación biológica. La edad celular real requiere evaluación clínica." />
          </div>
        </motion.div>

        {/* ── BLOQUE 3: Dimension Bars ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[2rem] p-8 border border-vytalix-graphite/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] mb-8"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-vytalix-sage mb-8">
            Mapa de Biomarcadores
          </p>
          <div className="space-y-6">
            {DIMENSIONS.map((d, i) => {
              const val = result.dimensiones[d.key] ?? 50;
              const col = barColor(val);
              return (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-vytalix-graphite tracking-tight">
                      {d.label}
                    </span>
                    <span
                      className="text-[11px] font-black"
                      style={{ color: col }}
                    >
                      {val}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-vytalix-sand overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: col }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 1,
                        ease: 'circOut',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── BLOQUE 4: Lead Capture ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-vytalix-graphite text-white rounded-[2rem] p-8 shadow-xl shadow-vytalix-graphite/20 mb-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-vytalix-sage/20 blur-3xl -mr-16 -mt-16" />

          <AnimatePresence mode="wait">
            {!alreadyCaptured && leadStatus !== 'sent' ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleLead}
                className="relative z-10"
              >
                <p className="text-xl font-black mb-3 tracking-tight">
                  Reporte de Bio-Optimización
                </p>
                <p className="text-xs mb-8 text-white/50 leading-relaxed font-medium uppercase tracking-widest">
                  Enviamos tu protocolo inicial y el desglose de tus 5
                  dimensiones clínicas.
                </p>
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="TU NOMBRE"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-vytalix-sage transition-all placeholder:text-white/30"
                  />
                  <input
                    type="email"
                    placeholder="TU@EMAIL.COM"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-vytalix-sage transition-all placeholder:text-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadStatus === 'sending'}
                  className="w-full py-5 bg-vytalix-sage text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-vytalix-sage/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {leadStatus === 'sending' ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    'ACTIVAR PROTOCOLO'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 relative z-10"
              >
                <CheckCircle
                  size={56}
                  className="text-vytalix-sage mx-auto mb-6"
                />
                <p className="text-xl font-black mb-2 uppercase tracking-tighter">
                  Acceso Concedido
                </p>
                <p className="text-[13px] text-white/50 font-medium">
                  Tu reporte clínico está en camino.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── BLOQUE 5: Next Steps ── */}
        {(alreadyCaptured || leadStatus === 'sent') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 mb-12"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-vytalix-graphite/40 text-center mb-2">
              SIGUIENTE PASO CLÍNICO
            </p>

            <button
              onClick={() => setSelectedTier('basica')}
              className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 ${
                selectedTier === 'basica'
                  ? 'border-vytalix-sage bg-vytalix-sage/5'
                  : 'border-vytalix-graphite/5 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-vytalix-sand text-vytalix-graphite/40 tracking-widest">
                  Inversión: $0
                </span>
                {selectedTier === 'basica' && (
                  <CheckCircle className="text-vytalix-sage" size={20} />
                )}
              </div>
              <p className="text-base font-black text-vytalix-graphite tracking-tight">
                Review de Optimización
              </p>
              <p className="text-xs mt-1 text-vytalix-graphite/50 font-medium leading-relaxed">
                Definición de tus 2 prioridades críticas con nuestro equipo
                médico.
              </p>

              {selectedTier === 'basica' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/consulta?tipo=basica');
                  }}
                  className="w-full mt-6 py-4 bg-vytalix-sage text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md"
                >
                  Agendar Sesión →
                </motion.button>
              )}
            </button>

            <button
              onClick={() => setSelectedTier('profunda')}
              className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 relative overflow-hidden ${
                selectedTier === 'profunda'
                  ? 'border-vytalix-terracotta bg-vytalix-terracotta/5'
                  : 'border-vytalix-graphite/5 bg-white'
              }`}
            >
              <div className="absolute top-0 right-0 py-1 px-4 bg-vytalix-terracotta text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-bl-xl">
                Protocolo Full
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-vytalix-terracotta/10 text-vytalix-terracotta tracking-widest">
                  Vytalix Premium
                </span>
                {selectedTier === 'profunda' && (
                  <CheckCircle className="text-vytalix-terracotta" size={20} />
                )}
              </div>
              <p className="text-base font-black text-vytalix-graphite tracking-tight">
                Evaluación de Edad Celular
              </p>
              <p className="text-xs mt-1 text-vytalix-graphite/50 font-medium leading-relaxed">
                Evaluación biofísica multimodal + Plan maestro de longevidad.
              </p>

              {selectedTier === 'profunda' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/consulta?tipo=profunda');
                  }}
                  className="w-full mt-6 py-4 bg-vytalix-terracotta text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md"
                >
                  Comenzar Programa →
                </motion.button>
              )}
            </button>
          </motion.div>
        )}

        <div className="text-center pb-12">
          <p className="text-[10px] font-semibold text-vytalix-graphite/30 uppercase tracking-[0.4em] mb-4">
            VYTALIX Longevity Suite
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-black uppercase tracking-widest text-vytalix-graphite/50 underline decoration-vytalix-graphite/10"
          >
            Portal Médico →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultadoScorePage;
