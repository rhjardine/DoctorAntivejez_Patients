import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, RefreshCw, Zap, ShieldCheck, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { AVISO_4R, TERAPIAS_4R } from '../../config/therapies4R';
import WellnessDisclaimer from '../public/WellnessDisclaimer';

/** Las 5A, en el orden en que la clínica las publica, con su pantalla. */
const CLAVES_5A: { nombre: string; ruta: string }[] = [
    { nombre: 'Alimentación', ruta: '/nutrition' },
    { nombre: 'Actividad física', ruta: '/activity' },
    { nombre: 'Asueto y sueño reparador', ruta: '/rest' },
    { nombre: 'Actitud mental y emocional', ruta: '/attitude' },
    { nombre: 'Ambiente armónico', ruta: '/environment' },
];

interface TherapyItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    benefit: string;
    power: number;
    icon: React.ReactNode;
}

const RESTORATION_THERAPIES: TherapyItem[] = [
    {
        id: 'gut-repair',
        title: 'Reparación Intestinal',
        subtitle: 'SELLADO DE LA BARRERA MUCOSA',
        description: 'Uso de L-Glutamina y Plasma Marino para restaurar las uniones estrechas del epitelio intestinal.',
        benefit: 'Detiene la filtración de toxinas al torrente sanguíneo (Leaky Gut).',
        power: 90,
        icon: <ShieldCheck size={24} />
    },
    {
        id: 'enzymes',
        title: 'Enzimas Digestivas',
        subtitle: 'OPTIMIZACIÓN DE LA ABSORCIÓN',
        description: 'Suplementación con Bromelina, Papaína y Betaína HCL para asegurar la ruptura completa de proteínas.',
        benefit: 'Previene la putrefacción intestinal y reduce la inflamación post-prandial.',
        power: 85,
        icon: <Zap size={24} />
    },
    {
        id: 'probiotics',
        title: 'Microbiota Simbiótica',
        subtitle: 'REPOBLACIÓN BACTERIANA',
        description: 'Inoculación de cepas Lactobacillus y Bifidobacterium de grado clínico para restaurar la eubiosis.',
        benefit: 'Mejora la producción de serotonina y fortalece el sistema inmune.',
        power: 95,
        icon: <Activity size={24} />
    }
];

const RestorationView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { session } = useAuthStore();
    const navigate = useNavigate();
    const firstName = session?.name?.split(' ')[0]?.toUpperCase() || 'PACIENTE';
    const fase = TERAPIAS_4R.restoration;

    return (
        <div className="flex flex-col w-full pb-32 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="mx-4 mt-6 bg-emerald-600 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onBack}
                                aria-label="Volver"
                                className="bg-white/10 p-2 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
                            >
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <div className="bg-white/20 p-2 rounded-xl">
                                <RefreshCw size={18} className="text-emerald-100" />
                            </div>
                            <span className="text-emerald-100 font-black uppercase tracking-widest text-[12px]">Fase 4: Restauración</span>
                        </div>
                    </div>

                    <h2 className="text-lg font-bold italic leading-relaxed opacity-90 mb-2">
                        "{firstName}, sostengamos en el tiempo lo que ya ganaste."
                    </h2>
                    <p className="text-xs font-medium text-emerald-100/80">
                        {fase.descripcion}
                    </p>
                </div>
            </div>

            {/* Las 5A: el contenido propio de esta fase según la clínica.
                Cada clave abre la pantalla que el paciente ya usa a diario. */}
            <div className="mx-4 mt-5 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <span className="text-[12px] font-black uppercase tracking-widest block mb-1 text-emerald-600">
                    Claves de la Longevidad 5A
                </span>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-4">
                    Se ajustan de manera personalizada. Toca cualquiera para ir a tu plan.
                </p>
                <ul className="flex flex-col gap-2">
                    {CLAVES_5A.map((clave, i) => (
                        <li key={clave.ruta}>
                            <button
                                onClick={() => navigate(clave.ruta)}
                                className="w-full flex items-center gap-3 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-2xl px-3 py-2.5 transition-colors active:scale-[0.99]"
                            >
                                <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-[13px] font-black shrink-0">
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-[#293b64] text-sm font-bold leading-snug">
                                    {clave.nombre}
                                </span>
                                <ChevronRight size={16} className="text-slate-500 shrink-0" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Soporte clínico de la fase */}
            <div className="px-4 mt-6 mb-1">
                <span className="text-[12px] font-black uppercase tracking-widest text-slate-500">
                    Soporte clínico de la fase
                </span>
            </div>

            {/* Therapies List */}
            <div className="flex flex-col gap-4 px-4 mt-2">
                {RESTORATION_THERAPIES.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-slate-800 font-black text-lg leading-tight mb-1">{item.title}</h3>
                                <p className="text-emerald-500 text-[12px] font-black uppercase tracking-widest">{item.subtitle}</p>
                            </div>
                        </div>

                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                            {item.description}
                        </p>

                        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-emerald-800/60 text-[12px] font-black uppercase tracking-widest">Potencia Regenerativa</span>
                                <span className="text-emerald-600 text-xs font-black">{item.power}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.power}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mx-4 mt-4">
                <WellnessDisclaimer text={AVISO_4R} />
            </div>
        </div>
    );
};

export default RestorationView;
