import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExitConfirmModalProps {
    isOpen: boolean;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
    isOpen,
    message,
    onConfirm,
    onCancel
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-[#1a2d52] border border-white/10 rounded-[24px] p-6 w-full max-w-[320px] shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={28} className="text-[#FFA726]" />
                            </div>

                            <h3 className="text-white text-lg font-bold">¿Salir del test?</h3>
                            <p className="text-white/70 text-[13px] leading-relaxed mt-2 px-1">
                                {message || "Perderás las respuestas que has registrado hasta ahora."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={onCancel}
                                className="w-full bg-[#23BCEF] text-[#293B64] font-black py-3.5 rounded-full text-sm shadow-lg shadow-[#23BCEF]/10 active:scale-95 transition-transform"
                            >
                                Continuar test
                            </button>
                            <button
                                onClick={onConfirm}
                                className="w-full bg-transparent border border-white/20 text-white/70 py-3.5 rounded-full text-sm font-semibold active:scale-95 transition-transform"
                            >
                                Salir
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ExitConfirmModal;
