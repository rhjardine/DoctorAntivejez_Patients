import { useProfileStore } from "../store/useProfileStore";
import { authService } from "./authService";

// URL del backend (Render)
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
  // Reset or load history logic if needed
  chatHistory = [];
  return true;
};

export const sendMessageToVCoach = async (message: string): Promise<string> => {
  try {
    const profile = useProfileStore.getState().profileData;

    const patientContext = {
      name: profile?.firstName || authService.getCurrentUser()?.email?.split('@')[0] || "Richard",
      chronoAge: profile?.chronologicalAge || 51,
      bioAge: profile?.biologicalAge || 45,
      bloodType: profile?.bloodType || "A+"
    };

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: Add authorization if the backend route requires it later
        // "Authorization": `Bearer ${authService.getSession()?.token}` 
      },
      body: JSON.stringify({
        message,
        history: chatHistory,
        patientContext
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Update local history
    chatHistory.push({ role: 'user', parts: [{ text: message }] });
    chatHistory.push({ role: 'model', parts: [{ text: data.text }] });

    return data.text;

  } catch (error) {
    console.error("🔥 [VCoach Proxy Error]:", error);
    return "Richard, mi conexión con el servidor central está inestable debido a restricciones regionales. Por favor reintenta.";
  }
};

// Scanner de Alimentos - Por ahora retornamos un mock o unimplemented si Vision también falla por región
// O idealmente deberíamos hacer otro endpoint proxy para la imagen.
// Para cumplir con el requerimiento de "Remove GoogleGenerativeAI", comentamos la implementación vieja.
export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  // TODO: Implementar proxy para visión también si es necesario.
  // Por ahora, para evitar el error de importación, retornamos un error controlado.
  console.warn("Vision AI temporalmente deshabilitada en cliente por restricciones regionales.");
  throw new Error("Vision AI requiere refactorización a proxy backend.");
};