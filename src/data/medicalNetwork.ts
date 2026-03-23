export interface NetworkDoctor {
    id: string;
    name: string;
    title: string;
    specialty: string;
    bio: string[];
    location: string;         // ciudad, país
    countries: string[];      // países donde atiende
    modality: ('presencial' | 'virtual' | 'ambas')[];
    languages: string[];
    availableForBooking: boolean;
    imageUrl: string;         // ruta en /public/equipo_med/
    isFounder?: boolean;      // Dr. Méndez = true
    accentColor: string;      // para card de presentación
    certifications: string[];
}

export const MEDICAL_NETWORK: NetworkDoctor[] = [
    {
        id: 'mendez-jc',
        name: 'Dr. Juan Carlos Méndez',
        title: 'MD Cirujano — Director y Fundador',
        specialty: 'Medicina Antienvejecimiento · Longevidad',
        bio: [
            'Médico cirujano graduado en la Universidad de Los Andes 1992.',
            'Miembro fundador de la Federación Iberoamericana de Medicina Antienvejecimiento (FISMAL).',
            'Especialista egresado de A4M, UNAM y Universidad de Sevilla.',
            'Director del Centro Médico y Academia ALMA — presencia en 5 países.'
        ],
        location: 'Caracas, Venezuela',
        countries: ['Venezuela', 'Colombia', 'Panamá', 'Estados Unidos'],
        modality: ['presencial', 'virtual'],
        languages: ['Español', 'Inglés'],
        availableForBooking: true,
        imageUrl: '/equipo_med/Dr_Juan_Mendez.png',
        isFounder: true,
        accentColor: '#23BCEF',
        certifications: ['A4M', 'UNAM', 'Universidad de Sevilla', 'FISMAL']
    },
    {
        id: 'rojas-z',
        name: 'Dra. Zuraida Rojas',
        title: 'MD Anestesióloga — Medicina Regenerativa',
        specialty: 'Medicina Regenerativa · Dolor · Antienvejecimiento',
        bio: [
            'MD Cirujano (UDO). Anestesióloga y especialista en Antienvejecimiento (UCV/UCLA).',
            'MSc. Medicina del Dolor, Regenerativa y Bioreguladora (ULA/IMEDAR).',
            'Docente adjunto del Postgrado de Anestesiología (UCV).',
            'Miembro referente internacional SISDET Colombia.'
        ],
        location: 'Caracas, Venezuela',
        countries: ['Venezuela', 'Colombia'],
        modality: ['presencial', 'virtual'],
        languages: ['Español'],
        availableForBooking: true,
        imageUrl: '/equipo_med/Dra_ZuraidaR.png',
        accentColor: '#FFA726',
        certifications: ['UCV', 'UCLA', 'IMEDAR', 'SISDET']
    },
    {
        id: 'medina-s',
        name: 'Dra. Saraí Medina',
        title: 'MD Cirujano — Salud Ocupacional e Integrativa',
        specialty: 'Medicina Integrativa · Salud Ocupacional · Longevidad',
        bio: [
            'MD Cirujano (UCV). Formación en Medicina Antienvejecimiento con CMA Doctor Antivejez.',
            'Diplomados en Medicina Integrativa y Salud Ocupacional.',
            'Especialización en atención primaria y medicina preventiva personalizada.'
        ],
        location: 'Caracas, Venezuela',
        countries: ['Venezuela'],
        modality: ['presencial', 'virtual'],
        languages: ['Español'],
        availableForBooking: true,
        imageUrl: '/equipo_med/Dra_SaraiMedina.png',
        accentColor: '#23BCEF',
        certifications: ['UCV', 'CMA ALMA']
    },
    {
        // PLACEHOLDER — reemplazar con médico real cuando esté disponible
        id: 'medico-colombia-01',
        name: 'Dr. Especialista Colombia',
        title: 'MD — Medicina Preventiva y Antienvejecimiento',
        specialty: 'Medicina Preventiva · Longevidad · Nutrigenómica',
        bio: [
            'Médico certificado por la Academia ALMA en medicina antienvejecimiento.',
            'Especialización en nutrigenómica y protocolos de optimización metabólica.',
            'Atención presencial en Colombia y virtual para toda Latinoamérica.'
        ],
        location: 'Bogotá, Colombia',
        countries: ['Colombia', 'Ecuador', 'Panamá'],
        modality: ['presencial', 'virtual'],
        languages: ['Español'],
        availableForBooking: false,  // false hasta confirmar incorporación
        imageUrl: '/equipo_med/placeholder_doctor.png',
        accentColor: '#4CAF50',
        certifications: ['ALMA']
    },
    {
        // PLACEHOLDER — reemplazar con médico real cuando esté disponible
        id: 'medico-panama-01',
        name: 'Dra. Especialista Panamá',
        title: 'MD — Medicina Regenerativa y Longevidad',
        specialty: 'Medicina Regenerativa · Terapias Celulares · Longevidad',
        bio: [
            'Médico certificada por ALMA en medicina antienvejecimiento y regenerativa.',
            'Experiencia en terapias celulares y protocolos de optimización hormonal.',
            'Atención a pacientes de la diáspora latinoamericana y clientela internacional.'
        ],
        location: 'Ciudad de Panamá, Panamá',
        countries: ['Panamá', 'Estados Unidos'],
        modality: ['presencial', 'virtual'],
        languages: ['Español', 'Inglés'],
        availableForBooking: false,  // false hasta confirmar incorporación
        imageUrl: '/equipo_med/placeholder_doctora.png',
        accentColor: '#4CAF50',
        certifications: ['ALMA']
    },
];

// Helper para filtrar por país
export function getDoctorsByCountry(country: string): NetworkDoctor[] {
    return MEDICAL_NETWORK.filter(d =>
        d.countries.includes(country) && d.availableForBooking
    );
}

// Helper para obtener países disponibles
export function getAvailableCountries(): string[] {
    const countries = new Set<string>();
    MEDICAL_NETWORK.forEach(d => d.countries.forEach(c => countries.add(c)));
    return Array.from(countries).sort();
}
