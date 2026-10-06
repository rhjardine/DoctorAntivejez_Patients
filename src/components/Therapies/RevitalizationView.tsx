import React from 'react';
import { Flame } from 'lucide-react';
import Phase4RView from './Phase4RView';
import { TERAPIAS_4R } from '../../config/therapies4R';

/** Fase 2 de las 4R: Revitalización. Contenido en `config/therapies4R.ts`. */
const RevitalizationView: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <Phase4RView
        fase={TERAPIAS_4R.revitalization}
        acento="#FFA726"
        fondo="#9a4a12"
        icono={<Flame size={14} />}
        onBack={onBack}
    />
);

export default RevitalizationView;
