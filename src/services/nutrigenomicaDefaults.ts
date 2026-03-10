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
};
