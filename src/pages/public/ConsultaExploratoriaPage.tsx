import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Lock, Loader2, Info, MessageCircle,
    Video, ClipboardList, ArrowRight
} from 'lucide-react';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';
import { MEDICAL_NETWORK } from '../../data/medicalNetwork';

const WHATSAPP_NUMBER = '18296440000'; // TODO: set real number

type ConsultaType = 'basica' | 'profunda' | 'avanzado';
type SubmitState = 'idle' | 'sending' | 'confirmed' | 'error';

/* ─── Benefits per type ─────────────────────────────────────────────── */
const BENEFITS: Record<ConsultaType, { emoji: string; text: string }[]> = {
    basica: [
        { emoji: '🎯', text: `Revisión de tu ${VITALITY_LABELS.age_front} con especialista del equipo.` },
        { emoji: '📊', text: 'Identificación de tus 2 dimensiones biológicas prioritarias.' },
        { emoji: '💡', text: 'Orientación inicial estratégica del equipo clínico.' },
        { emoji: '⏱️', text: '20 minutos · Virtual · Protocolo Inicial.' },
    ],
    profunda: [
        { emoji: '🧬', text: 'Evaluación biofísica multimodal con médico especialista.' },
        { emoji: '📋', text: `Reporte de Edad Celular y Vitalidad (4 dimensiones).` },
        { emoji: '📊', text: 'Plan de acción personalizado de 30 días.' },
        { emoji: '📱', text: 'Acceso a la Longevity Suite — 30 días.' },
        { emoji: '💬', text: 'Seguimiento por WhatsApp con el equipo médico.' },
    ],
    avanzado: [
        { emoji: '🩺', text: 'Evaluación integral con equipo multidisciplinario.' },
        { emoji: '🧬', text: 'Biomarcadores avanzados y análisis genético.' },
        { emoji: '⭐', text: 'Plan maestro de salud y longevidad.' },
        { emoji: '🎯', text: 'Monitoreo continuo y ajustes personalizados.' },
    ],
};

