import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Trophy, RefreshCw, Menu, ChevronLeft, LayoutDashboard,
  Store, LogOut, Dna, WifiOff
} from 'lucide-react';
import { MainTab } from './types';
import { useAuthStore } from './store/useAuthStore';
import { useUIStore } from './store/useUIStore';
import { useProfileStore } from './store/useProfileStore';

// Lazy-loaded public pages (growth engine — no auth required)
const LandingPublica = React.lazy(() => import('./pages/public/LandingPublicaPage'));
const TestAntivejez = React.lazy(() => import('./pages/public/TestAntivejezPage'));
const AgeBotFacial = React.lazy(() => import('./pages/public/AgeBotFacialPage'));
const ResultadoScore = React.lazy(() => import('./pages/public/ResultadoScorePage'));
const ConsultaExploratoria = React.lazy(() => import('./pages/public/ConsultaExploratoriaPage'));
const MedicalNetwork = React.lazy(() => import('./pages/public/MedicalNetworkPage'));
const TestsSelector = React.lazy(() => import('./pages/public/TestsSelectorPage'));

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PatientGuidePage from './pages/PatientGuidePage';
import ChatPage from './pages/ChatPage';
import AchievementsPage from './pages/AchievementsPage';
import StorePage from './pages/StorePage';
import SettingsPage from './pages/SettingsPage';
import BiometricsPage from './pages/BiometricsPage';
import BiomicsPage from './pages/BiomicsPage';

// Components (Views mapped to routes)
import NutritionView from './components/NutritionView';
import DoctorNutritionPlanView from './components/DoctorNutritionPlanView';
import AttitudeView from './components/AttitudeView';
import ActivityView from './components/ActivityView';
import EnvironmentView from './components/EnvironmentView';
import RestView from './components/RestView';
import RestorationView from './components/Therapies/RestorationView';
import AboutView from './components/AboutView';
import MedicalTeamView from './components/MedicalTeamView';
import UsageGuideView from './components/UsageGuideView';
import BiometricsView from './components/BiometricsView';
import ConsultationHistoryView from './components/ConsultationHistoryView';
import BioPaseView from './components/BioPaseView';
import ClinicalInfoModal from './components/ClinicalInfoModal';
import PrivacyConsentModal from './components/PrivacyConsentModal';
import Drawer from './components/Drawer';
import OnboardingModal, { ONBOARDING_KEY } from './components/OnboardingModal';
import OnboardingSlim from './components/OnboardingSlim';
import { useReminders } from './hooks/useReminders';

