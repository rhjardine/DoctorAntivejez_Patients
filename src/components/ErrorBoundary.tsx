import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Global Error Boundary (H25/HOTFIX)
 * 
 * Catches runtime errors across the React tree to prevent White Screen of Death.
 * Displays a stylized fallback UI with error details and recovery options.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
        // You could also log to Sentry here if not already handled
    }

    private handleReset = () => {
        // Clear potentially corrupted state
        sessionStorage.clear();
        // Redirect to home and reload
        window.location.assign('/?clear=1');
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 p-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-amber-100/50">
                            <AlertTriangle className="text-amber-500" size={40} />
                        </div>

                        <h1 className="text-2xl font-black text-[#1E293B] tracking-tight mb-3">
                            Algo salió mal
                        </h1>

                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            La aplicación encontró un error inesperado al intentar renderizar la vista. No te preocupes, tus datos están seguros.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100 overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detalles Técnicos</p>
                            <p className="text-[11px] font-mono text-amber-700 break-all leading-tight">
                                {this.state.error?.message || 'Error desconocido'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 py-4 px-4 bg-slate-100 text-[#1E293B] rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all active:scale-95"
                            >
                                <RefreshCw size={16} /> Reintentar
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 py-4 px-4 bg-[#23BCEF] text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 hover:opacity-90 transition-all active:scale-95"
                            >
                                <Home size={16} /> Reiniciar App
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] text-slate-400 font-medium">
                            Si el problema persiste, por favor contacte a soporte médico.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
