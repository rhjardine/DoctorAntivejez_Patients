import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, Users } from 'lucide-react';

// ─── Componente Fondo ADN Deambulante ─────────────────────────────────────────
// CSS puro embebido en JSX — cero librerías externas, cero colisiones.
// Las dos hélices flotan por márgenes opuestos (izquierdo / derecho) y nunca
// intersectan el contenedor central. Animación ultra-lenta para transmitir
// "ciencia deambulante, no juego".
const DnaBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
    <style>{`
      @keyframes dna-drift-left {
        0%   { transform: translate(0%, 100vh) rotate(0deg) scale(1); }
        50%  { transform: translate(3%, 40vh) rotate(200deg) scale(1.05); }
        100% { transform: translate(0%, -20vh) rotate(360deg) scale(1); }
      }
      @keyframes dna-drift-right {
        0%   { transform: translate(0%, -20vh) rotate(0deg) scale(1); }
        50%  { transform: translate(-3%, 45vh) rotate(-200deg) scale(1.05); }
        100% { transform: translate(0%, 100vh) rotate(-360deg) scale(1); }
      }
      @keyframes dna-rung-twist {
        0%   { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      .dna-drift-left  { animation: dna-drift-left  50s infinite ease-in-out; }
      .dna-drift-right { animation: dna-drift-right 60s infinite ease-in-out; }
      .dna-rung        { animation: dna-rung-twist   9s infinite linear; transform-style: preserve-3d; }
    `}</style>

    {/* Hélice Izquierda — fuera del contenido central */}
    <div className="absolute left-[-24px] top-0 w-36 h-full flex flex-col justify-around dna-drift-left opacity-[0.07]">
      {[...Array(10)].map((_, i) => (
        <div
          key={`l-${i}`}
          className="dna-rung w-24 h-1.5 flex items-center justify-between mx-auto"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <div className="w-3 h-3 rounded-full bg-[#14b8a6]" />
          <div className="flex-1 h-px bg-[#293b64] mx-0.5" />
          <div className="w-3 h-3 rounded-full bg-[#293b64]" />
        </div>
      ))}
    </div>

    {/* Hélice Derecha — fuera del contenido central */}
    <div className="absolute right-[-24px] top-0 w-36 h-full flex flex-col justify-around dna-drift-right opacity-[0.05]">
      {[...Array(10)].map((_, i) => (
        <div
          key={`r-${i}`}
          className="dna-rung w-24 h-1.5 flex items-center justify-between mx-auto"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <div className="w-3 h-3 rounded-full bg-[#293b64]" />
          <div className="flex-1 h-px bg-[#14b8a6] mx-0.5" />
          <div className="w-3 h-3 rounded-full bg-[#14b8a6]" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Datos de las opciones de acceso ──────────────────────────────────────────
const ACCESS_OPTIONS = [
  {
    role: 'paciente',
    label: 'Soy Paciente',
    subtitle: 'Ingresa a tu portal de salud preventivo',
    Icon: User,
    route: '/login',
  },
  {
    role: 'invitado',
    label: 'Soy Invitado',
    subtitle: 'Realiza el Test de Edad Biológica gratuito',
    Icon: UserPlus,
    route: '/longevidad',
  },
  {
    role: 'medico',
    label: 'Soy Médico',
    subtitle: 'Accede a la consola clínica',
    Icon: Users,
    externalUrl: 'https://doctor-antivejez-web.onrender.com/login',
  },
] as const;

// ─── Página Principal ──────────────────────────────────────────────────────────
const UniversalEntry: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = (option: typeof ACCESS_OPTIONS[number]) => {
    if (isLoading) return;
    setSelectedRole(option.role);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if ('externalUrl' in option && option.externalUrl) {
        window.location.href = option.externalUrl;
      } else if ('route' in option && option.route) {
        navigate(option.route);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden select-none font-sans">

      {/* ── Fondo ADN Deambulante ── */}
      <DnaBackground />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center gap-8">

        {/* ── Tarea 1: Logo Oficial Centrado ── */}
        <div className="transition-transform duration-500 hover:scale-[1.03] active:scale-100">
          <img
            src="/Logo_azul_oscuro.png"
            alt="Doctor Antivejez"
            className="w-44 md:w-52 mx-auto object-contain drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.src = '/Logo_app.jpeg';
            }}
          />
        </div>

        {/* ── Tarea 3: Contenedor Glasmorfismo ── */}
        <div className="w-full bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(41,59,100,0.09)] flex flex-col gap-4">

          <p className="text-center text-[11px] font-bold text-[#293b64]/60 uppercase tracking-[0.18em] mb-1">
            Selecciona tu perfil de acceso
          </p>

          {/* ── Tareas 4 & 5: Botones Premium con interacción de borde ── */}
          {ACCESS_OPTIONS.map((option) => {
            const isActive = selectedRole === option.role;
            return (
              <button
                key={option.role}
                id={`access-btn-${option.role}`}
                onClick={() => handleRoleSelection(option)}
                disabled={isLoading}
                aria-pressed={isActive}
                className={[
                  'w-full flex items-center gap-4 p-4 rounded-2xl',
                  'bg-[#14b8a6] text-[#293b64] font-bold text-left',
                  'transition-all duration-200 transform',
                  'active:scale-[0.97]',
                  'focus:outline-none',
                  'border-4',
                  isActive
                    ? 'border-[#293b64] shadow-[0_0_0_1px_#293b64]'
                    : 'border-transparent hover:border-[#293b64] focus:border-[#293b64]',
                  isLoading && !isActive ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {/* Ícono — contenedor Navy, ícono Beige */}
                <div className="w-12 h-12 rounded-xl bg-[#293b64] flex items-center justify-center shadow-sm shrink-0">
                  <option.Icon size={22} className="text-[#f2e2cf]" />
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[17px] font-black leading-tight text-[#293b64]">
                    {option.label}
                  </span>
                  <span className="block text-[11px] font-medium text-[#293b64]/70 mt-0.5 leading-snug">
                    {option.subtitle}
                  </span>
                </div>

                {/* Indicador de estado activo */}
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[#293b64] shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Footer de marca ── */}
        <p className="text-[10px] font-bold text-[#293b64]/40 uppercase tracking-widest">
          Doctor Antivejez © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
};

export default UniversalEntry;