export const DEFAULTS_O_B = {
    grupoSanguineo: 'O_B' as const,
    desayuno: [
        'Pan sin gluten', 'Cereales de trigo sarraceno o avena sin gluten', 'Creps de yuca',
        'Suero de leche (Whey protein)', 'Huevo revuelto con vegetales y queso de cabra',
        'Huevo escalfado con verduras al vapor', 'Huevo duro cocido con tiras de queso de cabra',
        'Omelette de clara de huevo con champiñones', 'Infusiones o café sin azúcar',
    ],
    almuerzo: [
        'Carnes rojas o blancas', 'Ensaladas', 'Granos', 'Pasticho de berenjena con carne',
        'Tomate relleno con carne molida', 'Rissoto o ñoquis', 'Pizza de casabe con queso de cabra',
        'Kibbe con ensalada Fatush', 'Lomito con jojoticos chinos',
    ],
    cena: {
        comunes: ['Ensaladas de sardinas, salmón o mariscos', 'Sushi', 'Ceviche', 'Antipasto', 'Carpaccio',],
        especifico: 'Keto o Paleo',
    },
};

export const DEFAULTS_A_AB = {
    grupoSanguineo: 'A_AB' as const,
    desayuno: [
        'Cereales de trigo sarraceno o avena sin gluten', 'Tortilla de huevo con avena s/g',
        'Creps de avena s/g', 'Leche de soya o almendras', 'Infusiones o café sin azúcar',
    ],
    almuerzo: [
        'Carnes blancas', 'Ensaladas', 'Granos', 'Pastillo de berenjena con pollo',
        'Tomate relleno con pollo', 'Pasta sin gluten', 'Pizza de coliflor con queso de cabra',
        'Falafel con ensalada Tabulé de quinoa', 'Pollo a la naranja con ensalada budda',
    ],
    cena: {
        comunes: ['Ensaladas de sardinas, salmón o mariscos', 'Sushi', 'Ceviche', 'Antipasto', 'Carpaccio',],
        especifico: 'Vegano o Vegetariano',
    },
};

export const DEFAULTS_COMUNES = {
    meriendas: [
        'Gelatina de lámina o 1 cda de polvo sin sabor en infusión con stevia o limón (GELATE)',
        '7 Semillas: almendras, nueces, pistacho, merey, auyama tostada',
        'Batido de proteína: 1 cda de suero o ricotta sin sal, whey protein o soy protein',
        'Helado Vegano (leche de almendras o coco)', 'Tableta de Cacao Antivejez 100%',
    ],
    ensaladasLibres: [
        'Hojas verdes', 'Berenjenas', 'Calabacines', 'Pepinos', 'Tomates',
        'Pimentones', 'Brócoli', 'Champiñones', 'Alcachofas', 'Germinados', 'Espárragos', 'Rábanos',
    ],
    alimentosEvitar: [
        'Cochino y sus derivados, atún, pez espada, grasas, frituras, huevos fritos.',
        'Caseína: lácteos de vaca o búfala, parmesano.',
        'Enlatados con preservativos, refrescos, azúcar, edulcorantes, chucherías.',
        'Harinas refinadas y sus derivados, cereales refinados.',
        'Jugos naturales, papaya, mango, banana, melón, patilla, piña (máximo una vez por semana).',
        'Tubérculos.',
        'Gluten: trigo, avena, cebada, centeno integral.'
    ],
    sustitutos: [
        'Carnes a la plancha, sancocho o al horno.',
        'Huevos sancochados, revueltos o en agua.',
        'Quesos blancos, fresco o yogurt de cabra.',
        'Leches vegetales (soya, almendra, coco).',
        'Infusiones de plantas: malojillo, toronjil, té verde, café.',
        'Frutas frescas o secas, harinas integrales.',
        'Germinados, verduras frescas.',
        'Semillas tostadas: almendras, avellanas, nueces, merey, ajonjolí.',
        'Enlatados en agua o aceite. Suero o ricota sin sal.',
        'Lácteos de cabra, Pecorino o Manchego.',
        'Productos sin gluten: pan, maíz, fororo, arroz, yuca, plátano, papa, batata, granola, avena.'
    ],
    claves5a: [
        {
            clave: 'ALIMENTACIÓN Sana',
            icono: '🥗',
            items: [
                'Frutas de Bajo Índice Glicémico en el desayuno',
                'Ayuno Intermitente (2-3 veces por semana)',
                'Tomar 6-8 vasos de agua de limón',
                'Merienda a media mañana y media tarde'
            ],
        },
        {
            clave: 'ACTIVIDAD Física',
            icono: '🏃',
            items: [
                'Actividad física 3 a 6 veces por semana',
                'Cardiovascular en la mañana o tarde',
                'Musculación 10 minutos',
                'Frecuencia Cardíaca Controlada'
            ],
        },
        {
            clave: 'ASUETO Reparador',
            icono: '😴',
            items: [
                'Acostarse antes de las 10 PM',
                'Dormir de 6 a 8 horas',
                'Recrearse periódicamente'
            ],
        },
        {
            clave: 'ACTITUD Adecuada',
            icono: '🧘',
            items: [
                'Cultivar pensamientos positivos',
                'Gestión del estrés'
            ],
        },
        {
            clave: 'AMBIENTE Armónico',
            icono: '🏡',
            items: [
                'Ambiente familiar y laboral armónico',
                'Evitar estimulantes, licor o cigarrillo',
                'Socialización saludable'
            ],
        },
    ],
    terapias4r: [
        {
            nombre: 'Remoción',
            slogan: 'Elimina lo que te sobra',
            items: ['Oxidación', 'Acidez', 'Caramelización', 'Calcificación', 'Contaminación']
        },
        {
            nombre: 'Revitalización',
            slogan: 'Recupera lo que te hace falta',
            items: ['Sustratos', 'Minerales', 'Oligoelementos', 'Vitaminas']
        },
        {
            nombre: 'Regeneración',
            slogan: 'Revertir las lesiones',
            items: ['Terapia Celular', 'Factores Autólogos', 'Células Madre']
        },
        {
            nombre: 'Restauración',
            slogan: 'Mantente joven y saludable',
            items: ['Claves 5A Adaptadas', 'Longevidad Óptima']
        }
    ]
};
