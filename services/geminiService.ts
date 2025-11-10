import { GoogleGenAI } from "@google/genai";

// The API key is obtained from the environment variable `process.env.API_KEY`.
// This is assumed to be pre-configured and valid.

// We will use a lazy-initialized instance to prevent app crashes if the API key is not set.
let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI | null => {
    // Return the cached instance if it exists
    if (ai) {
        return ai;
    }
    // If the API key is available in the environment, create a new instance
    // This check is safe for browsers where `process` is not defined.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return ai;
    }
    // Return null if the API key is not found
    return null;
}

export const getJiuJitsuTip = async (): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    // If the instance could not be created (e.g., missing API key), throw an error
    // to be caught by the catch block, which will return a fallback message.
    if (!aiInstance) {
        throw new Error("API_KEY not configured for Gemini service.");
    }
    
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Forneça uma dica rápida e útil de jiu-jitsu para praticantes, com no máximo 2 frases. A dica deve ser sobre técnica, estratégia ou mentalidade.",
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Jiu-Jitsu tip from Gemini:", error);
    // Provide a user-friendly fallback message.
    return "Não foi possível carregar a dica do dia. Lembre-se: a constância nos treinos vence o talento.";
  }
};