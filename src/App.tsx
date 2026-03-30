import React from 'react';
import AppProviders from './providers/AppProviders';
import MainLayout from './components/MainLayout';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * App.tsx — Minimal entry point
 * Decoupled monolith: Providers, Layout, and Router are now separate modules (Task 1.3).
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
