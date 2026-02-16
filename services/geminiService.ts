
import { GoogleGenAI, Type } from "@google/genai";
import { LinkedInPost, TopicSuggestion } from "../types";

const SYSTEM_INSTRUCTION = `Działaj jako Strateg Contentu oraz Ekspert Personal Brandingu i Copywriter LinkedIn z 10-letnim doświadczeniem. Twoim zadaniem jest zamiana ogólnych tematów w strategiczne, profesjonalne posty.

TWOJE ZASADY STRATEGII:
- Stwórz plan na 4 tygodnie (4 posty).
- Zapewnij różnorodność: historia osobista, edukacja, kontrowersyjna opinia, case study.
- Każdy post musi mieć określony cel biznesowy (zaufanie, zasięg, autorytet, konwersja).

TWOJE ZASADY PISANIA (ŚCIŚLE PRZESTRZEGAJ):
1. Struktura Posta:
- HOOK (Nagłówek): Pierwsze zdanie musi przyciągać uwagę.
- RE-HOOK: Drugie zdanie, które zmusza do kliknięcia "zobacz więcej".
- TREŚĆ: Krótkie akapity (max 2 zdania). Dużo światła.
- WNIOSKI (Takeaway): 3-5 punktów w formie listy (👉, ✅, 📌).
- CTA (Call to Action): Zakończ pytaniem angażującym dyskusję.

2. Tone of Voice:
- Autentyczny, aktywna strona, bez wypełniaczy.
- Emoji: Oszczędnie.

3. Formatowanie:
- Brak hashtagów w środku. Max 3-5 na końcu.
- Używaj pogrubień (**tekst**).

Wsparcie Wizualne:
Dla każdego posta wygeneruj Prompt AI (DALL-E/Midjourney) po angielsku.`;

export const generateLinkedInStrategy = async (topic: string, profileInfo: string): Promise<LinkedInPost[]> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Stwórz kompletną strategię i treść postów na LinkedIn dla: ${profileInfo}. 
    Temat przewodni miesiąca: "${topic}".`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.INTEGER, description: "Tydzień (1-4)" },
            day: { type: Type.STRING, description: "Dzień tygodnia" },
            title: { type: Type.STRING, description: "Chwytliwy tytuł tematu" },
            postType: { type: Type.STRING, description: "Typ posta (np. Historia osobista, Edukacja)" },
            businessGoal: { type: Type.STRING, description: "Cel biznesowy posta" },
            content: { type: Type.STRING, description: "Pełna treść posta z Hookiem i CTA" },
            graphicFormat: { type: Type.STRING, description: "Format graficzny (np. Karuzela, Zdjęcie)" },
            graphicIdea: { type: Type.STRING, description: "Opisowa sugestia graficzna po polsku" },
            aiPrompt: { type: Type.STRING, description: "Gotowy prompt AI w języku angielskim" },
            category: { type: Type.STRING, description: "Krótka etykieta kategorii" }
          },
          required: ["week", "day", "title", "postType", "businessGoal", "content", "graphicFormat", "graphicIdea", "aiPrompt", "category"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Błąd podczas generowania strategii.");
  }
};

export const regenerateSinglePost = async (topic: string, profileInfo: string, previousPost: LinkedInPost): Promise<LinkedInPost> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Użytkownik chce podmienić post z tygodnia ${previousPost.week}. 
    Oryginalny temat miesiąca: "${topic}". 
    Profil użytkownika: ${profileInfo}.
    Poprzedni post (do odrzucenia): "${previousPost.title}".
    Stwórz ALTERNATYWNY, zupełnie inny post dla tygodnia ${previousPost.week}, który realizuje inny kąt widzenia, ale wciąż pasuje do strategii.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          day: { type: Type.STRING },
          title: { type: Type.STRING },
          postType: { type: Type.STRING },
          businessGoal: { type: Type.STRING },
          content: { type: Type.STRING },
          graphicFormat: { type: Type.STRING },
          graphicIdea: { type: Type.STRING },
          aiPrompt: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["week", "day", "title", "postType", "businessGoal", "content", "graphicFormat", "graphicIdea", "aiPrompt", "category"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse regenerated post:", error);
    throw new Error("Błąd podczas generowania alternatywnego posta.");
  }
};

export const generateTopicSuggestions = async (profileInfo: string): Promise<TopicSuggestion[]> => {
  const ai = new GoogleGenAI({ import.meta.env.VITE_API_KEY as string });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Na podstawie profilu zawodowego: "${profileInfo}", zaproponuj 6 konkretnych, angażujących zakresów tematycznych (filarów treści) na LinkedIn, które pomogą tej osobie zbudować markę osobistą eksperta i ułatwią zmianę branży.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Krótki, chwytliwy tytuł tematu" },
            description: { type: Type.STRING, description: "Krótkie uzasadnienie" }
          },
          required: ["title", "description"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse suggestions:", error);
    throw new Error("Błąd podczas generowania sugestii.");
  }
};
