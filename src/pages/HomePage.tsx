import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, RefreshCw, Activity, Flame, MessageCircle,
    ClipboardCheck, ChevronRight, ClipboardList
} from 'lucide-react';
import { COLORS, MainTab } from '../types';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProtocolService } from '../services/protocolService';
import CircularProgress from '../components/CircularProgress';
import BiologicalAgeGauge from '../components/BiologicalAgeGauge';
import BioAgeAlert from '../components/BioAgeAlert';
import { Apple, Utensils, Coffee, Salad, Grape, Zap, Dumbbell, Trophy, Bike, Smile, Brain, Heart, Sparkles, Star, Sprout, Leaf, Home, CloudSun, Wind, Bed, Moon, Clock, Bell, Check } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    Apple, Utensils, Coffee, Salad, Grape,
    Zap, Activity, Dumbbell, Trophy, Bike,
    Smile, Brain, Heart, Sparkles, Star,
    Sprout, Leaf, Home, CloudSun, Wind,
    Bed, Moon, Clock, Bell, Check
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { currentMainTab, userPreferences, toggleClinicalInfo } = useUIStore();
    const { session } = useAuthStore();

    const [biophysicalAge, setBiophysicalAge] = useState<number>(65);
    const [chronologicalAge, setChronologicalAge] = useState<number>(58);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [adherence, setAdherence] = useState(0);

    useEffect(() => {
        const loadMetrics = async () => {
            if (session) {
                try {
                    const profile = await ProtocolService.getMyProfile();
                    if (profile) {
                        // Ensure we have valid numbers, fallback to defaults if null
                        setBiophysicalAge(profile.biologicalAge ?? 65);
                        setChronologicalAge(profile.chronologicalAge ?? 58);
                    }

                    const items = await ProtocolService.fetchActiveProtocol(session.id);
                    const completed = items.filter(i => i.status === 'completed').length;
                    const total = items.length;
                    setCompletedCount(completed);
                    setTotalCount(total);
                    setAdherence(total > 0 ? Math.round((completed / total) * 100) : 0);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        loadMetrics();
    }, [session]);

    const getIcon = (category: keyof typeof userPreferences.icons) => {
        const iconId = userPreferences.icons[category];
        const IconComponent = ICON_MAP[iconId] || ICON_MAP['Apple']; // Fallback
        return <IconComponent size={20} />;
    };

    const renderDashboardMatrix = () => {
        const is5A = currentMainTab === MainTab.KEYS_5A;

        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 mt-2 w-full px-4 relative pb-10">
                {is5A ? (
                    <>
                        <div onClick={() => navigate('/nutrition')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={75} label="Alimentación" icon={getIcon('NUTRITION')} color={COLORS.PrimaryBlue} size={90} /></div>
                        <div onClick={() => navigate('/activity')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={40} label="Actividad" icon={getIcon('ACTIVITY')} color={COLORS.PrimaryBlue} size={90} /></div>
                    </>
                ) : (
                    <>
                        <div onClick={() => navigate('/about')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={25} label="Remoción" icon={<Trash2 size={20} />} color={COLORS.PrimaryBlue} size={90} /></div>
                        <div onClick={() => navigate('/about')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={35} label="Restauración" icon={<RefreshCw size={20} />} color={COLORS.PrimaryBlue} size={90} /></div>
                    </>
                )}

                <div className="col-span-2 flex justify-center -my-6 z-10">
                    <button onClick={() => navigate('/chat')} className="active:scale-90 transition-transform">
                        <CircularProgress percentage={adherence} label="Mi VCoach" icon={<MessageCircle size={30} />} color={COLORS.DarkBlue} isCenter={true} size={110} />
                    </button>
                </div>

                {is5A ? (
                    <>
                        <div onClick={() => navigate('/attitude')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={60} label="Actitud" icon={getIcon('ATTITUDE')} color={COLORS.PrimaryBlue} size={85} /></div>
                        <div onClick={() => navigate('/environment')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={30} label="Entorno" icon={getIcon('ENVIRONMENT')} color={COLORS.PrimaryBlue} size={85} /></div>
                    </>
                ) : (
                    <>
                        <div onClick={() => navigate('/about')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={40} label="Regeneración" icon={<Activity size={20} />} color={COLORS.PrimaryBlue} size={85} /></div>
                        <div onClick={() => navigate('/about')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={60} label="Revitalización" icon={<Flame size={20} />} color={COLORS.PrimaryBlue} size={85} /></div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-32">
            <BiologicalAgeGauge
                biologicalAge={biophysicalAge}
                chronologicalAge={chronologicalAge}
                completedItems={completedCount}
                totalItems={totalCount}
                onInfoPress={() => toggleClinicalInfo(true)}
            />

            <div className="w-full">
                {currentMainTab === MainTab.CHALLENGE ? (
                    <div className="flex flex-col items-center w-full px-6 py-4 animate-in fade-in duration-300">
                        <div className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-4 mb-6 border border-white/50 text-center shadow-sm">
                            <p className="text-[11px] font-bold text-darkBlue italic">"La consistencia es la clave de la regeneración celular."</p>
                        </div>
                        <div onClick={() => navigate('/guide')} className="w-full bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 mb-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="bg-sky-50 p-3.5 rounded-2xl text-primary"><ClipboardCheck size={28} /></div>
                                <div>
                                    <h3 className="font-black text-darkBlue text-lg">Guía del Paciente</h3>
                                    <p className="text-[10px] font-bold text-textMedium uppercase">Misión Diaria</p>
                                </div>
                            </div>
                            <div className="bg-red-50 text-accentRed text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-tighter">
                                {totalCount - completedCount} Pendientes
                            </div>
                        </div>
                        <div className="w-full bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black text-darkBlue uppercase">Progreso Hoy</span>
                                <span className="text-xs font-black text-primary">{adherence}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${adherence}%` }}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {renderDashboardMatrix()}

                        <BioAgeAlert
                            bioAge={biophysicalAge}
                            chronoAge={chronologicalAge}
                            onAction={() => navigate('/guide')}
                        />

                        <div
                            onClick={() => navigate('/guide')}
                            className="mx-6 mb-6 mt-6 bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-sky-50 p-3.5 rounded-2xl text-primary"><ClipboardList size={28} /></div>
                                <div>
                                    <h3 className="font-black text-darkBlue text-base leading-tight">Continuar Plan</h3>
                                    <p className="text-[10px] font-bold text-textMedium uppercase tracking-tighter">{totalCount - completedCount} tareas pendientes</p>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300" size={20} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
