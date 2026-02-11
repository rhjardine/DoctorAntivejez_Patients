import apiClient from './apiClient';
import { NutrigenomicPlan, NutrigenomicFood, MealType, BloodType, DietType } from '../types';

interface BackendFoodItem {
    id: string;
    name: string;
    mealType: 'DESAYUNO' | 'ALMUERZO' | 'CENA' | 'MERIENDAS_POSTRES';
    category: 'BENEFICIAL' | 'NEUTRAL' | 'AVOID';
    bloodTypeGroup: string;
    isDefault: boolean;
}

interface BackendResponse {
    success: boolean;
    bloodType: string;
    compatibilityGroup: string;
    items: BackendFoodItem[];
}

const MEAL_MAP: Record<string, MealType> = {
    'DESAYUNO': 'BREAKFAST',
    'ALMUERZO': 'LUNCH',
    'CENA': 'DINNER',
    'MERIENDAS_POSTRES': 'SNACK'
};

const CATEGORY_MAP: Record<string, string> = {
    'BENEFICIAL': 'Beneficios',
    'NEUTRAL': 'Neutros',
    'AVOID': 'Evitar'
};

export const nutritionService = {
    getSmartNutritionPlan: async (): Promise<NutrigenomicPlan> => {
        // Call the new endpoint
        const response = await apiClient.get<BackendResponse>('/mobile-nutrition-v1');
        const data = response.data;

        if (!data.success) {
            throw new Error("Failed to load nutrition plan");
        }

        // Map Backend Items to Frontend Structure
        const foods: NutrigenomicFood[] = data.items.map(item => ({
            id: item.id,
            name: item.name,
            // Map category to display string (Beneficios, etc)
            category: CATEGORY_MAP[item.category] || 'General',
            // Map single mealType to array (frontend expects array)
            mealTypes: [MEAL_MAP[item.mealType] || 'SNACK'],
            isClinicalPriority: item.category === 'BENEFICIAL', // Auto-flag beneficial as priority for UI highlight
            notes: item.category === 'AVOID' ? 'No recomendado para tu grupo sanguíneo' : undefined
        }));

        // Construct the plan object
        return {
            bloodType: data.bloodType as BloodType || 'O',
            dietTypes: ['METABOLIC'], // Default to metabolic for now
            forbidden: [], // Handled by categorization now (AVOID group)
            foods: foods,
            updatedAt: new Date().toISOString()
        };
    }
};
