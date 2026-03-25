import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Lock, Loader2, Info, MessageCircle,
    Video, ClipboardList, ArrowRight
} from 'lucide-react';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';
import { WELLNESS } from '../../styles/wellnessPalette';
import { MEDICAL_NETWORK } from '../../data/medicalNetwork';

const WHATSAPP_NUMBER = '18296440000'; // TODO: set real number

type ConsultaType = 'basica' | 'profunda' | 'avanzado';
type SubmitState = 'idle' | 'sending' | 'confirmed' | 'error';

/* ─── Benefits per type ─────────────────────────────────────────────── */
const BENEFITS: Record<ConsultaType, { emoji: string; text: string }[]> = {
    basica: [
        { emoji: '🎯', text: `Revisión de tu ${VITALITY_LABELS.age_front} con especialista del equipo` },
        { emoji: '📊', text: 'Identificación de tus 2 dimensiones más críticas' },
        { emoji: '💡', text: 'Orientación inicial del equipo especialista' },
        { emoji: '⏱️', text: '20 minutos · Virtual · Sin costo' },
    ],
    profunda: [
        { emoji: '🧬', text: 'Evaluación biofísica completa con médico especialista' },
        { emoji: '📋', text: `Reporte de ${VITALITY_LABELS.age_result} (4 dimensiones)` },
        { emoji: '📊', text: 'Plan de acción personalizado 30 día' },
        { emoji: '📱', text: 'Acceso a la plataforma de Longevidad — 30 días' },
        { emoji: '💬', text: 'Seguimiento por WhatsApp con el equipo médico' },
    ],
    avanzado: [
        { emoji: '🩺', text: 'Evaluación integral con equipo multidisciplinario' },
        { emoji: '🧬', text: 'Biomarcadores avanzados y análisis genético' },
        { emoji: '⭐', text: 'Plan maestro de salud y longevidad' },
        { emoji: '🎯', text: 'Monitoreo continuo y ajustes personalizados' },
    ],
};

/* ─── Dynamic Styles ────────────────────────────────────────────────── */
const INPUT_STYLE: React.CSSProperties = {
    background: 'white',
    border: `1px solid ${WELLNESS.earth}33`,
    borderRadius: 16,
    padding: '14px 16px',
    color: WELLNESS.earthDark,
    fontFamily: 'Poppins, sans-serif',
    fontSize: 15,
    fontWeight: 500,
    width: '100%',
    outline: 'none',
};

const CARD_STYLE: React.CSSProperties = {
    background: 'white',
    border: `1px solid ${WELLNESS.earth}1A`,
    borderRadius: 32,
    padding: 24,
    boxShadow: '0 10px 30px -10px rgba(92,74,50,0.06)',
};

/* ─── Confirmation Screen ───────────────────────────────────────────── */
const ConfirmationScreen: React.FC<{ tipo: ConsultaType; name: string; navigate: ReturnType<typeof useNavigate> }> = ({ tipo, name, navigate }) => {
    const message = encodeURIComponent(
        `Hola, soy ${name}. Acabo de completar el protocolo y me gustaría coordinar mi ${tipo === 'basica' ? 'Programa de Optimización sin costo' : 'Evaluación de Longevidad'}.`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center px-8 py-16 min-h-screen"
            style={{ background: WELLNESS.bg }}
        >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: `${WELLNESS.sage}22` }}>
                <CheckCircle size={40} style={{ color: WELLNESS.sage }} />
            </div>
            <h2 className="text-2xl font-black mb-4" style={{ color: WELLNESS.earthDark }}>
                ¡Solicitud registrada!
            </h2>
            {tipo === 'basica' ? (
                <p className="text-[15px] leading-relaxed mb-10" style={{ color: WELLNESS.textSecond }}>
                    Nuestro equipo te contactará en <strong style={{ color: WELLNESS.earthDark }}>menos de 24 horas</strong> para coordinar
                    tu <strong style={{ color: WELLNESS.earthDark }}>Programa de Optimización</strong>.<br />
                    Revisa tu WhatsApp o Email.
                </p>
            ) : (
                <>
                    <p className="text-[15px] leading-relaxed mb-4" style={{ color: WELLNESS.textSecond }}>
                        Tu reserva fue registrada. Un especialista te contactará en
                        <strong style={{ color: WELLNESS.earthDark }}> menos de 24 horas</strong> para confirmar tu
                        <strong style={{ color: WELLNESS.earthDark }}> Evaluación de Longevidad</strong>.
                    </p>
                    <p className="text-[11px] italic mb-10 leading-relaxed" style={{ color: WELLNESS.textHint }}>
                        El pago de USD 49 se coordina en la confirmación de cita. Aceptamos transferencia, Zelle y tarjeta internacional.
                    </p>
                </>
            )}
            <a
                href={waLink} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 font-black text-[16px] mb-6 transition-all active:scale-95 shadow-lg shadow-green-200"
                style={{ background: '#25D366', color: 'white', borderRadius: 32, padding: '16px 0' }}
            >
                <MessageCircle size={20} /> Confirmar por WhatsApp
            </a>
            <button
                onClick={() => navigate('/longevidad')}
                className="text-sm font-bold uppercase tracking-widest opacity-60"
                style={{ color: WELLNESS.earth }}
            >
                Volver al inicio
            </button>
            <div className="mt-auto opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest">Creado por Vytalix.io</p>
            </div>
        </motion.div>
    );
};

