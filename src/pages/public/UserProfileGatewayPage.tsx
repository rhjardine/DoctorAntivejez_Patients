import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, UserRound, UserCog, ArrowRight } from 'lucide-react';
import { WELLNESS } from '../../styles/wellnessPalette';

type AccessCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  cta: string;
  onClick: () => void;
  delay?: number;
};

const AccessCard: React.FC<AccessCardProps> = ({ title, subtitle, icon, cta, onClick, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full text-left rounded-3xl p-5 border transition-all"
    style={{
      background: '#FFFFFF',
      borderColor: `${WELLNESS.nut}40`,
      boxShadow: '0 8px 30px -18px rgba(61,43,31,0.35)',
    }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${WELLNESS.terracotta}1A`, color: WELLNESS.terracotta }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-[18px] font-black leading-tight" style={{ color: WELLNESS.earthDark }}>{title}</h2>
          <p className="text-[13px] mt-1 leading-relaxed" style={{ color: WELLNESS.textSecond }}>{subtitle}</p>
        </div>
      </div>
      <ArrowRight size={18} style={{ color: WELLNESS.nut }} />
    </div>

    <div className="mt-4 text-[12px] font-black uppercase tracking-wider" style={{ color: WELLNESS.terracotta }}>
      {cta}
    </div>
  </motion.button>
);

const UserProfileGatewayPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-5 py-8"
      style={{
        background: `linear-gradient(180deg, ${WELLNESS.bg} 0%, ${WELLNESS.bgDeep} 100%)`,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: WELLNESS.sage }}>
            Doctor Antivejez
          </p>
          <h1 className="text-[30px] font-black leading-[1.1]" style={{ color: WELLNESS.earthDark }}>
            ¿Cómo deseas ingresar?
          </h1>
          <p className="text-[14px] mt-3" style={{ color: WELLNESS.textSecond }}>
            Selecciona tu perfil para mostrarte la experiencia correcta.
          </p>
        </motion.div>

        <div className="space-y-3.5">
          <AccessCard
            title="Soy invitado"
            subtitle="Explora el test de longevidad y conoce tu edad celular."
            icon={<UserRound size={20} />}
            cta="Entrar al funnel público"
            onClick={() => navigate('/longevidad')}
            delay={0.05}
          />

          <AccessCard
            title="Soy paciente"
            subtitle="Accede a tu guía médica, progreso y seguimiento personalizado."
            icon={<Stethoscope size={20} />}
            cta="Ir al acceso de pacientes"
            onClick={() => navigate('/login')}
            delay={0.12}
          />

          <AccessCard
            title="Soy profesional de salud"
            subtitle="Ingresa a la red médica y flujo de coordinación clínica."
            icon={<UserCog size={20} />}
            cta="Ver red médica"
            onClick={() => navigate('/medicos')}
            delay={0.19}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[10px] font-black uppercase tracking-[0.18em] mt-8 opacity-60"
          style={{ color: WELLNESS.earth }}
        >
          Medicina de longevidad basada en evidencia
        </motion.p>
      </div>
    </div>
  );
};

export default UserProfileGatewayPage;
