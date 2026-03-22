import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, User, Phone, Mail, MessageSquare } from 'lucide-react';

const NAVY = '#293B64';
const CYAN = '#23BCEF';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const ConsultaExploratoriaPage: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [status, setStatus] = useState<FormState>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone) return;
        setStatus('sending');
        // Simulated submission — replace with real webhook/API call
        await new Promise(r => setTimeout(r, 1500));
        sessionStorage.setItem('da_consulta_sent', 'true');
        setStatus('sent');
    };

    if (status === 'sent') {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
                style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #1a2d52 100%)` }}
            >
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: '#22c55e22' }}
                >
                    <CheckCircle size={40} color="#22c55e" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-2xl font-black text-white mb-3"
                    style={{ fontFamily: 'Poppins' }}
                >
                    ¡Solicitud Recibida!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="text-sm leading-relaxed mb-10 px-4"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                    El equipo del Dr. Méndez se pondrá en contacto contigo en las próximas 24 horas para coordinar tu consulta exploratoria gratuita.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    onClick={() => navigate('/longevidad')}
                    className="font-bold text-base px-8 py-4 rounded-full transition-all active:scale-95"
                    style={{ background: CYAN, color: NAVY, fontFamily: 'Poppins' }}
                >
                    Volver al inicio
                </motion.button>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center overflow-y-auto pb-12"
            style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #1a2d52 100%)` }}
        >
            <div className="w-full max-w-sm px-5 pt-14">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: CYAN }}>
                        Consulta Exploratoria Gratuita
                    </p>
                    <h1 className="text-2xl font-black text-white leading-tight mb-3" style={{ fontFamily: 'Poppins' }}>
                        El Dr. Méndez quiere conocerte
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Déjanos tus datos y coordinaremos una sesión de 20 minutos para revisar tus resultados y diseñar un plan personalizado.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Nombre completo *
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: CYAN }} />
                            <input
                                name="name" type="text" value={form.name} onChange={handleChange}
                                placeholder="Tu nombre" required
                                className="w-full bg-white rounded-xl text-slate-800 font-medium pl-10 pr-4 py-3.5
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': CYAN } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Teléfono / WhatsApp *
                        </label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: CYAN }} />
                            <input
                                name="phone" type="tel" value={form.phone} onChange={handleChange}
                                placeholder="+58 412 000 0000" required
                                className="w-full bg-white rounded-xl text-slate-800 font-medium pl-10 pr-4 py-3.5
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': CYAN } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: CYAN }} />
                            <input
                                name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                className="w-full bg-white rounded-xl text-slate-800 font-medium pl-10 pr-4 py-3.5
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': CYAN } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            ¿Algo que quieras contarle al Dr.?
                        </label>
                        <div className="relative">
                            <MessageSquare size={16} className="absolute left-3.5 top-4" style={{ color: CYAN }} />
                            <textarea
                                name="message" value={form.message} onChange={handleChange}
                                placeholder="Síntomas, objetivos, dudas..."
                                rows={3}
                                className="w-full bg-white rounded-xl text-slate-800 font-medium pl-10 pr-4 py-3.5
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none"
                                style={{ '--tw-ring-color': CYAN } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={status === 'sending' || !form.name || !form.phone}
                        className="w-full font-bold text-base flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 disabled:opacity-50"
                        style={{
                            background: CYAN, color: NAVY, borderRadius: 28,
                            padding: '16px 0', fontFamily: 'Poppins'
                        }}
                    >
                        {status === 'sending' ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : (
                            'Solicitar mi Consulta Gratuita'
                        )}
                    </button>
                </motion.form>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <button onClick={() => navigate(-1)}
                        className="text-xs underline underline-offset-2 transition-opacity hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                        ← Volver a mis resultados
                    </button>
                </div>

                <p className="text-center mt-5 text-[10px] leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Tus datos son confidenciales y solo se usarán para coordinar tu consulta con el Dr. Méndez.
                </p>
            </div>
        </div>
    );
};

export default ConsultaExploratoriaPage;