import { useDarkMode } from './hooks/useDarkMode';
import { useSyncQueue } from './hooks/useSyncQueue';
import { offlineQueue } from './services/offlineQueue';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  if (!session) {
    return <Navigate to="/longevidad" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout, checkSession } = useAuthStore();

  // ✅ ENHANCEMENT: Reset scroll on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ✅ ENHANCEMENT: Activate Dark Mode management
  useDarkMode();
  // ✅ ENHANCEMENT: Background Sync Queue Hook
  useSyncQueue();

  const {
    isDrawerOpen, toggleDrawer,
    isClinicalInfoOpen, toggleClinicalInfo,
    isPrivacyConsentOpen, togglePrivacyConsent,
    currentMainTab, setMainTab
  } = useUIStore();
  const { forceRefresh, profileData } = useProfileStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // SW & Offline Queue tracking
  const [pendingCount, setPendingCount] = React.useState(0);
  const [showUpdateBanner, setShowUpdateBanner] = React.useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Refresh count periodically while offline
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
      // Case A: SW already waiting when app loads
      if (registration.waiting) {
        setShowUpdateBanner(true);
      }
      // Case B: new SW found after app was open
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed'
            && registration.waiting) {
            setShowUpdateBanner(true);
          }
        });
      });
    });

    // Case C: SW took control (after user clicked Actualizar)
    navigator.serviceWorker.addEventListener(
      'controllerchange', () => {
        setShowUpdateBanner(false);
      }
    );
  }, []);

  // Initialize session check
  useEffect(() => {
    checkSession();

    // Show onboarding after first login
    if (session && !localStorage.getItem(ONBOARDING_KEY) && !localStorage.getItem('da_onboarding_slim_v1')) {
      setShowOnboarding(true);
    }

    // ✅ SESSION PERSISTENCE: Removed beforeunload listener that cleared
    // sessionStorage and profileData. We now rely on localStorage (via authService)
    // and Zustand persist (via profileStore) for a seamless refresh experience.
  }, []);

  // Show onboarding when session becomes available for the first time
  React.useEffect(() => {
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

  // Mock reminders hook usage - ideally this should be in a context or global listener
  // Passing empty array for now as we don't have items in App scope anymore
  // This needs to be moved to a proper global manager in Phase 5
  const notificationControls = useReminders([]);

  const isLoginPage = location.pathname === '/login';
  const PUBLIC_ROUTES = ['/longevidad', '/longevidad-tests', '/test', '/agebot', '/resultado', '/consulta', '/medicos'];
  const isPublicRoute = PUBLIC_ROUTES.some(r => location.pathname.startsWith(r));
  const showHeaderFooter = session && !isLoginPage && !isPublicRoute;
  const isHome = location.pathname === '/';
  const isDetailView = !isHome && !['/chat', '/achievements', '/store'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    forceRefresh(); // Clear cache
    setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback
    window.location.reload(); // Force full refresh
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans">
      {showOnboarding && session && (
        localStorage.getItem('da_funnel_conversion')
          ? <OnboardingSlim onComplete={() => setShowOnboarding(false)} />
          : <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        notificationControls={notificationControls}
      />
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
              <button
                onClick={handleRefresh}
                className={`p-1 text-white/70 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''
                  }`}
                disabled={isRefreshing}
              >
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

      <main className={`flex-1 overflow-y-auto no-scrollbar relative ${isPublicRoute ? '' : 'bg-[var(--background)]'}`} style={{ paddingBottom: isPublicRoute ? '0' : 'max(80px, env(safe-area-inset-bottom, 0px) + 64px)' }}>
        <Suspense fallback={<div className="flex items-center justify-center h-screen" style={{ background: '#293B64' }}><div className="w-8 h-8 border-2 border-[#23BCEF] border-t-transparent rounded-full animate-spin" /></div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><PatientGuidePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/biomics" element={<ProtectedRoute><BiomicsPage /></ProtectedRoute>} />

            {/* Detail Views */}
            <Route path="/nutrition" element={<ProtectedRoute><NutritionView /></ProtectedRoute>} />
            <Route path="/mi-guia/alimentacion" element={<ProtectedRoute><DoctorNutritionPlanView onBack={() => navigate(-1)} /></ProtectedRoute>} />
            <Route path="/attitude" element={<ProtectedRoute><AttitudeView /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><ActivityView /></ProtectedRoute>} />
            <Route path="/environment" element={<ProtectedRoute><EnvironmentView /></ProtectedRoute>} />
            <Route path="/rest" element={<ProtectedRoute><RestView /></ProtectedRoute>} />
            <Route path="/restoration" element={<ProtectedRoute><RestorationView onBack={() => navigate(-1)} /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><AboutView onNavigateToTeam={() => navigate('/team')} onNavigateToGuide={() => navigate('/usage-guide')} /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><MedicalTeamView /></ProtectedRoute>} />
            <Route path="/usage-guide" element={<ProtectedRoute><UsageGuideView /></ProtectedRoute>} />
            <Route path="/biometrics" element={<ProtectedRoute><BiometricsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ConsultationHistoryView onBack={() => navigate(-1)} onInfoPress={() => toggleClinicalInfo(true)} /></ProtectedRoute>} />
            <Route path="/biopase" element={<ProtectedRoute><BioPaseView patientId={session?.id || ''} onRefresh={async () => { }} onBack={() => navigate(-1)} /></ProtectedRoute>} />

            {/* Public growth engine routes — no auth required */}
            <Route path="/longevidad" element={<LandingPublica />} />
            <Route path="/longevidad-tests" element={<TestsSelector />} />
            <Route path="/welcome" element={<Navigate to="/longevidad" replace />} />
            <Route path="/test" element={<TestAntivejez />} />
            <Route path="/agebot" element={<AgeBotFacial />} />
            <Route path="/resultado" element={<ResultadoScore />} />
            <Route path="/consulta" element={<ConsultaExploratoria />} />
            <Route path="/medicos" element={<MedicalNetwork />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showHeaderFooter && !isOnline && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-amber-400/50 animate-in fade-in slide-in-from-bottom-4">
            <WifiOff size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-center">
              {pendingCount > 0
                ? `Modo Offline · ${pendingCount} registro(s) pendiente(s)`
                : `Modo Offline · Datos de ${profileData?.fetchedAt ? new Date(profileData.fetchedAt).toLocaleDateString() : 'hoy'}`
              }
            </span>
          </div>
        </div>
      )}

      {showUpdateBanner && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60]">
          <div className="bg-darkBlue text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Nueva versión disponible
            </span>
            <button
              onClick={() => {
                navigator.serviceWorker.ready.then(reg => {
                  reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
                });
                // Clear manifest + workbox caches to force fresh icon on reinstall
                if ('caches' in window) {
                  caches.keys().then(keys =>
                    keys.forEach(k => {
                      if (k.includes('manifest') || k.includes('workbox')) caches.delete(k);
                    })
                  );
                }
                setTimeout(() => window.location.reload(), 300);
              }}
              className="text-primary text-[10px] font-black uppercase underline hover:text-white transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      {showHeaderFooter && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--dark-navy)] border-t border-white/5 pb-safe-bottom shrink-0">
          <div className="flex justify-around items-center py-3.5 px-4">
            <button
              onClick={() => {
                navigate('/');
                setMainTab(MainTab.KEYS_5A);
                toggleDrawer(false);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${isHome ? 'text-white scale-110' : 'text-white/40'}`}
            >
              <LayoutDashboard size={24} strokeWidth={isHome ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
            </button>

            <button
              onClick={() => navigate('/achievements')}
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/achievements' ? 'text-white scale-110' : 'text-white/40'}`}
            >
              <Trophy size={24} strokeWidth={location.pathname === '/achievements' ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">Logros</span>
            </button>

            <button
              onClick={() => navigate('/biomics')}
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/biomics' ? 'text-white scale-110' : 'text-white/40'}`}
            >
              <Dna size={24} strokeWidth={location.pathname === '/biomics' ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">Biomics</span>
            </button>

            <button
              onClick={() => navigate('/store')}
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/store' ? 'text-white scale-110' : 'text-white/40'}`}
            >
              <Store size={24} strokeWidth={location.pathname === '/store' ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">Tienda</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
