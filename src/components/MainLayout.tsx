import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Trophy, RefreshCw, Menu, ChevronLeft, LayoutDashboard,
    Store, LogOut, Dna, WifiOff, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
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

    const { resetTimer } = useSessionTimeout({
        timeoutMs: 30 * 60 * 1000,
        warningMs: 5 * 60 * 1000,
        onWarning: () => setShowTimeoutWarning(true),
        onTimeout: () => {
            logout();
            navigate('/login');
            setShowTimeoutWarning(false);
        },
        enabled: !!session
    });

    useEffect(() => {
        if (!isOnline) {
            offlineQueue.count().then(setPendingCount);
            const interval = setInterval(() => {
                offlineQueue.count().then(setPendingCount);
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

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleRefresh = async () => {
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
                <header className="bg-[var(--dark-navy)] text-white pt-safe-top z-30 shadow-sm shrink-0">
                    <div className="flex items-center justify-between px-6 py-3.5">
                        {isDetailView ? (
                            <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft size={28} /></button>
                        ) : (
                            <button onClick={() => toggleDrawer(true)} className="p-1"><Menu size={28} /></button>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                                <Dna size={18} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[10px] font-black tracking-widest uppercase leading-none">Doctor</h1>
                                <h1 className="text-sm font-black text-primary tracking-tighter uppercase leading-none">Antivejez</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRefresh} className={`p-1 text-white/70 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`} disabled={isRefreshing}>
                                <RefreshCw size={18} />
                            </button>
                            <button onClick={handleLogout} className="p-1 text-white/20 hover:text-white transition-colors"><LogOut size={20} /></button>
                        </div>
                    </div>
                    {isHome && (
                        <div className="flex bg-[var(--surface)] border-b border-[var(--border)] shadow-sm">
                            <button onClick={() => setMainTab(MainTab.CHALLENGE)} className={`flex-1 py-3 px-2 text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.CHALLENGE ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <Trophy size={13} strokeWidth={currentMainTab === MainTab.CHALLENGE ? 3 : 2} /> Mi Guía
                            </button>
                            <button onClick={() => setMainTab(MainTab.KEYS_5A)} className={`flex-1 py-3 px-2 text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.KEYS_5A ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <Shield size={13} strokeWidth={currentMainTab === MainTab.KEYS_5A ? 3 : 2} /> Claves 5A
                            </button>
                            <button onClick={() => setMainTab(MainTab.THERAPIES_4R)} className={`flex-1 py-3 px-2 text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 border-b-[3px] transition-all duration-200 ${currentMainTab === MainTab.THERAPIES_4R ? 'font-black text-[#1a3a5c] border-[#1a3a5c] bg-blue-50/50' : 'font-semibold text-[#334155] border-transparent hover:text-[#1a3a5c] hover:bg-slate-50'}`}>
                                <RefreshCw size={13} strokeWidth={currentMainTab === MainTab.THERAPIES_4R ? 3 : 2} /> Terapias 4R
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">
                            {pendingCount > 0 ? `Modo Offline · ${pendingCount} registro(s) pendiente(s)` : `Modo Offline · Datos de ${profileData?.fetchedAt ? new Date(profileData.fetchedAt).toLocaleDateString() : 'hoy'}`}
                        </span>
                    </div>
                </div>
            )}

            {showUpdateBanner && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60]">
                    <div className="bg-darkBlue text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Nueva versión disponible</span>
                        <button
                            onClick={() => {
                                navigator.serviceWorker.ready.then(reg => reg.waiting?.postMessage({ type: 'SKIP_WAITING' }));
                                if ('caches' in window) caches.keys().then(keys => keys.forEach(k => { if (k.includes('manifest') || k.includes('workbox')) caches.delete(k); }));
                                setTimeout(() => window.location.reload(), 300);
                            }}
                            className="text-primary text-[10px] font-black uppercase underline hover:text-white transition-colors"
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
                                <p className="text-[11px] font-bold text-darkBlue leading-tight">Tu sesión expirará pronto por inactividad.</p>
                                <button onClick={() => { resetTimer(); setShowTimeoutWarning(false); }} className="text-[10px] font-black uppercase text-primary mt-1 flex items-center gap-1"><ShieldCheck size={12} /> Mantener sesión activa</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showHeaderFooter && (
                <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--dark-navy)] border-t border-white/5 pb-safe-bottom shrink-0">
                    <div className="flex justify-around items-center py-3.5 px-4">
                        <button onClick={() => { navigate('/'); setMainTab(MainTab.KEYS_5A); toggleDrawer(false); }} className={`flex flex-col items-center gap-1 transition-all ${isHome ? 'text-white scale-110' : 'text-white/40'}`}>
                            <LayoutDashboard size={24} strokeWidth={isHome ? 2.5 : 2} /><span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
                        </button>
                        <button onClick={() => navigate('/achievements')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/achievements' ? 'text-white scale-110' : 'text-white/40'}`}>
                            <Trophy size={24} strokeWidth={location.pathname === '/achievements' ? 2.5 : 2} /><span className="text-[9px] font-black uppercase tracking-widest">Logros</span>
                        </button>
                        <button onClick={() => navigate('/biomics')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/biomics' ? 'text-white scale-110' : 'text-white/40'}`}>
                            <Dna size={24} strokeWidth={location.pathname === '/biomics' ? 2.5 : 2} /><span className="text-[9px] font-black uppercase tracking-widest">Biomics</span>
                        </button>
                        <button onClick={() => navigate('/store')} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/store' ? 'text-white scale-110' : 'text-white/40'}`}>
                            <Store size={24} strokeWidth={location.pathname === '/store' ? 2.5 : 2} /><span className="text-[9px] font-black uppercase tracking-widest">Tienda</span>
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default MainLayout;
