import { useProfileStore } from "../store/useProfileStore";
import { authService } from "./authService";

// URL del Backend Proxy
const BACKEND_URL = "https://doctor-antivejez-web.onrender.com/api/vcoach/chat";

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

let chatHistory: ChatMessage[] = [];

export const startChatSession = async () => {
  // Se reinicia el historial local al iniciar sesión
  chatHistory = [];
  return true;
};

// Helper fetch con retry logic
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay);
  }
}

export const sendMessageToVCoach = async (message: string): Promise<string> => {
  try {
    const profile = useProfileStore.getState().profileData;

    const patientContext = {
      name: profile?.firstName || authService.getCurrentUser()?.email?.split('@')[0] || "Richard",
      chronoAge: profile?.chronologicalAge || 51,
      bioAge: profile?.biologicalAge || 45,
      bloodType: profile?.bloodType || "A+"
    };

    // Usamos fetch con retry (max 2)
    const response = await fetchWithRetry(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history: chatHistory,
        patientContext
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Update local history
    chatHistory.push({ role: 'user', parts: [{ text: message }] });
    chatHistory.push({ role: 'model', parts: [{ text: data.text }] });

    return data.text;

  } catch (error) {
    console.error("🔥 [VCoach Service Error]:", error);
    return "Lo siento Richard, la conexión es inestable en este momento. Intenta de nuevo en unos segundos.";
  }
};

// Vision AI: Placeholder o Proxy futuro
export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  // Por ahora deshabilitado para evitar crash por falta de SDK
  console.warn("Vision AI requiere endpoint en backend.");
  throw new Error("Función de análisis de imagen en mantenimiento.");
};