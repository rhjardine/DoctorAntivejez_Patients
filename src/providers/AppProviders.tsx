import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen" style={{ background: '#293B64' }}>
        <div className="w-8 h-8 border-2 border-[#23BCEF] border-t-transparent rounded-full animate-spin" />
    </div>
);

/**
 * AppProviders wraps the entire app in global providers.
 * Add new providers here (Theme, i18n, Analytics, etc.) without touching App.tsx.
 */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
                {children}
            </Suspense>
        </BrowserRouter>
    );
};

export default AppProviders;