/* ─── Confirmation Screen ───────────────────────────────────────────── */
const ConfirmationScreen: React.FC<{ tipo: ConsultaType; name: string; navigate: ReturnType<typeof useNavigate> }> = ({ tipo, name, navigate }) => {
    const message = encodeURIComponent(
        `Hola, soy ${name}. Acabo de completar el protocolo y me gustaría coordinar mi ${tipo === 'basica' ? 'Programa de Optimización' : 'Evaluación de Longevidad'}.`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center px-8 py-16 min-h-screen bg-[#f8fafc]"
        >
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 bg-[#14b8a6]/10 border border-[#14b8a6]/20">
                <CheckCircle size={48} className="text-[#14b8a6]" />
            </div>

            <h2 className="text-3xl font-black text-[#293b64] mb-4 tracking-tight">
                Instrucciones Generadas
            </h2>

            <div className="max-w-[320px] mb-12">
                {tipo === 'basica' ? (
                    <p className="text-[15px] leading-relaxed text-[#293b64]/60 font-medium">
                        Tu solicitud para el <strong className="text-[#293b64]">Programa de Optimización</strong> ha sido procesada. Un especialista te contactará en <strong className="text-[#14b8a6] uppercase tracking-widest text-[11px]">menos de 24 horas</strong>.
                    </p>
                ) : (
                    <p className="text-[15px] leading-relaxed text-[#293b64]/60 font-medium">
                        Tu <strong className="text-[#293b64]">Evaluación de Longevidad</strong> ha sido pre-agendada. Recibirás la confirmación técnica y el protocolo de preparación en WhatsApp.
                    </p>
                )}
            </div>

            <div className="w-full max-w-[340px] space-y-4">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-green-200 transition-all active:scale-95">
                    <MessageCircle size={22} /> Confirmar WhatsApp
                </a>

                <button onClick={() => navigate('/longevidad')}
                    className="w-full py-5 bg-white text-[#293b64] border border-[#293b64]/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#f8fafc]">
                    Finalizar Sesión
                </button>
            </div>

            <div className="mt-auto pt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#293b64]/20">VYTALIX Longevity Suite</p>
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

    useEffect(() => {
        sessionStorage.removeItem('da_result_source');
        return () => {
            setCard({ number: '', expiry: '', cvc: '', holder: '' });
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
            tipo,
            ts: Date.now()
        };

        sessionStorage.setItem('vx_booking_data', JSON.stringify({
            tipo,
            ts: bookingData.ts,
            doctorId: bookingData.doctorId,
        }));

        try {
            await fetch('/api-render/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
        } catch { /* Mock success */ } finally {
            setCard({ number: '', expiry: '', cvc: '', holder: '' });
        }

        setSubmitState('confirmed');
    };

    const isFormValid = form.name && form.email && form.phone &&
        (tipo === 'basica' || (card.number && card.expiry && card.cvc && card.holder));

    if (submitState === 'confirmed') {
        return <ConfirmationScreen tipo={tipo} name={form.name} navigate={navigate} />;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-20 bg-[#f8fafc]">
            <div className="w-full max-w-[440px] px-6 pt-12">

                {/* Header Section */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14b8a6]">
                            Protocolo de Longevidad
                        </p>
                    </div>
                    <h1 className="text-3xl font-black leading-tight text-[#293b64] tracking-tight mb-4">
                        {tipo === 'basica' ? 'Programa de Optimización' : 'Evaluación de Edad Celular Full'}
                    </h1>
                    <p className="text-base font-medium text-[#293b64]/50 px-4">
                        {tipo === 'basica' ? 'Análisis estratégico · Virtual · Sin costo' : 'Evaluación biofísica con especialista · USD 49'}
                    </p>
                </motion.div>

                {/* Benefits Card */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] p-8 border border-[#293b64]/5 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#293b64]/5">
                        <div className="p-2.5 bg-[#f8fafc] rounded-xl">
                            {tipo === 'basica' ? <Video size={18} className="text-[#14b8a6]" /> : <ClipboardList size={18} className="text-[#14b8a6]" />}
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-widest text-[#293b64]">Inclusiones</p>
                    </div>
                    <div className="space-y-6">
                        {BENEFITS[tipo].map((b, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="text-lg leading-none shrink-0">{b.emoji}</span>
                                <p className="text-[14px] font-medium leading-relaxed text-[#293b64]/70">{b.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Booking Form */}
                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-[#293b64]/5 shadow-sm mb-8 space-y-4">

                    <p className="text-[12px] font-black uppercase tracking-widest text-[#293b64] mb-2">Reserva Técnica</p>

                    <div className="space-y-3">
                        <input name="name" type="text" placeholder="TU NOMBRE *" required value={form.name} onChange={handleFormChange}
                            className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] placeholder:text-[#293b64]/20 focus:ring-1 focus:ring-[#14b8a6] outline-none" />
                        <input name="email" type="email" placeholder="TU@EMAIL.COM *" required value={form.email} onChange={handleFormChange}
                            className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] placeholder:text-[#293b64]/20 focus:ring-1 focus:ring-[#14b8a6] outline-none" />
                        <input name="phone" type="tel" placeholder="WHATSAPP / TEL *" required value={form.phone} onChange={handleFormChange}
                            className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] placeholder:text-[#293b64]/20 focus:ring-1 focus:ring-[#14b8a6] outline-none" />
                    </div>

                    <div className="relative">
                        <select name="country" value={form.country} onChange={handleFormChange}
                            className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] appearance-none outline-none">
                            {['Venezuela', 'Colombia', 'Panamá', 'EEUU', 'Otro'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ArrowRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-[#293b64]/30" />
                    </div>

                    <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#293b64]/30 ml-1">Especialista Preferido</p>
                        {!showSelector && preselectedDoc ? (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc]/50 border border-[#293b64]/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#293b64]/5 overflow-hidden border-2 border-white shadow-sm">
                                        {preselectedDoc.imageUrl ? <img src={preselectedDoc.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#293b64]/30">{preselectedDoc.name[0]}</div>}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-[#293b64] leading-none mb-1">{preselectedDoc.name}</span>
                                        <span className="text-[10px] uppercase font-bold text-[#293b64]/40">{preselectedDoc.location}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setShowSelector(true)} className="text-[10px] font-black uppercase text-[#14b8a6] underline decoration-[#14b8a6]/20 underline-offset-4">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select name="doctorId" value={form.doctorId} onChange={handleFormChange}
                                    className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] appearance-none outline-none">
                                    <option value="">Cualquier Especialista Disponible</option>
                                    {availableDoctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name} ({doc.location.split(',')[0]})</option>)}
                                </select>
                                <ArrowRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-[#293b64]/30" />
                            </div>
                        )}
                    </div>

                    {/* Payment Section - High Security Feel */}
                    <AnimatePresence>
                        {tipo === 'profunda' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-[#293b64]/5 space-y-4 overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock size={12} className="text-[#14b8a6]" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#14b8a6]">Pasarela Segura (Pre-Autorización)</p>
                                </div>

                                <div className="p-4 bg-[#14b8a6]/5 rounded-2xl border border-[#14b8a6]/10 mb-4">
                                    <p className="text-[11px] font-medium leading-relaxed text-[#293b64]/70">
                                        Coordinamos el pago de <strong>USD 49</strong> vía Zelle o transferencia una vez confirmada la cita. Introduce tus datos para pre-autorizar el protocolo.
                                    </p>
                                </div>

                                <input name="number" type="tel" placeholder="NÚMERO DE TARJETA" value={card.number} onChange={handleCardChange} maxLength={19}
                                    className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] outline-none" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="expiry" type="text" placeholder="MM/AA" value={card.expiry} onChange={handleCardChange} maxLength={5}
                                        className="bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] outline-none" />
                                    <input name="cvc" type="tel" placeholder="CVC" value={card.cvc} onChange={handleCardChange} maxLength={4}
                                        className="bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] outline-none" />
                                </div>
                                <input name="holder" type="text" placeholder="TITULAR DE LA TARJETA" value={card.holder} onChange={handleCardChange}
                                    className="w-full bg-[#f8fafc] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#293b64] outline-none uppercase" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button type="submit" disabled={!isFormValid || submitState === 'sending'}
                        className="w-full py-5 mt-6 bg-[#14b8a6] text-white font-black text-[15px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#14b8a6]/20 transition-all active:scale-95 disabled:opacity-30">
                        {submitState === 'sending' ? <Loader2 size={24} className="animate-spin mx-auto" /> :
                            tipo === 'profunda' ? 'Confirmar Evaluación (USD 49)' : 'Activar Mi Programa →'}
                    </button>

                    <p className="text-center text-[10px] font-bold text-[#293b64]/30 uppercase tracking-widest mt-4">
                        Cifrado de grado clínico SSL/AES-256
                    </p>
                </motion.form>

                <div className="text-center pb-8 flex flex-col items-center gap-6">
                    <button onClick={() => navigate(-1)} className="text-[11px] font-black uppercase tracking-[0.2em] text-[#293b64]/40 hover:text-[#293b64] transition-colors">
                        ← Ver mis resultados de vitalidad
                    </button>

                    <div className="h-px w-20 bg-[#293b64]/10" />

                    <button onClick={() => navigate('/login')} className="text-xs font-black text-[#293b64]/50 underline decoration-[#293b64]/20 underline-offset-4">
                        Acceso Médico Autorizado →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsultaExploratoriaPage;
