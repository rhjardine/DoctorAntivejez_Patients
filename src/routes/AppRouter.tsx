import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { AlertCircle } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. RUTAS PÚBLICAS (Lazy Loaded - Landing y Funnel de Ventas)
// ----------------------------------------------------------------------
const LandingPublica = React.lazy(() => import('../pages/public/LandingPublicaPage'));
const TestAntivejez = React.lazy(() => import('../pages/public/TestAntivejezPage'));
const AgeBotFacial = React.lazy(() => import('../pages/public/AgeBotFacialPage'));
const ResultadoScore = React.lazy(() => import('../pages/public/ResultadoScorePage'));
const ConsultaExploratoria = React.lazy(() => import('../pages/public/ConsultaExploratoriaPage'));
const MedicalNetwork = React.lazy(() => import('../pages/public/MedicalNetworkPage'));
const TestsSelector = React.lazy(() => import('../pages/public/TestsSelectorPage'));
const UniversalEntry = React.lazy(() => import('../pages/public/UniversalEntry'));

// ----------------------------------------------------------------------
// 2. RUTAS PRIVADAS (Pacientes Registrados)
// ----------------------------------------------------------------------
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
const WelcomePage = React.lazy(() => import('../pages/WelcomePage'));
const PatientGuidePage = React.lazy(() => import('../pages/PatientGuidePage'));
const ChatPage = React.lazy(() => import('../pages/ChatPage'));
const AchievementsPage = React.lazy(() => import('../pages/AchievementsPage'));
const StorePage = React.lazy(() => import('../pages/StorePage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const BiometricsPage = React.lazy(() => import('../pages/BiometricsPage'));
const BiomicsPage = React.lazy(() => import('../pages/BiomicsPage'));

// ----------------------------------------------------------------------
// 3. VISTAS DE DETALLE (Componentes Privados)
// ----------------------------------------------------------------------
const NutritionView = React.lazy(() => import('../components/NutritionView'));
const DoctorNutritionPlanView = React.lazy(() => import('../components/DoctorNutritionPlanView'));
const AttitudeView = React.lazy(() => import('../components/AttitudeView'));
const ActivityView = React.lazy(() => import('../components/ActivityView'));
const EnvironmentView = React.lazy(() => import('../components/EnvironmentView'));
const RestView = React.lazy(() => import('../components/RestView'));
const RestorationView = React.lazy(() => import('../components/Therapies/RestorationView'));
const AboutView = React.lazy(() => import('../components/AboutView'));
const MedicalTeamView = React.lazy(() => import('../components/MedicalTeamView'));
const UsageGuideView = React.lazy(() => import('../components/UsageGuideView'));
const ConsultationHistoryView = React.lazy(() => import('../components/ConsultationHistoryView'));
const BioPaseView = React.lazy(() => import('../components/BioPaseView'));

// ----------------------------------------------------------------------
// MIDDLEWARE DE SEGURIDAD
// ----------------------------------------------------------------------
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, isAuthenticated, logout } = useAuthStore();

    // Validación estricta: Si no hay sesión ni autenticación, expulsa al usuario al login
    if (!session && !isAuthenticated) {
        return <Navigate to="/acceso" replace />;
    }

    // Redirección Onboarding
    // Si el usuario está autenticado, no completó el onboarding y no está ya en la ruta /welcome
    if (session && (session as any).onboardingCompleted === false && window.location.pathname !== '/welcome') {
        return <Navigate to="/welcome" replace />;
    }

    if (session && session.role && session.role !== 'PATIENT') {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-[rgb(41,59,100)] px-6">
                <div className="bg-white/10 p-6 rounded-2xl text-center space-y-4 max-w-sm border border-red-500/30">
                    <AlertCircle size={48} className="text-red-400 mx-auto" />
                    <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
                    <p className="text-cyan-100 text-sm">
                        Acceso denegado. Utilice el portal médico web.
                    </p>
                    <button 
                        onClick={() => logout()}
                        className="mt-4 w-full bg-cyan-500 text-[#0f172a] py-3 rounded-xl font-bold active:scale-95 transition-all"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// ----------------------------------------------------------------------
// INDICADOR DE CARGA (Para evitar la pantalla en blanco de React.lazy)
// ----------------------------------------------------------------------
const RouteLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-clinical-bg">
        <div className="flex flex-col items-center gap-4">
            {/* Usamos el color cyan del tema clínico para coherencia visual */}
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-clinical-cyan"></div>
            <p className="text-sm font-medium text-clinical-slate animate-pulse">Cargando...</p>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// ENRUTADOR PRINCIPAL
// ----------------------------------------------------------------------
const AppRouter: React.FC = () => {
    const navigate = useNavigate();
    const { session } = useAuthStore();
    const { toggleClinicalInfo } = useUIStore();

    return (
        /* El Suspense es CRÍTICO. Sin él, React 19 crasheará al usar lazy() */
        <Suspense fallback={<RouteLoader />}>
            <Routes>
                {/* Autenticación */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/acceso" element={<UniversalEntry />} />

                {/* Rutas Públicas (Marketing / Funnel) */}
                <Route path="/longevidad" element={<LandingPublica />} />
                <Route path="/longevidad-tests" element={<TestsSelector />} />
                <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
                <Route path="/test" element={<TestAntivejez />} />
                <Route path="/agebot" element={<AgeBotFacial />} />
                <Route path="/resultado" element={<ResultadoScore />} />
                <Route path="/consulta" element={<ConsultaExploratoria />} />
                <Route path="/medicos" element={<MedicalNetwork />} />

                {/* Rutas Privadas Principales */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/guide" element={<ProtectedRoute><PatientGuidePage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/biomics" element={<ProtectedRoute><BiomicsPage /></ProtectedRoute>} />
                <Route path="/biometrics" element={<ProtectedRoute><BiometricsPage /></ProtectedRoute>} />

                {/* Rutas Privadas de Detalle */}
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
                <Route path="/history" element={<ProtectedRoute><ConsultationHistoryView onBack={() => navigate(-1)} onInfoPress={() => toggleClinicalInfo(true)} /></ProtectedRoute>} />
                <Route path="/biopase" element={<ProtectedRoute><BioPaseView patientId={session?.id || ''} onRefresh={async () => { }} onBack={() => navigate(-1)} /></ProtectedRoute>} />

                {/* Fallback 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;