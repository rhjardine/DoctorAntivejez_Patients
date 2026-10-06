import React from 'react';
import { Dna } from 'lucide-react';
import Phase4RView from './Phase4RView';
import { TERAPIAS_4R } from '../../config/therapies4R';

/** Fase 3 de las 4R: Regeneración. Contenido en `config/therapies4R.ts`. */
const RegenerationView: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <Phase4RView
        fase={TERAPIAS_4R.regeneration}
        acento="#23BCEF"
        fondo="#0d4f6b"
        icono={<Dna size={14} />}
        onBack={onBack}
    />
);

export default RegenerationView;
