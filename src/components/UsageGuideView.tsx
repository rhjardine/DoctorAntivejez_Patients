
import React from 'react';
import { QrCode, ClipboardList, BarChart3, MessageCircle, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';

const UsageGuideView: React.FC = () => {
  const steps = [
    {
      title: "1. Tu Bio-Pase",
      desc: "Al llegar a la clínica, usa tu código QR para un check-in rápido y seguro. Esto sincroniza tu historial con tu doctor al instante.",
      icon: <QrCode size={24} />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "2. Las Claves 5A y 4R",
      desc: "Sigue tu plan diario dividido en alimentación, actividad, actitud, entorno y descanso (5A), junto a las terapias regenerativas (4R).",
      icon: <ClipboardList size={24} />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "3. Registra tus Avances",
      desc: "Anota tus biométricos (peso, glucosa, presión) y marca las tareas completadas. Tu adherencia es la clave para reducir tu edad biológica.",
      icon: <BarChart3 size={24} />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "4. Consulta a VCoach",
      desc: "¿Dudas con un alimento o síntoma? Tu asistente virtual con Inteligencia Artificial está disponible 24/7 para apoyarte.",
      icon: <MessageCircle size={24} />,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 pb-32 animate-in fade-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-darkBlue uppercase tracking-tighter">Guía de Navegación</h2>
        <p className="text-xs font-bold text-textMedium mt-2">Cómo optimizar tu longevidad paso a paso</p>
      </div>

      {/* Adherence Color Legend */}
      <div className="bg-white rounded-[2.5rem] p-6
                  shadow-sm border border-gray-50 mb-2">
        <h3 className="font-black text-darkBlue uppercase
                   tracking-tight text-base mb-1
                   flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-full" />
          Indicadores de Salud
        </h3>
        <p className="text-[11px] text-textMedium font-bold mb-5">
          Los círculos de tu Dashboard muestran tu nivel
          de adherencia en cada área de salud.
        </p>

        <div className="space-y-4">
          {/* RED */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 border border-red-100">
            <div className="w-12 h-12 rounded-full border-4 border-red-500 bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[10px] font-black text-red-500">0-49%</span>
            </div>
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-wide mb-1">Necesita Atención</p>
              <p className="text-[11px] text-red-800 font-bold leading-relaxed">
                Adherencia baja. Este indicador necesita mejorar para recuperar tu salud. Consulta con tu médico.
              </p>
            </div>
          </div>

          {/* YELLOW */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[10px] font-black text-amber-500">50-79%</span>
            </div>
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">En Proceso</p>
              <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                Adherencia básica. Rango aceptable pero aún no alcanzas tu óptimo. ¡Sigue adelante!
              </p>
            </div>
          </div>

          {/* GREEN */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[10px] font-black text-emerald-500">80-100%</span>
            </div>
            <div>
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wide mb-1">Hito de Salud</p>
              <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">
                Adherencia elevada. En el camino óptimo hacia tu rejuvenecimiento celular. ¡Excelente!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Elements Guide */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 mb-4">
        <h3 className="font-black text-darkBlue uppercase tracking-tight text-base mb-4 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-full" />
          Elementos del Dashboard
        </h3>
        <div className="space-y-3">
          {[
            { label: 'VCoach IA (Centro)', desc: 'Tu asistente de salud personal. Muestra tu adherencia global.', color: 'bg-[#293b64]', textColor: 'text-white' },
            { label: 'Alimentación Sana', desc: 'Seguimiento de tu plan nutrigenómico personalizado.', color: 'bg-orange-100', textColor: 'text-orange-700' },
            { label: 'Actividad Física', desc: 'Registro de tus ejercicios diarios y movimiento.', color: 'bg-red-100', textColor: 'text-red-700' },
            { label: 'Actitud Mental', desc: 'Meditaciones, diario de gratitud y bienestar emocional.', color: 'bg-pink-100', textColor: 'text-pink-700' },
            { label: 'Ambiente', desc: 'Calidad de tu entorno y reducción de tóxicos.', color: 'bg-green-100', textColor: 'text-green-700' },
            { label: 'Asueto (Descanso)', desc: 'Calidad y duración de tu sueño reparador.', color: 'bg-indigo-100', textColor: 'text-indigo-700' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className={`w-8 h-8 rounded-full ${item.color} shrink-0 flex items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full border-2 border-current ${item.textColor}`} />
              </div>
              <div>
                <p className="text-[11px] font-black text-darkBlue uppercase tracking-wide">{item.label}</p>
                <p className="text-[10px] text-textMedium font-bold">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 relative">
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 bottom-[-24px] w-0.5 bg-gray-100"></div>
            )}
            <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0 shadow-sm z-10`}>
              {step.icon}
            </div>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex-1">
              <h3 className="font-black text-darkBlue mb-2">{step.title}</h3>
              <p className="text-xs text-textMedium leading-relaxed font-medium">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10">
        <div className="flex items-center gap-3 mb-3">
          <Lightbulb className="text-primary" size={20} />
          <h4 className="font-black text-darkBlue uppercase text-sm tracking-tight">Consejo de Oro</h4>
        </div>
        <p className="text-xs text-textMedium leading-relaxed font-bold italic">
          "La constancia es más importante que la perfección. Cada pequeño registro nos ayuda a ajustar tu tratamiento de forma personalizada."
        </p>
      </div>

      <div className="flex flex-col items-center pt-8 opacity-40">
        <ShieldCheck size={40} className="text-darkBlue mb-2" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Doctor Antivejez</p>
      </div>
    </div>
  );
};

export default UsageGuideView;
