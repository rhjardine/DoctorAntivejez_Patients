import { PatientProtocol, PatientGuideResponse, NutrigenomicPlan } from '../types';
import { authService } from './authService';
import apiClient from './apiClient';

const PROTOCOL_STORAGE_KEY = 'rejuvenate_protocol_cache';
const NUTRITION_STORAGE_KEY = 'rejuvenate_nutrition_cache';

export const ProtocolService = {
  fetchActiveProtocol: async (patientId: string): Promise<PatientProtocol[]> => {
    try {
      const profile = await ProtocolService.getMyProfile();
      if (profile && profile.guides && profile.guides.length > 0) {
        const guide = profile.guides[0]; // Latest guide
        const selections = guide.selections; // JSON

        if (!selections) return [];

        const items: PatientProtocol[] = [];
        Object.keys(selections).forEach(category => {
          const categoryItems = selections[category];
          if (Array.isArray(categoryItems)) {
            categoryItems.forEach((item: any) => {
              items.push({
                id: item.id || Math.random().toString(36).substr(2, 9),
                category: category,
                itemName: item.name,
                dose: item.dose || '',
                schedule: item.schedule || '',
                observations: item.observations || '',
                status: item.status || 'pending',
                timeSlot: item.timeSlot || 'ANYTIME',
                prescribedAt: guide.createdAt,
                updatedAt: guide.updatedAt
              });
            });
          }
        });
        return items;
      }

      // Fallback to legacy endpoint if no profile guide found
      const response = await apiClient.get(`/patients/${patientId}/guide`);
      const data: PatientGuideResponse = response.data;
      if (data?.items) {
        return data.items;
      }
      return [];
    } catch (error) {
      console.error("Error fetching protocol:", error);
      const cached = localStorage.getItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`);
      return cached ? JSON.parse(cached) : [];
    }
  },

  fetchNutrigenomicPlan: async (patientId: string): Promise<NutrigenomicPlan | null> => {
    try {
      const profile = await ProtocolService.getMyProfile();

      if (!profile || !profile.foodPlans || profile.foodPlans.length === 0) {
        return null;
      }

      const foodPlan = profile.foodPlans[0];
      const foods: any[] = [];

      if (foodPlan.items && Array.isArray(foodPlan.items)) {
        foodPlan.items.forEach((item: any) => {
          foods.push({
            id: item.id,
            name: item.name,
            category: 'General', // Default as schema doesn't have category
            mealTypes: [item.mealType], // Map single mealType to array
            isClinicalPriority: false,
            notes: ''
          });
        });
      }

      return {
        bloodType: profile.bloodType as any,
        dietTypes: profile.selectedDiets || [],
        forbidden: [], // Backend doesn't provide this yet
        foods: foods,
        updatedAt: foodPlan.updatedAt
      };
    } catch (error) {
      console.error("Error fetching nutrition plan:", error);
      const cached = localStorage.getItem(`${NUTRITION_STORAGE_KEY}_${patientId}`);
      return cached ? JSON.parse(cached) : null;
    }
  },

  updateItemStatus: async (patientId: string, itemId: string, status: 'pending' | 'completed'): Promise<boolean> => {
    try {
      const response = await apiClient.patch(`/protocols/${itemId}/status`, { status });
      if (response.status === 200 || response.status === 204) {
        const cachedData = localStorage.getItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`);
        if (cachedData) {
          const items: PatientProtocol[] = JSON.parse(cachedData);
          const updatedItems = items.map(item => item.id === itemId ? { ...item, status } : item);
          localStorage.setItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`, JSON.stringify(updatedItems));
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  getMyProfile: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/mobile-profile');
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }
};

