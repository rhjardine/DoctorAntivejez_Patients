import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Trophy, RefreshCw, Menu, ChevronLeft, LayoutDashboard,
    LogOut, WifiOff, AlertTriangle, ShieldCheck, Dna, Store
} from 'lucide-react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { useEscalaTexto } from '../hooks/useEscalaTexto';
import { MainTab } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useProfileStore } from '../store/useProfileStore';
import { useDarkMode } from '../hooks/useDarkMode';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { offlineQueue } from '../services/offlineQueue';

import Drawer from './Drawer';
import OnboardingModal, { ONBOARDING_KEY } from './OnboardingModal';
import OnboardingSlim from './OnboardingSlim';
import ClinicalInfoModal from './ClinicalInfoModal';
import PrivacyConsentModal from './PrivacyConsentModal';
import { useReminders } from '../hooks/useReminders';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    useEscalaTexto();

    const { session, logout, checkSession } = useAuthStore();

    // Reset scroll on route change
    useEffect(() => {
        const mainContainer = document.getElementById('vytalix-main-container');
        if (mainContainer) {
            mainContainer.scrollTo(0, 0);
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    useDarkMode();
    useSyncQueue();

    const {
        isDrawerOpen, toggleDrawer,
        isClinicalInfoOpen, toggleClinicalInfo,
        isPrivacyConsentOpen, togglePrivacyConsent,
        currentMainTab, setMainTab
    } = useUIStore();
    const { forceRefresh, profileData } = useProfileStore();

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    // Accesos de la barra inferior que no entran en la Beta. Antes eran <div>
    // con un tooltip en :hover, que en un móvil no existe: el paciente tocaba y
    // no pasaba nada. Ahora responden con un aviso explícito.

    const { resetTimer } = useSessionTimeout({
        timeoutMs: 30 * 60 * 1000,
        warningMs: 5 * 60 * 1000,
        onWarning: () => setShowTimeoutWarning(true),
        onTimeout: () => {
            void logout().then(() => {
                navigate('/acceso');
                setShowTimeoutWarning(false);
            });
        },
        enabled: !!session
    });

    useEffect(() => {
        if (!isOnline) {
            offlineQueue.countForCurrentPatient().then(setPendingCount);
            const interval = setInterval(() => {
                offlineQueue.countForCurrentPatient().then(setPendingCount);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setPendingCount(0);
        }
    }, [isOnline]);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.ready.then(registration => {
            if (registration.waiting) setShowUpdateBanner(true);
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && registration.waiting) {
                        setShowUpdateBanner(true);
                    }
                });
            });
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => setShowUpdateBanner(false));
    }, []);

    useEffect(() => {
        checkSession();
        if (session && !localStorage.getItem(ONBOARDING_KEY) && !localStorage.getItem('da_onboarding_slim_v1')) {
            setShowOnboarding(true);
        }
    }, [session?.id]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const notificationControls = useReminders([]);

    const isLoginPage = location.pathname === '/login';
    const PUBLIC_ROUTES = ['/acceso', '/longevidad', '/longevidad-tests', '/test', '/agebot', '/resultado', '/consulta', '/medicos'];
    const isPublicRoute = PUBLIC_ROUTES.some(r => location.pathname.startsWith(r));
    const showHeaderFooter = session && !isLoginPage && !isPublicRoute;
    const isHome = location.pathname === '/';
    const isDetailView = !isHome && !['/chat', '/achievements', '/store'].includes(location.pathname);

    const handleLogout = async () => { await logout(); navigate('/acceso'); };

    /**
     * Destinos de la barra inferior, por indicación del médico.
     *
     * Antes eran cuatro y tres solo mostraban un aviso de «en construcción».
     * Siguen siendo los mismos cuatro —Logros sirve para que el paciente vea de
     * un vistazo su avance y su adherencia—, pero ahora todos navegan a su
     * pantalla en lugar de no hacer nada.
     */
    const DESTINOS_PRINCIPALES = [
        {
            id: 'inicio',
            etiqueta: 'Inicio',
            Icono: LayoutDashboard,
            activo: isHome,
            alPulsar: () => { navigate('/'); setMainTab(MainTab.KEYS_5A); toggleDrawer(false); },
        },
        {
            id: 'logros',
            etiqueta: 'Logros',
            Icono: Trophy,
            activo: location.pathname === '/achievements',
            alPulsar: () => { navigate('/achievements'); toggleDrawer(false); },
        },
        {
            id: 'biomics',
            etiqueta: 'Biomics',
            Icono: Dna,
            activo: location.pathname === '/biomics',
            alPulsar: () => { navigate('/biomics'); toggleDrawer(false); },
        },
        {
            id: 'tienda',
            etiqueta: 'Tienda',
            Icono: Store,
            activo: location.pathname === '/store',
            alPulsar: () => { navigate('/store'); toggleDrawer(false); },
        },
    ];    const handleRefresh = async () => {
        setIsRefreshing(true);
        forceRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans">
            {showOnboarding && session && (
                localStorage.getItem('da_funnel_conversion')
                    ? <OnboardingSlim onComplete={() => setShowOnboarding(false)} />
                    : <OnboardingModal onComplete={() => setShowOnboarding(false)} />
            )}
            <Drawer isOpen={isDrawerOpen} onClose={() => toggleDrawer(false)} notificationControls={notificationControls} />
            <ClinicalInfoModal isOpen={isClinicalInfoOpen} onClose={() => toggleClinicalInfo(false)} />
            <PrivacyConsentModal isOpen={isPrivacyConsentOpen} onAccept={(() => { togglePrivacyConsent(false); }) as any} />

            {showHeaderFooter && (
                <header className="bg-[#001334] border-b border-white/5 text-white pt-safe-top z-30 shadow-sm shrink-0 relative overflow-hidden">
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,188,239,0.12)_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="relative flex items-center justify-between px-6 h-20 z-10">
                        {isDetailView ? (
                            <button onClick={() => navigate(-1)} aria-label="Volver" className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:text-primary hover:bg-white/10 active:scale-95 transition-all"><ChevronLeft size={28} /></button>
                        ) : (
                            <button onClick={() => toggleDrawer(true)} aria-label="Abrir menú" className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:text-primary hover:bg-white/10 active:scale-95 transition-all"><Menu size={28} /></button>
                        )}
                        
                        {/* Perfect centering with absolute positioning and enlarged logo */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            <img 
                                src="/logoadn.jpeg" 
                                alt="Doctor Antivejez" 
                                className="h-[76px] w-auto object-contain transition-all duration-300 hover:scale-[1.05]" 
                            />
                        </div>
                        
                        <div className="flex items-center">
                            <button
                                onClick={handleRefresh}
                                aria-label="Actualizar mis datos"
                                disabled={isRefreshing}
                                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={20} />
                            </button>
                            <span aria-hidden="true" className="w-px h-6 bg-white/15 mx-1.5" />
                            <button
                                onClick={handleLogout}
                                aria-label="Cerrar sesión"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-white/55 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                    {isHome && (
                        <div className="flex bg-[var(--surface)] border-b border-[var(--border)] shadow-sm">
                            <button onClick={() => setMainTab(MainTab.CHALLENGE)} className={`flex-1 py-3 px-2 text-[calc(14px*var(--escala-texto,1))] tracking-tight flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.CHALLENGE ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <Trophy size={16} strokeWidth={currentMainTab === MainTab.CHALLENGE ? 3 : 2} /> Mi Guía
                            </button>
                            <button onClick={() => setMainTab(MainTab.KEYS_5A)} className={`flex-1 py-3 px-2 text-[calc(14px*var(--escala-texto,1))] tracking-tight flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.KEYS_5A ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <Shield size={16} strokeWidth={currentMainTab === MainTab.KEYS_5A ? 3 : 2} /> Claves 5A
                            </button>
                            <button onClick={() => setMainTab(MainTab.THERAPIES_4R)} className={`flex-1 py-3 px-2 text-[calc(14px*var(--escala-texto,1))] tracking-tight flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.THERAPIES_4R ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <RefreshCw size={16} strokeWidth={currentMainTab === MainTab.THERAPIES_4R ? 3 : 2} /> Terapias 4R
                            </button>
                        </div>
                    )}
                </header>
            )}

            <main id="vytalix-main-container" className={`flex-1 overflow-y-auto no-scrollbar relative ${isPublicRoute ? '' : 'bg-[var(--background)]'}`} style={{ paddingBottom: isPublicRoute ? '0' : 'max(80px, env(safe-area-inset-bottom, 0px) + 64px)' }}>
                {children}
            </main>

            {showHeaderFooter && !isOnline && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-amber-400/50 animate-in fade-in slide-in-from-bottom-4">
                        <WifiOff size={14} />
                        <span className="text-[calc(12px*var(--escala-texto,1))] font-black uppercase tracking-widest text-center">
                            {pendingCount > 0 ? `Modo Offline · ${pendingCount} registro(s) pendiente(s)` : `Modo Offline · Datos de ${profileData?.fetchedAt ? new Date(profileData.fetchedAt).toLocaleDateString() : 'hoy'}`}
                        </span>
                    </div>
                </div>
            )}

            {showUpdateBanner && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60]">
                    <div className="bg-darkBlue text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4">
                        <span className="text-[calc(12px*var(--escala-texto,1))] font-black uppercase tracking-widest">Nueva versión disponible</span>
                        <button
                            onClick={() => {
                                navigator.serviceWorker.ready.then(reg => reg.waiting?.postMessage({ type: 'SKIP_WAITING' }));
                                if ('caches' in window) caches.keys().then(keys => keys.forEach(k => { if (k.includes('manifest') || k.includes('workbox')) caches.delete(k); }));
                                setTimeout(() => window.location.reload(), 300);
                            }}
                            className="text-primary text-[calc(12px*var(--escala-texto,1))] font-black uppercase underline hover:text-white transition-colors"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showTimeoutWarning && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-4 right-4 z-[70] flex justify-center">
                        <div className="bg-white p-4 rounded-3xl shadow-2xl border-2 border-amber-100 flex items-center gap-4 max-w-sm w-full">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-500" size={20} /></div>
                            <div className="flex-1">
                                <p className="text-[calc(13px*var(--escala-texto,1))] font-bold text-darkBlue leading-tight">Tu sesión expirará pronto por inactividad.</p>
                                <button onClick={() => { resetTimer(); setShowTimeoutWarning(false); }} className="text-[calc(12px*var(--escala-texto,1))] font-black uppercase text-primary mt-1 flex items-center gap-1"><ShieldCheck size={12} /> Mantener sesión activa</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showHeaderFooter && (
                /* Barra inferior.
                 *
                 * Tenía cuatro destinos y tres no llevaban a ninguna parte: Logros,
                 * Biomics y Tienda solo mostraban un aviso de «en construcción». Un
                 * paciente que toca tres veces sin que pase nada no concluye que la
                 * función falte, concluye que no sabe usar la app, y deja de explorar.
                 *
                 * Ahora los cuatro destinos existen y son los que el paciente usa a
                 * diario. Las secciones pendientes volverán cuando tengan contenido. */
                <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 pb-safe-bottom shrink-0">
                    <nav aria-label="Navegación principal" className="flex justify-around items-center py-2 px-2">
                        {DESTINOS_PRINCIPALES
                            .map(({ id, etiqueta, Icono, alPulsar, activo }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={alPulsar}
                                    aria-current={activo ? 'page' : undefined}
                                    className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] px-2 py-1.5 rounded-xl transition-all active:scale-95 ${activo ? 'text-[#293b64]' : 'text-slate-500'
                                        }`}
                                >
                                    <Icono size={24} strokeWidth={activo ? 2.5 : 2} />
                                    <span className="text-[calc(12px*var(--escala-texto,1))] font-bold tracking-tight leading-none">{etiqueta}</span>
                                </button>
                            ))}
                    </nav>
                </footer>
            )}
        </div>
    );
};

export default MainLayout;
