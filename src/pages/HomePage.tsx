import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, RefreshCw, Activity, Flame, MessageCircle,
    ClipboardCheck, ChevronRight, ClipboardList, Wrench
} from 'lucide-react';
import { COLORS, MainTab } from '../types';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { ProtocolService } from '../services/protocolService';
import CircularProgress from '../components/CircularProgress';
import BiologicalAgeGauge from '../components/BiologicalAgeGauge';
import BioStreakWidget from '../components/public/BioStreakWidget';
import PulsoMatinoCard from '../components/public/PulsoMatinoCard';
import { BioStreakService } from '../services/BioStreakService';
import BioAgeAlert from '../components/BioAgeAlert';
import RemovalView from '../components/Therapies/RemovalView';
import RestorationView from '../components/Therapies/RestorationView';
import RevitalizationView from '../components/Therapies/RevitalizationView';
import RegenerationView from '../components/Therapies/RegenerationView';
import { Apple, Utensils, Coffee, Salad, Grape, Zap, Dumbbell, Trophy, Bike, Smile, Brain, Heart, Sparkles, Star, Sprout, Leaf, Home, CloudSun, Wind, Bed, Moon, Clock, Bell, Check, Dna } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    Apple, Utensils, Coffee, Salad, Grape,
    Zap, Activity, Dumbbell, Trophy, Bike,
    Smile, Brain, Heart, Sparkles, Star,
    Sprout, Leaf, Home, CloudSun, Wind,
    Bed, Moon, Clock, Bell, Check
};

