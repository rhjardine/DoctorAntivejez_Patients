import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WELLNESS } from '../styles/wellnessPalette';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex flex-col h-screen w-full px-8 pt-safe-top pb-safe-bottom items-center justify-between animate-in fade-in duration-700"
            style={{ background: WELLNESS.bg }}
        >
            <div className="flex-1 flex flex-col justify-center items-center w-full mt-10">
                {/* Stage 1 Neutral Branding */}
                <div className="mb-14 mt-16 text-center">
                    <span
                        className="font-black tracking-[0.2em] text-[20px]"
                        style={{ color: WELLNESS.earthDark, fontFamily: 'Poppins, sans-serif' }}
                    >
                        VYTALIX
                    </span>
                    <p className="text-[10px] tracking-widest mt-1" style={{ color: WELLNESS.sage }}>
                        PLATAFORMA DIGITAL DE LONGEVIDAD
                    </p>
                </div>

                {/* Typography */}
                <div className="text-center mb-16 space-y-3 z-10 w-full">
                    <h1 className="text-3xl font-black leading-tight tracking-tight px-4" style={{ color: WELLNESS.earthDark }}>
                        Tu vitalidad,<br />en tus manos
                    </h1>
                    <p className="text-base font-medium leading-snug px-6" style={{ color: WELLNESS.textHint }}>
                        Descubre cómo se siente<br />tener<br />más energía cada día
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-sm space-y-4 z-10 px-2 mt-auto mb-4">
                    {/* Discovery Flow */}
                    <button
                        onClick={() => navigate('/longevidad')}
                        style={{
                            background: '#C4714A',
                            color: '#FDFAF4',
                            borderRadius: '32px',
                            padding: '16px 0',
                            width: '100%',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                            transition: 'background 0.2s ease',
                        }}
                    >
                        Comenzar ahora
                    </button>
                </div>

                {/* Footer with Login link */}
                <div className="pb-8 text-center flex flex-col gap-4 mt-8">
                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                        <span style={{ fontSize: '11px', color: '#8B7355' }}>
                            ¿Ya eres parte del programa?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                Ingresar →
                            </span>
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: WELLNESS.textHint }}>
                        Vytalix.io
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
