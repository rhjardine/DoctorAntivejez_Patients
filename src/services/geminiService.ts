import axios from 'axios';
import { useProfileStore } from '../store/useProfileStore';

// URL del Backend Proxy
// URL del Backend Proxy
const BACKEND_URL = import.meta.env.DEV
  ? '/api/vcoach-chat'
  : 'https://doctor-antivejez-web.onrender.com/vcoach-chat-v1';

const VISION_API_URL = import.meta.env.DEV
  ? '/api/vision-v1'
  : 'https://doctor-antivejez-web.onrender.com/api/vision-v1';

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

export const sendMessageToVCoach = async (message: string, chatHistory: any[] = []) => {
  const profile = useProfileStore.getState().profileData;

  const patientContext = {
    name: profile?.firstName || "Richard",
    chronoAge: profile?.chronologicalAge || 51,
    bioAge: profile?.biologicalAge || 45,
    gap: (profile?.chronologicalAge || 51) - (profile?.biologicalAge || 45),
    bloodType: profile?.bloodType || "A+"
  };

  try {
    const response = await axios.post(BACKEND_URL, {
      message,
      history: chatHistory,
      patientContext
    });

    return response.data.text;
  } catch (error) {
    console.error("🔥 Error al conectar con el VCoach:", error);
    throw new Error("No pudimos conectar con tu VCoach. Intenta de nuevo.");
  }
};

export const startChatSession = async (context?: any) => {
  // Reset or init logic if needed
  return true;
};

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  try {
    const response = await axios.post(VISION_API_URL, {
      imageBase64: base64Image
    });
    return response.data;
  } catch (error) {
    console.error("Vision AI Error:", error);
    throw new Error("Error al analizar la imagen. Intenta nuevamente.");
  }
};