const CATEGORY_ICON_MAP: Record<string, any> = {
    ...ICON_MAP,
    'ACTIVITY': Dumbbell
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { currentMainTab, userPreferences, toggleClinicalInfo } = useUIStore();
    const { session } = useAuthStore();
    const { profileData, setProfileData, isCacheValid } = useProfileStore();

    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [adherence, setAdherence] = useState(0);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

    // View state for detail drill-down
    const [activeDetail, setActiveDetail] = useState<string | null>(null);

    /**
     * Clave que el paciente acaba de tocar y cuyo contenido aún se prepara.
     *
     * El aviso se va solo a los pocos segundos: es una respuesta al toque, no
     * algo que haya que cerrar. Mientras tanto se puede seguir usando la
     * pantalla, así que no es un modal.
     */
    const [claveEnDesarrollo, setClaveEnDesarrollo] = useState<string | null>(null);
    useEffect(() => {
        if (!claveEnDesarrollo) return;
        const id = setTimeout(() => setClaveEnDesarrollo(null), 3200);
        return () => clearTimeout(id);
    }, [claveEnDesarrollo]);

    useEffect(() => {
        setActiveDetail(null);
    }, [currentMainTab]);

    /**
     * Las vistas de detalle se montan dentro del contenedor con scroll de
     * MainLayout, que conserva la posición anterior: Regeneración y
     * Revitalización aparecían empezadas por la mitad. Se vuelve arriba al
     * abrir y al cerrar.
     */
    useEffect(() => {
        document.getElementById('vytalix-main-container')?.scrollTo({ top: 0 });
    }, [activeDetail]);

    useEffect(() => {
        if (isLoadingMetrics) return;
        // If cache is valid and has alimentacion, skip fetch
        if (profileData && isCacheValid() &&
            profileData.alimentacion !== undefined) return;

        const loadMetrics = async () => {
            if (!session || isLoadingMetrics) return;

            setIsLoadingMetrics(true);
            console.log('🌐 Fetching fresh profile data from API');

            try {
                const profile = await ProtocolService.getMyProfile();
                if (profile) {
                    setProfileData({
                        biologicalAge: profile.biophysics?.biologicalAge ?? profile.biologicalAge ?? null,
                        chronologicalAge: profile.chronologicalAge ?? null,
                        guides: profile.guides || [],
                        foodPlans: profile.foodPlans || [],
                        bloodType: profile.bloodType || null,
                        latestNlr: profile.latestNlr || null,
                        firstName: profile.firstName,
                        alimentacion: profile.alimentacion ?? null,
                        fetchedAt: Date.now()
                    });
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
    }, [session?.id]);

    const getIcon = (category: keyof typeof userPreferences.icons) => {
        const iconId = userPreferences.icons[category];
        const IconComponent = CATEGORY_ICON_MAP[iconId] || CATEGORY_ICON_MAP[category] || CATEGORY_ICON_MAP['Apple']; // Fallback
        return <IconComponent size={20} />;
    };

    /**
     * Responde al toque de una clave que todavía no tiene contenido.
     *
     * Se vuelve a fijar aunque ya esté puesta (primero a `null`) para que tocar
     * dos claves seguidas reinicie la cuenta y el aviso nombre a la última.
     */
    const avisarEnDesarrollo = (clave: string) => {
        setClaveEnDesarrollo(null);
        requestAnimationFrame(() => setClaveEnDesarrollo(clave));
    };

    /**
     * Envoltorio de un círculo de la matriz.
     *
     * `enPreparacion` ya no deja el círculo muerto. Antes se atenuaba, se
     * desaturaba y se rotulaba «PRONTO» dentro del aro: tres señales para decir
     * lo mismo, y aun así el paciente lo tocaba y no pasaba nada. Ahora responde
     * al toque con un aviso que lo explica en palabras, y se queda solo con una
     * atenuación leve para que siga distinguiéndose de las claves ya abiertas.
     *
     * Es un `button` y no un `div`: con `onClick` sobre un `div` estos círculos
     * no se alcanzaban con el teclado ni los anunciaba el lector de pantalla.
     */
    const Satelite: React.FC<{
        onClick?: () => void;
        enPreparacion?: boolean;
        children: React.ReactNode;
    }> = ({ onClick, enPreparacion = false, children }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex justify-center rounded-full cursor-pointer transition-transform active:scale-95 ${enPreparacion ? 'opacity-70' : ''}`}
        >
            {children}
        </button>
    );

    const renderDashboardMatrix = () => {
        const is5A = currentMainTab === MainTab.KEYS_5A;
        // Por indicación del médico, en Claves 5A solo Alimentación está
        // disponible: el contenido de las otras cuatro va a cambiar y no debe
        // consultarse mientras tanto.
        const claveEnRevision = is5A;

        return (
            <div className="flex flex-col items-center justify-center w-full px-4 relative pb-1 min-h-[296px]">
                {/* Aviso de clave en preparación.
                    `role="status"` para que el lector de pantalla lo anuncie sin
                    robar el foco, y posición de barra inferior para que no tape
                    el círculo que el paciente acaba de tocar.

                    El centrado va en `x` de framer-motion y no en una clase
                    `-translate-x-1/2`: la animación escribe `transform` en línea
                    y se comía la utilidad de Tailwind, de modo que el aviso salía
                    desplazado a la derecha y partido en dos líneas. */}
                {claveEnDesarrollo && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, x: '-50%' }}
                        role="status"
                        className="fixed bottom-24 left-1/2 z-40 flex items-center gap-2 bg-darkBlue text-white rounded-full pl-3 pr-4 py-2 shadow-xl max-w-[88vw]"
                    >
                        <Wrench size={14} className="shrink-0 text-primary" />
                        <span className="text-[calc(12px*var(--escala-texto,1))] font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {claveEnDesarrollo}: en desarrollo
                        </span>
                    </motion.div>
                )}

                {/* Top Row: 2 Satellites */}
                <div className="flex justify-center gap-12 w-full px-4">
                    <Satelite onClick={() => is5A ? navigate('/nutrition') : setActiveDetail('removal')}>
                        <CircularProgress
                            percentage={is5A ? adherence : 0}
                            label={is5A ? "Alimentación" : "Remoción"}
                            centerText={is5A ? undefined : 'FASE 1'}
                            icon={is5A ? getIcon('NUTRITION') : <Trash2 size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={82}
                        />
                    </Satelite>
                    <Satelite
                        onClick={() => claveEnRevision ? avisarEnDesarrollo('Actividad') : setActiveDetail('restoration')}
                        enPreparacion={claveEnRevision}
                    >
                        <CircularProgress
                            percentage={is5A ? adherence : 0}
                            label={is5A ? "Actividad" : "Restauración"}
                            centerText={is5A ? '' : 'FASE 4'}
                            icon={is5A ? getIcon('ACTIVITY') : <RefreshCw size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={82}
                        />
                    </Satelite>
                </div>

                {/* VCoach Center Nucleus */}
                <div className="flex justify-center z-10 py-1">
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
                <div className={`flex justify-center w-full py-1 ${is5A ? 'gap-4' : 'gap-12'}`}>
                    <Satelite
                        onClick={() => claveEnRevision ? avisarEnDesarrollo('Actitud') : setActiveDetail('regeneration')}
                        enPreparacion={claveEnRevision}
                    >
                        <CircularProgress
                            percentage={is5A ? adherence : 0}
                            label={is5A ? "Actitud" : "Regeneración"}
                            centerText={is5A ? '' : 'FASE 3'}
                            icon={is5A ? getIcon('ATTITUDE') : <Activity size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={is5A ? 78 : 82}
                        />
                    </Satelite>
                    <Satelite
                        onClick={() => claveEnRevision ? avisarEnDesarrollo('Ambiente') : setActiveDetail('revitalization')}
                        enPreparacion={claveEnRevision}
                    >
                        <CircularProgress
                            percentage={is5A ? adherence : 0}
                            label={is5A ? "Ambiente" : "Revitalización"}
                            centerText={is5A ? '' : 'FASE 2'}
                            icon={is5A ? getIcon('ENVIRONMENT') : <Flame size={18} />}
                            color={COLORS.PrimaryBlue}
                            size={is5A ? 78 : 82}
                        />
                    </Satelite>
                    {/* The 5th Element: Asueto (Only in 5A) */}
                    {is5A && (
                        <Satelite onClick={() => avisarEnDesarrollo('Asueto')} enPreparacion>
                            <CircularProgress
                                percentage={0}
                                label="Asueto"
                                centerText=""
                                icon={getIcon('REST') || <Bed size={18} />}
                                color={COLORS.PrimaryBlue}
                                size={78}
                            />
                        </Satelite>
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
                            biologicalAge={profileData?.biologicalAge ?? '--'}
                            chronologicalAge={profileData?.chronologicalAge ?? '--'}
                            completedItems={completedCount}
                            totalItems={totalCount}
                            onInfoPress={() => toggleClinicalInfo(true)}
                        />

                        <div className="w-full">
                            {currentMainTab === MainTab.CHALLENGE ? (
                                <div className="flex flex-col items-center w-full px-6 py-4">
                                    <div className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-4 mb-3 border border-white/50 text-center shadow-sm">
                                        <p className="text-[calc(13px*var(--escala-texto,1))] font-bold text-[#293b64] italic">"La consistencia es la clave de la regeneración celular."</p>
                                    </div>

                                    {/* Componentes Anti-Churn */}
                                    {!BioStreakService.isPulseRegisteredToday() && (
                                        <div className="w-full mb-3">
                                            <PulsoMatinoCard />
                                        </div>
                                    )}
                                    <div className="w-full mb-4">
                                        <BioStreakWidget compact={false} />
                                    </div>

                                    <div onClick={() => navigate('/guide')} className="w-full bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 mb-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-sky-50 p-3.5 rounded-2xl text-[#107da8]"><ClipboardCheck size={28} /></div>
                                            <div>
                                                <h3 className="font-black text-[#293b64] text-lg">Guía del Paciente</h3>
                                                <p className="text-[calc(12px*var(--escala-texto,1))] font-bold text-textMedium uppercase">Misión Diaria</p>
                                            </div>
                                        </div>
                                        <div className="bg-red-50 text-accentRed text-[calc(12px*var(--escala-texto,1))] font-black px-3 py-2 rounded-xl uppercase tracking-tighter">
                                            {totalCount - completedCount} Pendientes
                                        </div>
                                    </div>
                                    <div onClick={() => navigate('/mi-guia/alimentacion')} className="w-full bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 mb-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-sky-50 p-3.5 rounded-2xl text-[#107da8]"><Dna size={28} /></div>
                                            <div>
                                                <h3 className="font-black text-[#293b64] text-lg leading-tight">Alimentación Sana</h3>
                                                <p className="text-[calc(12px*var(--escala-texto,1))] font-bold uppercase tracking-wider" style={{ color: '#23bcef' }}>Antienvejecimiento</p>
                                            </div>
                                        </div>
                                        <div className="text-[#107da8] pr-2">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                    <div className="w-full bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-black text-[#293b64] uppercase">Progreso Hoy</span>
                                            <span className="text-xs font-black text-[#107da8]">{adherence}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#23bcef] rounded-full transition-all duration-500" style={{ width: `${adherence}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : currentMainTab === MainTab.KEYS_5A ? (
                                <div className="flex flex-col flex-1 px-4 pb-4">
                                    <section className="mb-2">
                                        {renderDashboardMatrix()}
                                    </section>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 px-4 pb-4">
                                    {/* =========================================================
                                        TERAPIAS 4R
                                        Cada círculo abre su fase y lleva dentro el número que
                                        ocupa en la secuencia. Fuera de los círculos solo queda
                                        este aviso de una línea, y el paciente puede cerrarlo:
                                        la explicación larga vive dentro de cada fase, no aquí.
                                        ========================================================= */}
                                    <section className="mb-2">
                                        {renderDashboardMatrix()}
                                    </section>
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
                        {activeDetail === 'revitalization' && <RevitalizationView onBack={() => setActiveDetail(null)} />}
                        {activeDetail === 'regeneration' && <RegenerationView onBack={() => setActiveDetail(null)} />}
                        {activeDetail === 'restoration' && <RestorationView onBack={() => setActiveDetail(null)} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;
