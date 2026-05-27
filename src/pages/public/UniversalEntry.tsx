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
      {/* Mitad Superior: Fondo Blanco */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 min-h-[45vh]">
        <div className="transition-transform duration-500 hover:scale-[1.03] active:scale-100">
          <img
            src="/logo_blanco.png"
            alt="Doctor Antivejez"
            className="w-48 md:w-56 object-contain"
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
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
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
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <UserPlus size={24} className="text-white" />
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