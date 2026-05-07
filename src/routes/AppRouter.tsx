import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

// Lazy-loaded public pages (growth engine — no auth required)
const LandingPublica = React.lazy(() => import('../pages/public/LandingPublicaPage'));
const TestAntivejez = React.lazy(() => import('../pages/public/TestAntivejezPage'));
const AgeBotFacial = React.lazy(() => import('../pages/public/AgeBotFacialPage'));
const ResultadoScore = React.lazy(() => import('../pages/public/ResultadoScorePage'));
const ConsultaExploratoria = React.lazy(() => import('../pages/public/ConsultaExploratoriaPage'));
const MedicalNetwork = React.lazy(() => import('../pages/public/MedicalNetworkPage'));
const TestsSelector = React.lazy(() => import('../pages/public/TestsSelectorPage'));
const UniversalEntry = React.lazy(() => import('../pages/public/UniversalEntry'));

// Private pages
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
const PatientGuidePage = React.lazy(() => import('../pages/PatientGuidePage'));
const ChatPage = React.lazy(() => import('../pages/ChatPage'));
const AchievementsPage = React.lazy(() => import('../pages/AchievementsPage'));
const StorePage = React.lazy(() => import('../pages/StorePage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const BiometricsPage = React.lazy(() => import('../pages/BiometricsPage'));
const BiomicsPage = React.lazy(() => import('../pages/BiomicsPage'));

// Private component views
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuthStore();
    if (!session) return <Navigate to="/acceso" replace />;
    return <>{children}</>;
};

const AppRouter: React.FC = () => {
    const navigate = useNavigate();
    const { session } = useAuthStore();
    const { toggleClinicalInfo } = useUIStore();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected private app routes */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><PatientGuidePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/biomics" element={<ProtectedRoute><BiomicsPage /></ProtectedRoute>} />
            <Route path="/biometrics" element={<ProtectedRoute><BiometricsPage /></ProtectedRoute>} />

            {/* Detail views */}
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

            {/* Public entry + growth engine routes — no auth required */}
            <Route path="/acceso" element={<UniversalEntry />} />
            <Route path="/longevidad" element={<LandingPublica />} />
            <Route path="/longevidad-tests" element={<TestsSelector />} />
            <Route path="/welcome" element={<Navigate to="/acceso" replace />} />
            <Route path="/test" element={<TestAntivejez />} />
            <Route path="/agebot" element={<AgeBotFacial />} />
            <Route path="/resultado" element={<ResultadoScore />} />
            <Route path="/consulta" element={<ConsultaExploratoria />} />
            <Route path="/medicos" element={<MedicalNetwork />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;
