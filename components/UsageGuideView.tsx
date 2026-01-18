
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
