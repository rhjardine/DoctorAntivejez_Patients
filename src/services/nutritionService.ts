import { NutrigenomicPlan, NutrigenomicFood, MealType, BloodType, DietType } from '../types';
import { useProfileStore } from '../store/useProfileStore';
import { DEFAULTS_O_B, DEFAULTS_A_AB, DEFAULTS_COMUNES } from './nutrigenomicaDefaults';

export const nutritionService = {
    getSmartNutritionPlan: async (): Promise<NutrigenomicPlan> => {
        // En lugar de hacer Fetch, leer directamente de perfil que ya tiene la info.
        const profileData = useProfileStore.getState().profileData;
        const alimentacion = profileData?.alimentacion;

        if (!alimentacion || !alimentacion.enviada) {
            throw new Error("No hay un plan de nutrición nutrigenómica activo o el médico aún no lo ha sincronizado.");
        }

        const bloodGrpGroup = alimentacion.grupoSanguineo; // 'O_B' | 'A_AB'
        const defaults = bloodGrpGroup === 'A_AB' ? DEFAULTS_A_AB : DEFAULTS_O_B;

        const foods: NutrigenomicFood[] = [];
        let idCounter = 1;

        // Mapear Desayuno
        defaults.desayuno.forEach(item => {
            foods.push({
                id: `bf_${idCounter++}`,
                name: item,
                category: 'Beneficios',
                mealTypes: ['BREAKFAST'],
                isClinicalPriority: true
            });
        });

        // Mapear Almuerzo
        defaults.almuerzo.forEach(item => {
            foods.push({
                id: `l_${idCounter++}`,
                name: item,
                category: 'Beneficios',
                mealTypes: ['LUNCH'],
                isClinicalPriority: true
            });
        });

        // Mapear Cena
        defaults.cena.comunes.forEach(item => {
            foods.push({
                id: `d_${idCounter++}`,
                name: item,
                category: 'Beneficios',
                mealTypes: ['DINNER'],
                isClinicalPriority: true
            });
        });

        // Mapear Meriendas Comunes
        DEFAULTS_COMUNES.meriendas.forEach(item => {
            foods.push({
                id: `s_${idCounter++}`,
                name: item,
                category: 'Neutros',
                mealTypes: ['SNACK']
            });
        });

        // Mapear Ensaladas Libres como Neutras
        DEFAULTS_COMUNES.ensaladasLibres.forEach(item => {
            foods.push({
                id: `sl_${idCounter++}`,
                name: item,
                category: 'Neutros',
                mealTypes: ['LUNCH', 'DINNER']
            });
        });

        const dietTypes: DietType[] = [];
        if (alimentacion.tipoMetabolica) dietTypes.push('METABOLIC');
        if (alimentacion.tipoRenal) dietTypes.push('RENAL');
        if (alimentacion.tipoNino) dietTypes.push('STANDARD');
        // si no hay dietas específicas, asignar STANDARD al menos
        if (dietTypes.length === 0) dietTypes.push('STANDARD');

        // Extraer forbidden list desde defaults comunes
        const forbiddenItems = [...DEFAULTS_COMUNES.alimentosEvitar];

        return {
            bloodType: bloodGrpGroup === 'O_B' ? 'O' : 'A', // Mostrar representativo
            dietTypes: dietTypes,
            forbidden: forbiddenItems,
            foods: foods,
            updatedAt: alimentacion.enviadaAt || alimentacion.updatedAt || new Date().toISOString()
        };
    }
};
