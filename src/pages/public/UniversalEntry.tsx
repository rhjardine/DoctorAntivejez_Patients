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
    <div className='min-h-screen flex flex-col font-sans select-none overflow-hidden'>
      {/* Mitad Superior: Fondo Blanco con Diagonal Azul Cielo */}
      <div className='flex-1 bg-white flex items-center justify-center p-8 min-h-[45vh] relative'>
        {/* Diagonal Sky Blue Background Decorator */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none z-0'>
          <svg className='absolute top-0 left-0 w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
            <defs>
              <linearGradient id='skyGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop offset='0%' stopColor='rgb(56, 189, 248)' stopOpacity='0.9' />
                <stop offset='100%' stopColor='rgb(14, 165, 233)' stopOpacity='1' />
              </linearGradient>
            </defs>
            {/* Diagonal triangle matching the client's sketch */}
            <polygon points='0,0 35,0 0,100' fill='url(#skyGrad)' />
          </svg>

          {/* Styled biological DNA lines inside the diagonal zone with softer opacity (15%) */}
          <svg className='absolute top-0 left-0 w-[35%] h-full opacity-15' viewBox='0 0 100 100' preserveAspectRatio='none'>
            <path 
              d='M 10,0 Q 22,25 5,50 T 18,100' 
              fill='none' 
              stroke='rgb(255, 255, 255)' 
              strokeWidth='2' 
            />
            <path 
              d='M 18,0 Q 5,25 20,50 T 6,100' 
              fill='none' 
              stroke='rgb(255, 255, 255)' 
              strokeWidth='2' 
              strokeDasharray='3,3'
            />
            {/* DNA Connections */}
            <line x1='12' y1='12' x2='16' y2='11' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='17' y1='25' x2='10' y2='25' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='19' y1='38' x2='8' y2='38' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='15' y1='50' x2='9' y2='50' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='8' y1='62' x2='17' y2='62' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='6' y1='75' x2='15' y2='75' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
            <line x1='10' y1='88' x2='15' y2='88' stroke='rgb(255, 255, 255)' strokeWidth='1.5' />
          </svg>
        </div>

        {/* Logo Container (Increased by 2 points/steps to w-56 md:w-72) */}
        <div className='transition-transform duration-500 hover:scale-[1.03] active:scale-100 z-10'>
          <img
            src='/logo_blanco.png'
            alt='Doctor Antivejez'
            className='w-56 md:w-72 object-contain'
            onError={(e) => {
              e.currentTarget.src = '/logo_blanco.jpeg';
            }}
          />
        </div>
      </div>

      {/* Mitad Inferior: Fondo de Contraste Azul Claro */}
      <div className='flex-1 bg-gradient-to-b from-sky-500 to-sky-700 flex flex-col items-center justify-center p-6 pb-12 min-h-[55vh] relative'>
        <div className='w-full max-w-sm flex flex-col gap-5 z-10'>
          <p className='text-center text-[11px] font-bold uppercase tracking-[0.18em] mb-1' style={{ color: 'rgba(41, 59, 100, 0.8)' }}>
            Selecciona tu perfil de acceso
          </p>

          {/* Botón Primario: Conversión y Captación (Antiguo 'Soy Invitado') */}
          <button
            id='access-btn-invitado'
            onClick={() => handleSelection('invitado', '/longevidad')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.98] focus:outline-none shadow-md ${
              selectedRole === 'invitado'
                ? 'border-white'
                : 'border-transparent hover:border-white focus:border-white'
            } ${isLoading && selectedRole !== 'invitado' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Direct white UserPlus icon with no rounded background wrapper */}
            <UserPlus className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Medir mi Edad Biológica
              </span>
              <span className='block text-[14px] font-semibold mt-1 leading-snug' style={{ color: 'rgb(240, 249, 255)' }}>
                Realiza el test preventivo gratuito y conoce tu vitalidad actual
              </span>
            </div>
            {selectedRole === 'invitado' && (
              <div className='w-2 h-2 rounded-full bg-white shrink-0 animate-pulse' />
            )}
          </button>

          {/* Botón Secundario: Portal Preventivo (Antiguo 'Soy Paciente') */}
          <button
            id='access-btn-paciente'
            onClick={() => handleSelection('paciente', '/login')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-[rgb(26,37,60)] to-[rgb(41,59,100)] text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.98] focus:outline-none shadow-md ${
              selectedRole === 'paciente'
                ? 'border-white'
                : 'border-transparent hover:border-white focus:border-white'
            } ${isLoading && selectedRole !== 'paciente' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Direct white User icon with no rounded background wrapper */}
            <User className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Mi Portal de Bienestar
              </span>
              <span className='block text-[14px] font-semibold mt-1 leading-snug' style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Accede a tus resultados, consultas y seguimiento personalizado
              </span>
            </div>
            {selectedRole === 'paciente' && (
              <div className='w-2 h-2 rounded-full bg-white shrink-0 animate-pulse' />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className='absolute bottom-6 flex flex-col items-center gap-1.5 text-center w-full z-10'>
          <p className='text-[10px] font-bold text-white uppercase tracking-widest'>
            DOCTOR ANTIVEJEZ © 2026
          </p>
          <p className='text-[9px] font-bold text-white uppercase tracking-widest'>
            VITALYX - INFRAESTRUCTURA CLINICA INTELIGENTE
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversalEntry;