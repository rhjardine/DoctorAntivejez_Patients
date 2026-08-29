import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

const UniversalEntry: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-warming para mitigar el cold start en Render.com.
  //
  // Antes apuntaba a '<dominio-prod>/api-render/ping': `/api-render` es SOLO el
  // prefijo del proxy del servidor de desarrollo (vite.config.ts), así que en
  // producción esa ruta no existe. El fallo se tragaba en el catch, de modo que
  // el precalentamiento nunca ocurría y el primer login seguía pagando el
  // arranque en frío.
  //
  // Se usa la URL de API ya configurada y se golpea su ORIGEN, no una ruta:
  // cualquier petición entrante despierta la instancia, y así no se inventa
  // ningún endpoint que el backend no haya declarado.
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return; // en desarrollo se usa el proxy: no hay cold start

    let origin: string;
    try {
      origin = new URL(apiUrl).origin;
    } catch {
      return; // URL mal configurada: no arriesgar una petición a ninguna parte
    }

    fetch(origin, {
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
    <div className='min-h-screen flex flex-col font-sans select-none overflow-hidden bg-gradient-to-b from-slate-100 via-slate-200/80 to-[#0c285f]'>

      {/* ── Zona Superior: Tarjeta Flotante con Logo ── */}
      <div className='flex items-center justify-center pt-16 pb-8 px-6 relative z-10'>
        {/* Modal/Tarjeta blanca en la zona superior con borde celeste */}
        <div className='w-full max-w-sm flex items-center justify-center py-10 px-8 bg-white rounded-[2.5rem] shadow-xl border-b-[6px] border-sky-400 relative overflow-hidden'>
          {/* Logo centrado */}
          <div className='transition-transform duration-500 hover:scale-[1.03] active:scale-100 z-10'>
            <img
              src='/logo.png'
              alt='Doctor Antivejez'
              className='w-52 md:w-64 object-contain'
              onError={(e) => {
                e.currentTarget.src = '/logo.jpeg';
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Zona Inferior: Botones de Acceso ── */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 pb-16 relative z-10'>
        <div className='w-full max-w-sm flex flex-col gap-5'>

          {/* Etiqueta de selección */}
          <p className='text-center text-[11px] font-bold uppercase tracking-[0.22em] mb-2 text-slate-600'>
            SELECCIONA TU PERFIL DE ACCESO
          </p>

          {/* ── Botón Primario: Medir Edad Biológica ── */}
          <button
            id='access-btn-invitado'
            onClick={() => handleSelection('invitado', '/longevidad')}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 py-5 px-6 rounded-2xl text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.97] focus:outline-none shadow-lg bg-sky-400 hover:bg-sky-500 ${
              selectedRole === 'invitado'
                ? 'border-white'
                : 'border-transparent hover:border-white/40 focus:border-white'
            } ${isLoading && selectedRole !== 'invitado' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <UserPlus className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Medir mi Edad Biológica
              </span>
              <span className='block text-[14px] font-semibold mt-1 leading-snug text-sky-100'>
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
            className={`w-full flex items-center gap-4 py-5 px-6 rounded-2xl text-white font-bold text-left border-2 transition-all duration-200 transform active:scale-[0.97] focus:outline-none shadow-lg bg-slate-900 hover:bg-slate-800 ${
              selectedRole === 'paciente'
                ? 'border-white'
                : 'border-transparent hover:border-white/40 focus:border-white'
            } ${isLoading && selectedRole !== 'paciente' ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <User className='text-white shrink-0' style={{ width: '32px', height: '32px' }} />
            <div className='flex-1 min-w-0'>
              <span className='block text-lg font-black leading-tight text-white'>
                Mi Portal de Bienestar
              </span>
              <span className='block text-[14px] font-semibold mt-1 leading-snug text-slate-300'>
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