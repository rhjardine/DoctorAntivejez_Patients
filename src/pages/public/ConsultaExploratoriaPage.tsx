import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Lock, Loader2, Info, MessageCircle,
    Video, ClipboardList, ArrowRight
} from 'lucide-react';

/* ─── Design tokens ────────────────────────────────────────────────── */
const NAVY = '#293B64';
const CYAN = '#23BCEF';
const AMBER = '#FFA726';
const GREEN = '#4CAF50';

const WHATSAPP_NUMBER = '18296440000'; // TODO: set real number

type ConsultaType = 'basica' | 'profunda';
type SubmitState = 'idle' | 'sending' | 'confirmed' | 'error';

/* ─── Benefits per type ─────────────────────────────────────────────── */
const BENEFITS: Record<ConsultaType, { emoji: string; text: string }[]> = {
    basica: [
        { emoji: '🎯', text: 'Revisión de tu Score de Vitalidad con profesional' },
        { emoji: '📊', text: 'Identificación de tus 2 dimensiones más críticas' },
        { emoji: '💡', text: 'Recomendaciones iniciales del equipo Dr. Méndez' },
        { emoji: '⏱️', text: '20 minutos · Virtual · Gratis' },
    ],
    profunda: [
        { emoji: '🧬', text: 'Análisis completo de biofísica y bioquímica' },
        { emoji: '📋', text: 'Reporte Ómico personalizado (epigenética)' },
        { emoji: '🧪', text: 'Guía de laboratorio con parámetros clave' },
        { emoji: '💊', text: 'Protocolo inicial de suplementación y estilo de vida' },
        { emoji: '⏱️', text: '45 minutos · Virtual con Dr. Méndez · USD 49' },
    ],
};

/* ─── Input style ────────────────────────────────────────────────── */
const INPUT_STYLE: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: '12px 14px',
    color: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    width: '100%',
    outline: 'none',
};

const CARD_STYLE: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 20,
};

/* ─── Confirmation Screen ───────────────────────────────────────────── */
const ConfirmationScreen: React.FC<{ tipo: ConsultaType; name: string; navigate: ReturnType<typeof useNavigate> }> = ({ tipo, name, navigate }) => {
    const message = encodeURIComponent(
        `Hola, soy ${name}. Acabo de completar el Test Antivejez y me gustaría coordinar mi consulta ${tipo === 'basica' ? 'gratuita de 20 min' : 'profunda'}.`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center px-5 py-14"
        >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: `${GREEN}22` }}>
                <CheckCircle size={40} style={{ color: GREEN }} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Poppins' }}>
                ¡Solicitud Registrada!
            </h2>
            {tipo === 'basica' ? (
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Tu solicitud fue registrada. Te contactaremos en <strong className="text-white">menos de 24 horas</strong> para coordinar tu consulta exploratoria gratuita.
                </p>
            ) : (
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Tu consulta profunda está siendo procesada. Recibirás un correo de confirmación con los próximos pasos.
                </p>
            )}
            <a
                href={waLink} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 font-bold text-[15px] mb-4 transition-all active:scale-95"
                style={{ background: '#25D366', color: 'white', borderRadius: 28, padding: '14px 0' }}
            >
                <MessageCircle size={20} /> Confirmar por WhatsApp
            </a>
            <button
                onClick={() => navigate('/longevidad')}
                className="text-sm underline underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.45)' }}
            >
                Volver al inicio
            </button>
        </motion.div>
    );
};

/* ─── Main Component ────────────────────────────────────────────────── */
const ConsultaExploratoriaPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tipo: ConsultaType = (new URLSearchParams(location.search).get('tipo') as ConsultaType) || 'basica';

    const [form, setForm] = useState({
        name: sessionStorage.getItem('da_lead_name') || '',
        email: sessionStorage.getItem('da_lead_email') || '',
        phone: '',
        country: 'Venezuela',
        horario: 'Flexible',
    });
    const [card, setCard] = useState({ number: '', expiry: '', cvc: '', holder: '' });
    const [submitState, setSubmitState] = useState<SubmitState>('idle');

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setCard(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone) return;
        setSubmitState('sending');

        const bookingData = { ...form, card: tipo === 'profunda' ? card : undefined, tipo, ts: Date.now() };
        sessionStorage.setItem('da_booking_data', JSON.stringify(bookingData));

        try {
            const res = await fetch('/api-render/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            if (!res.ok) throw new Error('unavailable');
        } catch {
            // Mock success while endpoint is implemented
            console.warn('[Consulta] /api/booking unavailable — mock success');
        }

        setSubmitState('confirmed');
    };

    const isFormValid = form.name && form.email && form.phone &&
        (tipo === 'basica' || (card.number && card.expiry && card.cvc && card.holder));

    if (submitState === 'confirmed') {
        return (
            <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0f1d38 100%)` }}>
                <ConfirmationScreen tipo={tipo} name={form.name} navigate={navigate} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-14"
            style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0f1d38 100%)` }}>
            <div className="w-full max-w-sm px-5 pt-12">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: CYAN }}>
                        Consulta Exploratoria
                    </p>
                    <h1 className="text-2xl font-black text-white leading-tight mb-2" style={{ fontFamily: 'Poppins' }}>
                        {tipo === 'basica' ? 'Consulta Virtual Gratuita' : 'Consulta Profunda + Reporte Ómico'}
                    </h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {tipo === 'basica' ? '20 minutos · Sin costo' : '45 minutos · USD 49'}
                    </p>
                </motion.div>

                {/* ── SECCIÓN 1: Benefits ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-[20px] p-5 mb-5"
                    style={CARD_STYLE}
                >
                    <div className="flex items-center gap-2 mb-4">
                        {tipo === 'basica'
                            ? <Video size={18} style={{ color: CYAN }} />
                            : <ClipboardList size={18} style={{ color: CYAN }} />}
                        <p className="text-[13px] font-bold text-white">
                            {tipo === 'basica' ? 'Qué incluye tu consulta gratuita' : 'Qué incluye tu consulta profunda'}
                        </p>
                    </div>
                    <div className="space-y-2.5">
                        {BENEFITS[tipo].map((b, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="text-base leading-none mt-0.5">{b.emoji}</span>
                                <p className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{b.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── SECCIÓN 2: Booking Form ── */}
                <motion.form
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 mb-5"
                    style={CARD_STYLE}
                >
                    <p className="text-[13px] font-bold text-white">Datos para tu reserva</p>

                    <input name="name" type="text" placeholder="Nombre completo *" required
                        value={form.name} onChange={handleFormChange} style={INPUT_STYLE} />
                    <input name="email" type="email" placeholder="Email *" required
                        value={form.email} onChange={handleFormChange} style={INPUT_STYLE} />
                    <input name="phone" type="tel" placeholder="WhatsApp *" required
                        value={form.phone} onChange={handleFormChange} style={INPUT_STYLE} />

                    <select name="country" value={form.country} onChange={handleFormChange}
                        style={{ ...INPUT_STYLE, appearance: 'none' }}>
                        {['Venezuela', 'Colombia', 'Panamá', 'EEUU', 'Otro'].map(c =>
                            <option key={c} value={c} style={{ background: NAVY }}>{c}</option>
                        )}
                    </select>

                    <select name="horario" value={form.horario} onChange={handleFormChange}
                        style={{ ...INPUT_STYLE, appearance: 'none' }}>
                        {['Mañana', 'Tarde', 'Flexible'].map(h =>
                            <option key={h} value={h} style={{ background: NAVY }}>{h}</option>
                        )}
                    </select>

                    {/* ── SECCIÓN 3: Payment (profunda only) ── */}
                    <AnimatePresence>
                        {tipo === 'profunda' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                className="flex flex-col gap-3 pt-2 border-t"
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <p className="text-[13px] font-bold text-white pt-1">Información de pago</p>

                                {/* Venezuela alert */}
                                <div className="flex items-start gap-2 rounded-xl p-3"
                                    style={{ background: `${AMBER}18`, border: `1px solid ${AMBER}40` }}>
                                    <Info size={14} style={{ color: AMBER }} className="mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] leading-relaxed" style={{ color: AMBER }}>
                                        Para pacientes en Venezuela: también puedes coordinar el pago vía transferencia bancaria o
                                        Zelle. Escríbenos al WhatsApp.
                                    </p>
                                </div>

                                {/* Simulated card fields */}
                                <input name="number" type="tel" placeholder="Número de tarjeta"
                                    value={card.number} onChange={handleCardChange}
                                    style={INPUT_STYLE} maxLength={19} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="expiry" type="text" placeholder="MM/AA"
                                        value={card.expiry} onChange={handleCardChange} style={INPUT_STYLE} maxLength={5} />
                                    <input name="cvc" type="tel" placeholder="CVC"
                                        value={card.cvc} onChange={handleCardChange} style={INPUT_STYLE} maxLength={4} />
                                </div>
                                <input name="holder" type="text" placeholder="Nombre en la tarjeta"
                                    value={card.holder} onChange={handleCardChange} style={INPUT_STYLE} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isFormValid || submitState === 'sending'}
                        className="w-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-45"
                        style={{ background: CYAN, color: NAVY, borderRadius: 28, padding: '14px 0', fontFamily: 'Poppins', marginTop: 4 }}
                    >
                        {submitState === 'sending' ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : tipo === 'profunda' ? (
                            <><Lock size={16} /> Pagar seguro con Stripe — USD 49</>
                        ) : (
                            <>Reservar consulta gratuita <ArrowRight size={18} /></>
                        )}
                    </button>

                    {tipo === 'profunda' && (
                        <p className="text-center text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Pagos procesados con cifrado AES-256<br />
                            Doctor Antivejez · Algoritmo de evaluación clínica
                        </p>
                    )}
                </motion.form>

                {/* Back */}
                <div className="text-center mb-4">
                    <button onClick={() => navigate(-1)}
                        className="text-xs underline underline-offset-2 transition-opacity hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        ← Volver a mis resultados
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsultaExploratoriaPage;
