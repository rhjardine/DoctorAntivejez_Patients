/**
 * Las cuatro fases de las TERAPIAS ANTIVEJEZ 4R.
 *
 * El texto de cada fase procede de la divulgación publicada por la propia
 * clínica (@doctorantivejez / @clinicadoctorantivejez). No se ha redactado
 * contenido clínico nuevo aquí: ni terapias, ni dosis, ni cifras de eficacia.
 * Si el médico quiere más detalle por fase —como el que ya existe en
 * Remoción—, debe aportarlo él. Ver ADR-007.
 *
 * Esta es la fuente única: la matriz de la pantalla de inicio, las vistas de
 * detalle y cualquier pantalla futura leen de aquí para que las cuatro fases no
 * se describan de dos maneras distintas en dos sitios distintos.
 */

export type Fase4R = 'removal' | 'revitalization' | 'regeneration' | 'restoration';

export interface Terapia4R {
    id: Fase4R;
    /** Orden clínico de la secuencia: primero se remueve, al final se restaura. */
    orden: 1 | 2 | 3 | 4;
    nombre: string;
    /** Qué persigue la fase, en una línea. */
    proposito: string;
    /** Descripción publicada por la clínica. */
    descripcion: string;
    /** Modalidades que la clínica nombra para esta fase. */
    modalidades: string[];
}

export const TERAPIAS_4R: Record<Fase4R, Terapia4R> = {
    removal: {
        id: 'removal',
        orden: 1,
        nombre: 'Remoción',
        proposito: 'Eliminar lo que sobra antes de aportar nada.',
        descripcion:
            'Eliminación de toxinas, metales pesados, radicales libres, residuos ' +
            'metabólicos y ácidos orgánicos.',
        modalidades: ['Ayunos', 'Purgas', 'Hidroterapias', 'Sueros de quelación'],
    },
    revitalization: {
        id: 'revitalization',
        orden: 2,
        nombre: 'Revitalización',
        proposito: 'Devolver al metabolismo lo que necesita para volver a funcionar.',
        descripcion:
            'Aporte de los nutrientes y las moléculas necesarias para activar el ' +
            'metabolismo funcional.',
        modalidades: ['Sueros', 'Shots organotrópicos'],
    },
    regeneration: {
        id: 'regeneration',
        orden: 3,
        nombre: 'Regeneración',
        proposito: 'Reparar el tejido que el tiempo o la enfermedad dañaron.',
        descripcion:
            'Regeneración de los tejidos lesionados, envejecidos y enfermos.',
        modalidades: ['Exosomas de células madre de cordón umbilical'],
    },
    restoration: {
        id: 'restoration',
        orden: 4,
        nombre: 'Restauración',
        proposito: 'Sostener en el tiempo lo que las tres fases anteriores lograron.',
        descripcion:
            'Restauración de las Claves de la Longevidad 5A, ajustadas de manera ' +
            'personalizada.',
        modalidades: [
            'Alimentación',
            'Actividad física',
            'Asueto y sueño reparador',
            'Actitud mental y emocional',
            'Ambiente armónico',
        ],
    },
};

/** Las cuatro fases en orden clínico. */
export const FASES_4R: Terapia4R[] = Object.values(TERAPIAS_4R).sort(
    (a, b) => a.orden - b.orden,
);

/**
 * Aviso común a las cuatro fases. Las terapias 4R las indica y las administra
 * un médico: la app las explica, no las prescribe.
 */
export const AVISO_4R =
    'Las terapias antivejez 4R las indica y supervisa tu médico tratante. ' +
    'Esta sección explica en qué consiste cada fase; no sustituye su criterio ' +
    'ni constituye una indicación por sí misma.';
