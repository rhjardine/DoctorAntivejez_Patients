import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

const UniversalEntry: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-warming para mitigar el cold start en Render.com
  useEffect(() => {
    fetch('https://doctor-antivejez-web.onrender.com/api-render/ping', {
      mode: 'no-cors',
      priority: 'low',
    } as RequestInit).catch(() => {
      // Ignorar fallos silenciosamente, es solo un ping
    });
  }, []);

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
    <div
      className='min-h-screen flex flex-col font-sans select-none overflow-hidden'
      style={{
        background: 'linear-gradient(160deg, rgb(185, 220, 245) 0%, rgb(105, 170, 220) 28%, rgb(35, 95, 165) 62%, rgb(12, 40, 95) 100%)',
      }}
    >

      {/* ── Zona Superior: Tarjeta Flotante con Logo ── */}
      <div className='flex items-center justify-center pt-16 pb-8 px-6 relative z-10'>
        {/* Tarjeta blanca premium con sombra y brillo de marca */}
        <div
          className='w-full max-w-xs flex items-center justify-center py-10 px-8 rounded-[2.5rem] relative overflow-hidden'
          style={{
            background: 'rgb(255, 255, 255)',
            boxShadow: '0 12px 48px rgba(12, 40, 100, 0.22), 0 2px 16px rgba(12, 40, 100, 0.12)',
          }}
        >
          {/* Destello sutil en esquina superior derecha */}
          <div
            className='absolute top-0 right-0 w-48 h-48 pointer-events-none'
            style={{
              background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.12) 0%, transparent 65%)',
              borderRadius: '0 2.5rem 0 0',
            }}
          />
          {/* Destello sutil en esquina inferior izquierda */}
          <div
            className='absolute bottom-0 left-0 w-32 h-32 pointer-events-none'
            style={{
              background: 'radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
            }}
          />

          {/* Logo centrado */}
          <div className='transition-transform duration-500 hover:scale-[1.03] active:scale-100 z-10'>
            <img
              src='/logo_blanco.png'
              alt='Doctor Antivejez'
              className='w-52 md:w-64 object-contain'
              onError={(e) => {
                e.currentTarget.src = '/logo_blanco.jpeg';
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Zona Inferior: Botones de Acceso ── */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 pb-16 relative z-10'>
        <div className='w-full max-w-sm flex flex-col gap-5'>

          {/* Etiqueta de selección */}
          <p
            className='text-center text-[11px] font-bold uppercase tracking-[0.22em] mb-2'
            style={{ color: 'rgba(255, 255, 255, 0.68)' }}
          >
            Selecciona tu perfil de acceso
          </p>

          {/* ── Botón Primario: Medir Edad Biológica ── */}
          <button
            id='access-btn-invitado'
            onClick={() => handleSelection('invitado', '/longevidad')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 py-5 px-6 rounded-2xl text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.97] focus:outline-none ${
              selectedRole === 'invitado'
                ? 'border-white'
                : 'border-transparent hover:border-white/40 focus:border-white'
            } ${isLoading && selectedRole !== 'invitado' ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgb(56, 168, 222) 0%, rgb(24, 115, 188) 100%)',
              boxShadow: '0 6px 24px rgba(24, 100, 180, 0.38)',
            }}
          >
            <UserPlus className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Medir mi Edad Biológica
              </span>
              <span
                className='block text-[14px] font-semibold mt-1 leading-snug'
                style={{ color: 'rgba(218, 242, 255, 0.90)' }}
              >
                Realiza el test preventivo gratuito y conoce tu vitalidad actual.
              </span>
            </div>
            {selectedRole === 'invitado' && (
              <div className='w-2 h-2 rounded-full bg-white shrink-0 animate-pulse' />
            )}
          </button>

          {/* ── Botón Secundario: Mi Portal de Bienestar ── */}
          <button
            id='access-btn-paciente'
            onClick={() => handleSelection('paciente', '/login')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 py-5 px-6 rounded-2xl text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.97] focus:outline-none ${
              selectedRole === 'paciente'
                ? 'border-white'
                : 'border-transparent hover:border-white/40 focus:border-white'
            } ${isLoading && selectedRole !== 'paciente' ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgb(22, 45, 85) 0%, rgb(12, 30, 65) 100%)',
              boxShadow: '0 6px 24px rgba(8, 22, 55, 0.45)',
            }}
          >
            <User className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Mi Portal de Bienestar
              </span>
              <span
                className='block text-[14px] font-semibold mt-1 leading-snug'
                style={{ color: 'rgba(195, 220, 255, 0.82)' }}
              >
                Accede a tus resultados, consultas y seguimiento personalizado.
              </span>
            </div>
            {selectedRole === 'paciente' && (
              <div className='w-2 h-2 rounded-full bg-white shrink-0 animate-pulse' />
            )}
          </button>
        </div>

        {/* ── Footer ── */}
        <div className='absolute bottom-6 flex flex-col items-center gap-1.5 text-center w-full z-10'>
          <p
            className='text-[10px] font-bold uppercase tracking-widest'
            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
          >
            DOCTOR ANTIVEJEZ © 2026
          </p>
          <p
            className='text-[9px] font-bold uppercase tracking-widest'
            style={{ color: 'rgba(255, 255, 255, 0.48)' }}
          >
            VITALYX - INFRAESTRUCTURA CLINICA INTELIGENTE
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversalEntry;