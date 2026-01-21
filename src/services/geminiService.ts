
import { GoogleGenAI, Chat } from "@google/genai";

interface PatientContext {
  name?: string;
  chronologicalAge?: number;
  biologicalAge?: number;
  bloodType?: string;
}

const buildSystemInstruction = (context?: PatientContext): string => {
  if (!context) {
    return `Eres VCoach, asistente médico de Rejuvenate. 
Ayudas a pacientes a reducir su edad biológica mediante las 5A Claves y Terapias 4R.
Responde de forma concisa y profesional en español.`;
  }

  const { name, chronologicalAge, biologicalAge, bloodType } = context;
  const ageDiff = chronologicalAge && biologicalAge ? chronologicalAge - biologicalAge : null;
  const vitalityMessage = ageDiff && ageDiff > 0
    ? `(+${ageDiff} años de vitalidad)`
    : ageDiff && ageDiff < 0
      ? `(necesita ${Math.abs(ageDiff)} años de rejuvenecimiento)`
      : '';

  return `Eres VCoach, asistente médico personalizado de ${name || 'este paciente'}.
${name} tiene ${chronologicalAge || '?'} años cronológicos y una edad biológica de ${biologicalAge || '?'} ${vitalityMessage}.
${bloodType ? `Su grupo sanguíneo es ${bloodType}.` : ''}

Tu misión es guiar a ${name || 'tu paciente'} hacia la reducción de su edad biológica mediante:
- Las 5A Claves: Alimentación, Actividad, Actitud, Ambiente, Anti-envejecimiento
- Las Terapias 4R: Remoción, Restauración, Regeneración, Revitalización

Responde de forma concisa, profesional y personalizada en español.`;
};

let chatSession: Chat | null = null;

export const startChatSession = async (patientContext?: PatientContext): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: buildSystemInstruction(patientContext),
      temperature: 0.7,
    },
  });
  return chatSession;
};

export const sendMessageToVCoach = async (message: string): Promise<string> => {
  try {
    if (!chatSession) {
      await startChatSession();
    }
    if (!chatSession) throw new Error("No session");
    const response = await chatSession.sendMessage({ message });
    return response.text || "No tengo respuesta en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con VCoach.";
  }
};

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analiza esta comida para una dieta antienvejecimiento. Devuelve JSON: productName, recommendation, reasoning, macros, inflammatoryIngredients." }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};
