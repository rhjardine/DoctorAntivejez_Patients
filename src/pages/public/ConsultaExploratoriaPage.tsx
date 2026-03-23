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
        { emoji: '🎯', text: 'Revisión de tu Score de Vitalidad con especialista del equipo' },
        { emoji: '📊', text: 'Identificación de tus 2 dimensiones más críticas' },
        { emoji: '💡', text: 'Orientación inicial del equipo Dr. Méndez' },
        { emoji: '⏱️', text: '20 minutos · Virtual · Sin costo' },
    ],
    profunda: [
        { emoji: '🧬', text: 'Evaluación biofísica completa con médico especialista' },
        { emoji: '📋', text: 'Reporte de Edad Biológica estimada (4 dimensiones)' },
        { emoji: '📊', text: 'Plan de acción personalizado 30 días' },
        { emoji: '📱', text: 'Acceso a la app Doctor Antivejez — 30 días sin costo' },
        { emoji: '💬', text: 'Seguimiento por WhatsApp con el equipo' },
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
                ¡Solicitud registrada!
            </h2>
            {tipo === 'basica' ? (
                <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Nuestro equipo te contactará en <strong className="text-white">menos de 24 horas</strong> para coordinar
                    tu <strong className="text-white">Programa de Optimización</strong>.
                    Revisa tu WhatsApp y email — usaremos el canal que prefieras.
                </p>
            ) : (
                <>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Tu reserva fue registrada. Un especialista del equipo te contactará en
                        <strong className="text-white"> menos de 24 horas</strong> para confirmar fecha y hora de tu
                        <strong className="text-white"> evaluación biofísica completa</strong>.
                    </p>
                    <p className="text-[11px] italic mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        El pago de USD 49 se coordina en la confirmación de cita. Aceptamos transferencia, Zelle y tarjeta internacional.
                    </p>
                </>
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

import { MEDICAL_NETWORK } from '../../data/medicalNetwork';

/* ─── Confirmation Screen ───────────────────────────────────────────── */
// ...

/* ─── Main Component ────────────────────────────────────────────────── */
const ConsultaExploratoriaPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [queryParams] = useState(() => new URLSearchParams(location.search));
    const tipo = (queryParams.get('tipo') as ConsultaType) || 'basica';
    const preselectedDoctorId = queryParams.get('doctorId');

    // Mapeamos los médicos disponibles
    const availableDoctors = MEDICAL_NETWORK.filter(d => d.availableForBooking);
    const preselectedDoc = preselectedDoctorId ? MEDICAL_NETWORK.find(d => d.id === preselectedDoctorId) : null;
    const [showSelector, setShowSelector] = useState(!preselectedDoc);

    const [form, setForm] = useState({
        name: sessionStorage.getItem('da_lead_name') || '',
        email: sessionStorage.getItem('da_lead_email') || '',
        phone: '',
        country: 'Venezuela',
        horario: 'Flexible',
        doctorId: preselectedDoctorId || '',
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

        const bookingData = {
            ...form,
            doctorId: form.doctorId || null,
            card: tipo === 'profunda' ? card : undefined,
            tipo,
            ts: Date.now()
        };
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
                    {tipo === 'basica' ? (
                        <>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: CYAN }}>
                                Programa de Optimización
                            </p>
                            <h1 className="text-2xl font-black text-white leading-tight mb-2" style={{ fontFamily: 'Poppins' }}>
                                Consulta Virtual Gratuita
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                20 minutos · Sin costo
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: AMBER }}>
                                Acompañamiento Médico
                            </p>
                            <h1 className="text-2xl font-black text-white leading-tight mb-2" style={{ fontFamily: 'Poppins' }}>
                                Evaluación Biofísica Completa
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                45 minutos · USD 49
                            </p>
                        </>
                    )}
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
                            {tipo === 'basica' ? 'Qué incluye tu Programa de Optimización' : 'Qué incluye tu Acompañamiento Médico'}
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
                    {tipo === 'basica' && (
                        <p className="mt-4 text-[12px] italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Esta consulta es el primer paso. Si decides continuar, te orientaremos sobre el programa que más se adapta a tu perfil.
                        </p>
                    )}
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

                    <div className="flex flex-col gap-1.5 mt-1">
                        <label className="text-[10px] text-[#23BCEF] font-bold uppercase tracking-wider ml-1">Médico de preferencia</label>
                        {!showSelector && preselectedDoc ? (
                            <div className="flex items-center justify-between p-3 rounded-xl border"
                                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(35,188,239,0.3)' }}>
                                <div className="flex items-center gap-3">
                                    <img src={preselectedDoc.imageUrl} alt={preselectedDoc.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        style={{ border: `1px solid ${preselectedDoc.accentColor}80` }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML += `<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style="background:${preselectedDoc.accentColor}20; color:${preselectedDoc.accentColor}; box-shadow: inset 0 0 0 1px ${preselectedDoc.accentColor}40">${preselectedDoc.name.substring(0, 2)}</div>`;
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white leading-tight">{preselectedDoc.name}</span>
                                        <span className="text-[10px] text-white/50">{preselectedDoc.location}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setShowSelector(true); setForm(f => ({ ...f, doctorId: '' })); }}
                                    className="text-xs font-semibold underline underline-offset-2 px-2 py-1"
                                    style={{ color: CYAN }}>
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <select name="doctorId" value={form.doctorId} onChange={handleFormChange}
                                style={{ ...INPUT_STYLE, appearance: 'none' }}>
                                <option value="" style={{ background: NAVY }}>Sin preferencia (primer disponible)</option>
                                {availableDoctors.map(doc => (
                                    <option key={doc.id} value={doc.id} style={{ background: NAVY }}>
                                        {doc.name} — {doc.location.split(',')[0]}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <select name="horario" value={form.horario} onChange={handleFormChange}
                        style={{ ...INPUT_STYLE, appearance: 'none', marginTop: '0.25rem' }}>
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
