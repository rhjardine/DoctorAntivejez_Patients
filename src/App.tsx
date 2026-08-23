import React, { Suspense } from 'react';
import AppProviders from './providers/AppProviders';
import MainLayout from './components/MainLayout';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Loading Fallback (H30)
 */
const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#23bcef] border-t-transparent"></div>
  </div>
);

/**
 * App.tsx — Performance Optimized Entry Point
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <MainLayout>
          <Suspense fallback={<Loader />}>
            <AppRouter />
          </Suspense>
        </MainLayout>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
