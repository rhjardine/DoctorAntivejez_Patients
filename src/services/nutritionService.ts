import { NutrigenomicPlan } from '../types';
import { useProfileStore } from '../store/useProfileStore';
import { buildNutrigenomicPlan } from './clinicalPayloadNormalizer';

export const nutritionService = {
  getSmartNutritionPlan: async (): Promise<NutrigenomicPlan> => {
    const profileData = useProfileStore.getState().profileData;
    const plan = buildNutrigenomicPlan(profileData);

    if (!plan) {
      throw new Error(
        'No hay un plan de nutrición nutrigenómica configurado por el médico.',
      );
    }

    return plan;
  },
};
