import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

const UniversalEntry: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelection = (role: 'paciente' | 'invitado', route: string) => {
    if (isLoading) return;
    setSelectedRole(role);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate(route);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none overflow-hidden">
      {/* Mitad Superior: Fondo Blanco con Diagonal Azul Cielo */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 min-h-[45vh] relative">
        {/* Diagonal Sky Blue Background Decorator */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Diagonal triangle matching the client's sketch */}
            <polygon points="0,0 35,0 0,100" fill="url(#skyGrad)" />
          </svg>

          {/* Styled biological DNA lines inside the diagonal zone */}
          <svg className="absolute top-0 left-0 w-[35%] h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M 10,0 Q 22,25 5,50 T 18,100" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2" 
            />
            <path 
              d="M 18,0 Q 5,25 20,50 T 6,100" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeDasharray="3,3"
            />
            {/* DNA Connections */}
            <line x1="12" y1="12" x2="16" y2="11" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="17" y1="25" x2="10" y2="25" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="19" y1="38" x2="8" y2="38" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="15" y1="50" x2="9" y2="50" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="8" y1="62" x2="17" y2="62" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="6" y1="75" x2="15" y2="75" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="10" y1="88" x2="15" y2="88" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Logo Container (Increased by 2 points/steps to w-56 md:w-72) */}
        <div className="transition-transform duration-500 hover:scale-[1.03] active:scale-100 z-10">
          <img
            src="/logo_blanco.png"
            alt="Doctor Antivejez"
            className="w-56 md:w-72 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/logo_blanco.jpeg';
            }}
          />
        </div>
      </div>

      {/* Mitad Inferior: Fondo de Contraste Azul Claro */}
      <div className="flex-1 bg-gradient-to-b from-[#0ea5e9] to-[#0284c7] flex flex-col items-center justify-center p-6 pb-12 min-h-[55vh] relative">
        <div className="w-full max-w-sm flex flex-col gap-5 z-10">
          <p className="text-center text-[11px] font-bold text-[#293b64]/80 uppercase tracking-[0.18em] mb-1">
            Selecciona tu perfil de acceso
          </p>

          {/* Botón 1: Soy Paciente */}
          <button
            id="access-btn-paciente"
            onClick={() => handleSelection('paciente', '/login')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl bg-[#38bdf8] text-[#293b64] font-bold text-left border-4 transition-all duration-200 transform active:scale-[0.98] focus:outline-none ${
              selectedRole === 'paciente'
                ? 'border-[#293b64]'
                : 'border-transparent hover:border-[#293b64] focus:border-[#293b64]'
            } ${isLoading && selectedRole !== 'paciente' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* White background icon with dark blue symbol */}
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
              <User size={24} className="text-[#293b64]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-lg font-black leading-tight text-[#293b64]">
                Soy Paciente
              </span>
              <span className="block text-[12px] font-semibold text-[#293b64]/80 mt-0.5 leading-snug">
                Ingresa a tu portal de salud preventivo
              </span>
            </div>
            {selectedRole === 'paciente' && (
              <div className="w-2 h-2 rounded-full bg-[#293b64] shrink-0 animate-pulse" />
            )}
          </button>

          {/* Botón 2: Soy Invitado */}
          <button
            id="access-btn-invitado"
            onClick={() => handleSelection('invitado', '/longevidad')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl bg-[#293b64] text-white font-bold text-left border-4 transition-all duration-200 transform active:scale-[0.98] focus:outline-none ${
              selectedRole === 'invitado'
                ? 'border-white'
                : 'border-transparent hover:border-white focus:border-white'
            } ${isLoading && selectedRole !== 'invitado' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* White background icon with dark blue symbol */}
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
              <UserPlus size={24} className="text-[#293b64]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-lg font-black leading-tight text-white">
                Soy Invitado
              </span>
              <span className="block text-[12px] font-semibold text-white/80 mt-0.5 leading-snug">
                Realiza el Test de Edad Biológica gratuito
              </span>
            </div>
            {selectedRole === 'invitado' && (
              <div className="w-2 h-2 rounded-full bg-white shrink-0 animate-pulse" />
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-[10px] font-bold text-white/60 uppercase tracking-widest">
          Doctor Antivejez © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default UniversalEntry;