/* ─── Main Component ────────────────────────────────────────────────── */
const ConsultaExploratoriaPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [queryParams] = useState(() => new URLSearchParams(location.search));
    const tipo = (queryParams.get('tipo') as ConsultaType) || 'basica';
    const preselectedDoctorId = queryParams.get('doctorId');

    const availableDoctors = MEDICAL_NETWORK.filter(d => d.availableForBooking);
    const preselectedDoc = preselectedDoctorId ? MEDICAL_NETWORK.find(d => d.id === preselectedDoctorId) : null;
    const [showSelector, setShowSelector] = useState(!preselectedDoc);

    const [form, setForm] = useState({
        name: sessionStorage.getItem('vx_lead_name') || '',
        email: sessionStorage.getItem('vx_lead_email') || '',
        phone: '',
        country: 'Venezuela',
        horario: 'Flexible',
        doctorId: preselectedDoctorId || '',
    });
    const [card, setCard] = useState({ number: '', expiry: '', cvc: '', holder: '' });
    const [submitState, setSubmitState] = useState<SubmitState>('idle');

    // ── FIX 4: Cleanup session flags ──
    useEffect(() => {
        // Clean up bridge flags when entering the form
        sessionStorage.removeItem('da_result_source');

        return () => {
            // Also clean up on unmount if needed
            sessionStorage.removeItem('da_result_source');
        };
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setCard(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone) return;
        setSubmitState('sending');

        const bookingData = {
            ...form,
            doctorId: form.doctorId || null,
            card: tipo === 'profunda' ? card : undefined,
            tipo,
            ts: Date.now()
        };
        sessionStorage.setItem('vx_booking_data', JSON.stringify(bookingData));

        try {
            await fetch('/api-render/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
        } catch {
            console.warn('[Consulta] /api/booking mock success');
        }

        setSubmitState('confirmed');
    };

    const isFormValid = form.name && form.email && form.phone &&
        (tipo === 'basica' || (card.number && card.expiry && card.cvc && card.holder));

    if (submitState === 'confirmed') {
        return <ConfirmationScreen tipo={tipo} name={form.name} navigate={navigate} />;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-16 selection:bg-[#D97A5B] selection:text-white"
            style={{ background: WELLNESS.bg, color: WELLNESS.textPrimary, fontFamily: 'Poppins, sans-serif' }}>

            <div className="w-full max-w-md px-6 pt-12">

                {/* ── Brand Reinforcement ── */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center mb-10"
                >
                    <img src="/Logo_azul_oscuro.png" alt="Doctor Antivejez" className="h-10 w-auto object-contain mb-2 opacity-80" />
                    <p className="text-[9px] uppercase tracking-[0.25em] font-black opacity-40 text-center">
                        Centro de Medicina Antienvejecimiento<br />
                        Plataforma de Longevidad Certificada
                    </p>
                </motion.div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 text-center px-4">
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: WELLNESS.sage }}>
                        Tu Siguiente Paso
                    </p>
                    <h1 className="text-[28px] font-black leading-tight mb-3" style={{ color: WELLNESS.earthDark }}>
                        {tipo === 'basica' ? 'Programa de Optimización' : 'Edad Celular y Plan Personalizado de Longevidad'}
                    </h1>
                    <p className="text-[15px] font-semibold opacity-70" style={{ color: WELLNESS.textSecond }}>
                        {tipo === 'basica' ? '20 minutos · Virtual · Sin costo' : '45 minutos · Presencial o Virtual · USD 49'}
                    </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="mb-8"
                    style={CARD_STYLE}
                >
                    <div className="flex items-center gap-2.5 mb-5 border-b pb-4" style={{ borderColor: `${WELLNESS.earth}1A` }}>
                        {tipo === 'basica'
                            ? <Video size={20} style={{ color: WELLNESS.sage }} />
                            : <ClipboardList size={20} style={{ color: WELLNESS.sage }} />}
                        <p className="text-[15px] font-black uppercase tracking-wide" style={{ color: WELLNESS.earthDark }}>
                            Inclusiones del Programa
                        </p>
                    </div>
                    <div className="space-y-4">
                        {BENEFITS[tipo].map((b, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="text-xl leading-none">{b.emoji}</span>
                                <p className="text-[14px] font-semibold leading-relaxed" style={{ color: WELLNESS.textSecond }}>{b.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Booking Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 mb-8"
                    style={CARD_STYLE}
                >
                    <p className="text-[15px] font-black uppercase tracking-wide mb-1" style={{ color: WELLNESS.earthDark }}>
                        Datos para tu reserva
                    </p>

                    <input name="name" type="text" placeholder="Nombre completo *" required
                        value={form.name} onChange={handleFormChange} style={INPUT_STYLE} />
                    <input name="email" type="email" placeholder="Email *" required
                        value={form.email} onChange={handleFormChange} style={INPUT_STYLE} />
                    <input name="phone" type="tel" placeholder="WhatsApp / Teléfono *" required
                        value={form.phone} onChange={handleFormChange} style={INPUT_STYLE} />

                    <div className="relative">
                        <select name="country" value={form.country} onChange={handleFormChange}
                            style={{ ...INPUT_STYLE, appearance: 'none' }}>
                            {['Venezuela', 'Colombia', 'Panamá', 'EEUU', 'Otro'].map(c =>
                                <option key={c} value={c}>{c}</option>
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <ArrowRight size={16} className="rotate-90" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-1">
                        <label className="text-[11px] font-black uppercase tracking-widest ml-1 opacity-50">Especialista de preferencia</label>
                        {!showSelector && preselectedDoc ? (
                            <div className="flex items-center justify-between p-4 rounded-2xl border"
                                style={{ background: '#F8F1E9', borderColor: `${WELLNESS.sage}40` }}>
                                <div className="flex items-center gap-3">
                                    <img src={preselectedDoc.imageUrl} alt={preselectedDoc.name}
                                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                                        style={{ border: `2px solid white` }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML += `<div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style="background:${WELLNESS.sage}20; color:${WELLNESS.sage}">${preselectedDoc.name.substring(0, 2)}</div>`;
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black leading-tight" style={{ color: WELLNESS.earthDark }}>{preselectedDoc.name}</span>
                                        <span className="text-[10px] uppercase font-bold opacity-50">{preselectedDoc.location}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setShowSelector(true); setForm(f => ({ ...f, doctorId: '' })); }}
                                    className="text-[11px] font-black uppercase tracking-wider underline underline-offset-4"
                                    style={{ color: WELLNESS.terracotta }}>
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select name="doctorId" value={form.doctorId} onChange={handleFormChange}
                                    style={{ ...INPUT_STYLE, appearance: 'none' }}>
                                    <option value="">Cualquier especialista disponible</option>
                                    {availableDoctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} ({doc.location.split(',')[0]})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <ArrowRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <select name="horario" value={form.horario} onChange={handleFormChange}
                            style={{ ...INPUT_STYLE, appearance: 'none' }}>
                            {['Mañana', 'Tarde', 'Flexible'].map(h =>
                                <option key={h} value={h}>Preferencia: {h}</option>
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <ArrowRight size={16} className="rotate-90" />
                        </div>
                    </div>

                    {/* Payment (profunda only) */}
                    <AnimatePresence>
                        {tipo === 'profunda' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                className="flex flex-col gap-4 pt-4 border-t"
                                style={{ borderColor: `${WELLNESS.earth}1A` }}
                            >
                                <p className="text-[15px] font-black uppercase tracking-wide" style={{ color: WELLNESS.earthDark }}>
                                    Información de pago
                                </p>

                                <div className="flex items-start gap-3 rounded-2xl p-4"
                                    style={{ background: `${WELLNESS.nut}10`, border: `1px solid ${WELLNESS.nut}30` }}>
                                    <Info size={18} style={{ color: WELLNESS.nut }} className="mt-0.5 flex-shrink-0" />
                                    <p className="text-[12px] font-semibold leading-relaxed" style={{ color: WELLNESS.earthDark }}>
                                        Para agilizar tu proceso, puedes coordinar el pago vía Zelle o Transferencia una vez confirmada la cita.
                                    </p>
                                </div>

                                <input name="number" type="tel" placeholder="Número de tarjeta"
                                    value={card.number} onChange={handleCardChange}
                                    style={INPUT_STYLE} maxLength={19} />
                                <div className="grid grid-cols-2 gap-4">
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
                        className="w-full font-black text-[17px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-terracotta/20"
                        style={{ background: WELLNESS.terracotta, color: 'white', borderRadius: 32, padding: '18px 0', marginTop: 8 }}
                    >
                        {submitState === 'sending' ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : tipo === 'profunda' ? (
                            <><Lock size={18} /> Solicitar Evaluación — USD 49</>
                        ) : (
                            <>Solicitar Programa <ArrowRight size={20} /></>
                        )}
                    </button>
                </motion.form>

                {/* Back */}
                <div className="text-center mb-10">
                    <button onClick={() => navigate(-1)}
                        className="text-[11px] font-black uppercase tracking-widest opacity-40 underline underline-offset-8"
                        style={{ color: WELLNESS.earth }}>
                        ← Volver a mis resultados
                    </button>
                </div>

                {/* ── LINK DISCRETO PACIENTES ── */}
                <div className="text-center opacity-60 mb-6 mt-4">
                    <span className="text-[12px]" style={{ color: WELLNESS.earthDark }}>
                        ¿Ya eres parte del programa?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="underline font-bold"
                            style={{ color: WELLNESS.earthDark }}
                        >
                            Ingresar →
                        </button>
                    </span>
                </div>

                {/* Final Footer */}
                <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] opacity-30">
                    Creado por Vytalix.io
                </p>
            </div>
        </div>
    );
};

export default ConsultaExploratoriaPage;
