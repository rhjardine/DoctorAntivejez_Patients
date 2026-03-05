import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, RefreshCw, Activity, Flame, MessageCircle,
    ClipboardCheck, ChevronRight, ClipboardList
} from 'lucide-react';
import { COLORS, MainTab } from '../types';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { ProtocolService } from '../services/protocolService';
import CircularProgress from '../components/CircularProgress';
import BiologicalAgeGauge from '../components/BiologicalAgeGauge';
import BioAgeAlert from '../components/BioAgeAlert';
import RemovalView from '../components/Therapies/RemovalView';
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
    const { profileData, setProfileData, isCacheValid } = useProfileStore();

    const [biophysicalAge, setBiophysicalAge] = useState<number>(65);
    const [chronologicalAge, setChronologicalAge] = useState<number>(58);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [adherence, setAdherence] = useState(0);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

    // View state for detail drill-down
    const [activeDetail, setActiveDetail] = useState<string | null>(null);

    useEffect(() => {
        setActiveDetail(null);
    }, [currentMainTab]);

    useEffect(() => {
        if (isLoadingMetrics || profileData) return;
        const loadMetrics = async () => {
            if (!session || isLoadingMetrics || profileData) return;

            // Check if we have valid cached data
            if (profileData && isCacheValid()) {
                console.log('✅ Using cached profile data (< 5 min old)');
                setBiophysicalAge(profileData.biologicalAge ?? 65);
                setChronologicalAge(profileData.chronologicalAge ?? 58);

                // Still need to fetch protocol items for adherence
                const items = await ProtocolService.fetchActiveProtocol(session.id);
                const completed = items.filter(i => i.status === 'completed').length;
                const total = items.length;
                setCompletedCount(completed);
                setTotalCount(total);
                setAdherence(total > 0 ? Math.round((completed / total) * 100) : 0);
                return;
            }

            setIsLoadingMetrics(true);
            console.log('🌐 Fetching fresh profile data from API');

            try {
                const profile = await ProtocolService.getMyProfile();
                if (profile) {
                    // Cache the profile data
                    setProfileData(profile);

                    // Update UI
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
            } finally {
                setIsLoadingMetrics(false);
            }
        };

        loadMetrics();
    }, [session?.token]);

    const getIcon = (category: keyof typeof userPreferences.icons) => {
        const iconId = userPreferences.icons[category];
        const IconComponent = ICON_MAP[iconId] || ICON_MAP['Apple']; // Fallback
        return <IconComponent size={20} />;
    };

    const renderDashboardMatrix = () => {
        const is5A = currentMainTab === MainTab.KEYS_5A;

        return (
            <div className="flex flex-col items-center justify-center w-full px-4 relative pb-2 min-h-[320px]">
                {/* Top Row: 2 Satellites */}
                <div className="flex justify-center gap-12 w-full px-4">
                    <div onClick={() => is5A ? navigate('/nutrition') : setActiveDetail('removal')} className="cursor-pointer flex justify-center transition-transform active:scale-95">
                        <CircularProgress
                            percentage={is5A ? 75 : 25}
                            label={is5A ? "Alimentación" : "Remoción"}
                            icon={is5A ? getIcon('NUTRITION') : <Trash2 size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={82}
                        />
                    </div>
                    <div onClick={() => is5A ? navigate('/activity') : navigate('/restoration')} className="cursor-pointer flex justify-center transition-transform active:scale-95">
                        <CircularProgress
                            percentage={is5A ? 40 : 35}
                            label={is5A ? "Actividad" : "Restauración"}
                            icon={is5A ? getIcon('ACTIVITY') : <RefreshCw size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={82}
                        />
                    </div>
                </div>

                {/* VCoach Center Nucleus */}
                <div className="flex justify-center -my-2 z-10">
                    <button onClick={() => navigate('/chat')} className="active:scale-90 transition-transform bg-white rounded-full p-1 shadow-2xl shadow-blue-900/20">
                        <CircularProgress
                            percentage={adherence}
                            label="VCoach IA"
                            icon={<MessageCircle size={28} />}
                            color={COLORS.DarkBlue}
                            isCenter={true}
                            size={108}
                        />
                    </button>
                </div>

                {/* Bottom Row: 3 Satellites (5A) or 2 Satellites (4R) */}
                <div className={`flex justify-center w-full ${is5A ? 'gap-4' : 'gap-12'}`}>
                    <div onClick={() => is5A ? navigate('/attitude') : null /* Regeneración */} className="cursor-pointer flex justify-center transition-transform active:scale-95">
                        <CircularProgress
                            percentage={is5A ? 60 : 40}
                            label={is5A ? "Actitud" : "Regeneración"}
                            icon={is5A ? getIcon('ATTITUDE') : <Activity size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={is5A ? 78 : 82}
                        />
                    </div>
                    <div onClick={() => is5A ? navigate('/environment') : null /* Revitalización */} className="cursor-pointer flex justify-center transition-transform active:scale-95">
                        <CircularProgress
                            percentage={is5A ? 30 : 60}
                            label={is5A ? "Ambiente" : "Revitalización"}
                            icon={is5A ? getIcon('ENVIRONMENT') : <Flame size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={is5A ? 78 : 82}
                        />
                    </div>
                    {/* The 5th Element: Asueto (Only in 5A) */}
                    {is5A && (
                        <div onClick={() => navigate('/rest')} className="cursor-pointer flex justify-center transition-transform active:scale-95">
                            <CircularProgress
                                percentage={55}
                                label="Asueto"
                                icon={getIcon('REST') || <Bed size={18} />}
                                color={COLORS.PrimaryBlue}
                                size={78}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full relative bg-[#F8FAFC]">
            <AnimatePresence mode="wait">
                {!activeDetail ? (
                    <motion.div
                        key="matrix"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col w-full h-full"
                    >
                        <BiologicalAgeGauge
                            biologicalAge={biophysicalAge}
                            chronologicalAge={chronologicalAge}
                            completedItems={completedCount}
                            totalItems={totalCount}
                            onInfoPress={() => toggleClinicalInfo(true)}
                        />

                        <div className="w-full">
                            {currentMainTab === MainTab.CHALLENGE ? (
                                <div className="flex flex-col items-center w-full px-6 py-4">
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
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center justify-center py-2">
                                        {renderDashboardMatrix()}
                                    </div>

                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col w-full h-full"
                    >
                        {activeDetail === 'removal' && <RemovalView onBack={() => setActiveDetail(null)} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;
