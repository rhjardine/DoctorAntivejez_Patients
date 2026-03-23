import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex flex-col h-screen w-full px-8
                 pt-safe-top pb-safe-bottom items-center
                 justify-between animate-in fade-in
                 duration-700 bg-[rgb(41,59,100)]"
        >
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                {/* Logo with Cyan Glow */}
                <div className="relative flex flex-col items-center mb-16">
                    {/* Glow effect positioned behind the logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400 opacity-30 rounded-full blur-3xl pointer-events-none" />
                    <img
                        src="/Logo_azul_oscuro.png"
                        alt="Doctor Antivejez"
                        className="w-56 h-auto object-contain z-10 drop-shadow-lg"
                        style={{ filter: 'brightness(1.5)' }} // Adjust brightness as needed if logo is too dark
                    />
                </div>

                {/* Typography */}
                <div className="text-center mb-12 space-y-3 z-10 w-full">
                    <h1 className="text-white text-3xl font-black leading-tight tracking-tight px-4">
                        Tu vitalidad,<br />en tus manos
                    </h1>
                    <p className="text-white/80 text-base font-medium leading-snug px-6">
                        Descubre cómo se siente<br />tener<br />más energía cada día
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-sm space-y-4 z-10 px-2 mt-auto pb-8">
                    {/* Invitee / Demo Flow */}
                    <button
                        onClick={() => navigate('/longevidad')}
                        className="w-full bg-[rgba(35,188,239,1)] text-white py-4 rounded-3xl
                            font-bold text-base shadow-lg
                            active:scale-95 transition-all
                            flex items-center justify-center"
                    >
                        Comenzar ahora
                    </button>

                    {/* Patient Login Flow */}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-transparent border-[1.5px] border-white text-white py-4 rounded-3xl
                            font-bold text-base
                            active:scale-95 transition-all
                            flex items-center justify-center"
                    >
                        Ya soy paciente
                    </button>
                </div>

                {/* Vytalix.io footer credit */}
                <div className="pb-8 opacity-40">
                    <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">
                        Vytalix.io
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
