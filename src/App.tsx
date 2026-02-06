import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Trophy, RefreshCw, Menu, ChevronLeft, LayoutDashboard,
  Store, LogOut, Dna, WifiOff
} from 'lucide-react';
import { MainTab } from './types';
import { useAuthStore } from './store/useAuthStore';
import { useUIStore } from './store/useUIStore';
import { useProfileStore } from './store/useProfileStore';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PatientGuidePage from './pages/PatientGuidePage';
import ChatPage from './pages/ChatPage';
import AchievementsPage from './pages/AchievementsPage';
import StorePage from './pages/StorePage';
import SettingsPage from './pages/SettingsPage';
import BiometricsPage from './pages/BiometricsPage';

// Components (Views mapped to routes)
import NutritionView from './components/NutritionView';
import AttitudeView from './components/AttitudeView';
import ActivityView from './components/ActivityView';
import EnvironmentView from './components/EnvironmentView';
import RestView from './components/RestView';
import AboutView from './components/AboutView';
import MedicalTeamView from './components/MedicalTeamView';
import UsageGuideView from './components/UsageGuideView';
import BiometricsView from './components/BiometricsView';
import ConsultationHistoryView from './components/ConsultationHistoryView';
import BioPaseView from './components/BioPaseView';
import ClinicalInfoModal from './components/ClinicalInfoModal';
import PrivacyConsentModal from './components/PrivacyConsentModal';
import Drawer from './components/Drawer';
import { useReminders } from './hooks/useReminders'; // We might need to refactor this hook later

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout, checkSession } = useAuthStore();
  const {
    isDrawerOpen, toggleDrawer,
    isClinicalInfoOpen, toggleClinicalInfo,
    isPrivacyConsentOpen, togglePrivacyConsent,
    currentMainTab, setMainTab
  } = useUIStore();
  const { forceRefresh, profileData } = useProfileStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Initialize session check
  useEffect(() => {
    checkSession();

    // SESSION HEARTBEAT: Clear PHI on tab close
    const handleBeforeUnload = () => {
      sessionStorage.clear();
      useProfileStore.getState().clearProfileData();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Monitor online/offline status
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
  const showHeaderFooter = session && !isLoginPage;
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
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        notificationControls={notificationControls}
      />
      <ClinicalInfoModal isOpen={isClinicalInfoOpen} onClose={() => toggleClinicalInfo(false)} />
      <PrivacyConsentModal isOpen={isPrivacyConsentOpen} onAccept={(() => { togglePrivacyConsent(false); }) as any} />

      {showHeaderFooter && (
        <header className="bg-darkBlue text-white pt-safe-top z-30 shadow-sm shrink-0">
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
            <div className="flex bg-primary">
              <button onClick={() => setMainTab(MainTab.KEYS_5A)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.KEYS_5A ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <Shield size={12} /> Claves 5A
              </button>
              <button onClick={() => setMainTab(MainTab.THERAPIES_4R)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.THERAPIES_4R ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <RefreshCw size={12} /> Terapias 4R
              </button>
              <button onClick={() => setMainTab(MainTab.CHALLENGE)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.CHALLENGE ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <Trophy size={12} /> Reto
              </button>
            </div>
          )}
        </header>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F8FAFC]">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/guide" element={<ProtectedRoute><PatientGuidePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Detail Views */}
          <Route path="/nutrition" element={<ProtectedRoute><NutritionView /></ProtectedRoute>} />
          <Route path="/attitude" element={<ProtectedRoute><AttitudeView /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityView /></ProtectedRoute>} />
          <Route path="/environment" element={<ProtectedRoute><EnvironmentView /></ProtectedRoute>} />
          <Route path="/rest" element={<ProtectedRoute><RestView /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><AboutView onNavigateToTeam={() => navigate('/team')} onNavigateToGuide={() => navigate('/usage-guide')} /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><MedicalTeamView /></ProtectedRoute>} />
          <Route path="/usage-guide" element={<ProtectedRoute><UsageGuideView /></ProtectedRoute>} />
          <Route path="/biometrics" element={<ProtectedRoute><BiometricsPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ConsultationHistoryView onBack={() => navigate(-1)} onInfoPress={() => toggleClinicalInfo(true)} /></ProtectedRoute>} />
          <Route path="/biopase" element={<ProtectedRoute><BioPaseView patientId={session?.id || ''} onRefresh={async () => { }} onBack={() => navigate(-1)} /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showHeaderFooter && !isOnline && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-amber-400/50 animate-in fade-in slide-in-from-bottom-4">
            <WifiOff size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Modo Offline - Datos de {profileData?.fetchedAt ? new Date(profileData.fetchedAt).toLocaleDateString() : 'hoy'}
            </span>
          </div>
        </div>
      )}

      {showHeaderFooter && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-darkBlue border-t border-white/5 pb-safe-bottom shrink-0">
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
