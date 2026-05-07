import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, ShieldCheck, ChevronRight, X, Check } from 'lucide-react';

const ONBOARDING_KEY = 'rejuvenate_onboarding_v1_seen';

interface OnboardingModalProps {
    onComplete: () => void;
}

const slides = [
    {
        id: 'claves5a',
        icon: Shield,
        iconBg: '#EFF8FF',
        iconColor: '#23BCEF',
        title: 'CLAVES 5A',
        quote: '"Domina los pilares de la longevidad: Alimentación, Actividad, Actitud, Ambiente y Asueto."',
        extras: null,
        buttonText: 'SIGUIENTE',
        buttonStyle: 'primary',
    },
    {
        id: 'edad-bio',
        icon: Activity,
        iconBg: '#EFF8FF',
        iconColor: '#23BCEF',
        title: 'EDAD BIOLÓGICA',
        quote: '"Tu principal biomarcador. El objetivo es reducir la brecha con tu edad real."',
        extras: null,
        buttonText: 'SIGUIENTE',
        buttonStyle: 'primary',
    },
    {
        id: 'privacidad',
        icon: ShieldCheck,
        iconBg: '#EFF8FF',
        iconColor: '#23BCEF',
        title: 'PROTECCIÓN DE DATOS\nY PRIVACIDAD',
        quote: '"Su información clínica y biomarcadores son tratados bajo los más estrictos estándares internacionales de seguridad (GDPR/HIPAA). Garantizamos la confidencialidad absoluta de sus datos sensibles encriptados de extremo a extremo."',
        extras: ['ENCRIPTACIÓN MILITAR', 'CUMPLIMIENTO INTERNACIONAL'],
        buttonText: 'ACEPTO Y CONTINUAR',
        buttonStyle: 'dark',
    },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const handleNext = () => {
        if (step < slides.length - 1) {
            setDirection(1);
            setStep(s => s + 1);
        } else {
            localStorage.setItem(ONBOARDING_KEY, 'true');
            onComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        onComplete();
    };

    const slide = slides[step];
    const Icon = slide.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(8, 20, 50, 0.82)', backdropFilter: 'blur(6px)' }}>
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={slide.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 60 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-white rounded-[28px] mx-6 w-full max-w-[340px] overflow-hidden shadow-2xl"
                    style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
                >
                    {/* Skip button */}
                    {step < slides.length - 1 && (
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 rounded-full"
                            style={{ position: 'absolute', top: 'calc(50% - 180px)', right: 'calc(50% - 170px)' }}
                        >
                            <X size={16} />
                        </button>
                    )}

                    <div className="p-8 flex flex-col items-center text-center relative">
                        {/* Skip button positioned correctly */}
                        {step < slides.length - 1 && (
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 p-1 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}

                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                            style={{ backgroundColor: slide.iconBg }}
                        >
                            <Icon size={30} style={{ color: slide.iconColor }} strokeWidth={1.8} />
                        </div>

                        {/* Title */}
                        <h2 className="font-black text-[22px] text-[#0D2137] leading-tight tracking-tight mb-5 whitespace-pre-line">
                            {slide.title}
                        </h2>

                        {/* Quote card */}
                        <div className="w-full bg-[#F7FBFF] rounded-2xl px-4 py-4 border border-slate-100 mb-5">
                            <p className="text-[13px] text-[#0D2137] font-semibold italic leading-relaxed">
                                {slide.quote}
                            </p>
                        </div>

                        {/* Extras (checkmarks) */}
                        {slide.extras && (
                            <div className="w-full space-y-2 mb-4">
                                {slide.extras.map(item => (
                                    <div key={item} className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-emerald-500" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[11px] font-black text-[#0D2137] uppercase tracking-widest">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Button */}
                        <button
                            onClick={handleNext}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[13px] uppercase tracking-[0.15em] transition-all active:scale-95 ${slide.buttonStyle === 'dark'
                                    ? 'bg-[#0D2137] text-white'
                                    : 'bg-[#23BCEF] text-white'
                                }`}
                            style={
                                slide.buttonStyle === 'primary'
                                    ? { background: 'linear-gradient(135deg, #23BCEF 0%, #1a9fd4 100%)' }
                                    : undefined
                            }
                        >
                            {slide.buttonText}
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>

                        {/* Dots */}
                        <div className="flex items-center gap-1.5 mt-4">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-full transition-all duration-300"
                                    style={{
                                        width: i === step ? 20 : 6,
                                        height: 6,
                                        backgroundColor: i === step ? '#23BCEF' : '#D1D5DB',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Footer text (last slide only) */}
                        {step === slides.length - 1 && (
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-3">
                                Doctor Antivejez • Capa de Seguridad V2.0
                            </p>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export { ONBOARDING_KEY };
export default OnboardingModal;
