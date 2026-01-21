import React from 'react';
import { ShoppingBag } from 'lucide-react';

const StorePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6">
                <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-black text-darkBlue uppercase tracking-tighter mb-4">Bio-Tienda Rejuvenate</h2>
            <p className="text-sm font-bold text-textMedium leading-relaxed max-w-xs">
                Próximamente: Accede a nutracéuticos de grado clínico y fórmulas exclusivas del Doctor Antivejez.
            </p>
        </div>
    );
};

export default StorePage;
