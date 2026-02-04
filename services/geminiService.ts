
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DictionaryEntry, LanguageCode, VerbConjugation } from "../types";

// Initialize Gemini SDK with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getWordMeaning(word: string, language: LanguageCode): Promise<DictionaryEntry | null> {
  try {
    // Enhanced prompt for bidirectional search (vice-versa)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert linguist specializing in Angolan Bantu languages (${language}).
      The user is searching for "${word}". This input could be in Portuguese, English, or ${language}.
      
      TASK:
      1. Detect the language of "${word}".
      2. If it's Portuguese or English, find the most accurate equivalent in ${language}.
      3. If it's already in ${language}, proceed with its definition.
      4. Return a complete dictionary entry for the ${language} word.
      
      The meanings must be detailed in both Portuguese (PT) and English (EN).
      Include etymology, cultural notes, and authentic examples.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: 'The word in the target Angolan language' },
            meaningPt: { type: Type.STRING, description: 'Meaning in Portuguese' },
            meaningEn: { type: Type.STRING, description: 'Meaning in English' },
            pronunciation: { type: Type.STRING },
            etymology: { type: Type.STRING },
            culturalNote: { type: Type.STRING },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ['type', 'value']
              }
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translation: { type: Type.STRING }
                }
              }
            }
          },
          required: ['word', 'meaningPt', 'meaningEn']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return { ...result, language };
  } catch (error) {
    console.error("Linguistic lookup error:", error);
    return null;
  }
}

export async function getVerbConjugation(word: string, languageName: string): Promise<VerbConjugation | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Conjugate the verb "${word}" in the ${languageName} language.
      If "${word}" is in Portuguese or English, first translate it to ${languageName}.
      Provide the conjugation for Present, Past, and Future tenses.
      Include the standard 6 persons: "Eu", "Tu", "Ele/Ela", "Nós", "Vós", "Eles/Elas".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            present: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  person: { type: Type.STRING },
                  form: { type: Type.STRING }
                },
                required: ['person', 'form']
              }
            },
            past: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  person: { type: Type.STRING },
                  form: { type: Type.STRING }
                },
                required: ['person', 'form']
              }
            },
            future: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  person: { type: Type.STRING },
                  form: { type: Type.STRING }
                },
                required: ['person', 'form']
              }
            }
          },
          required: ['present', 'past', 'future']
        }
      }
    });

    return JSON.parse(response.text || '{}') as VerbConjugation;
  } catch (error) {
    console.error("Conjugation error:", error);
    return null;
  }
}

export async function generateAudio(text: string, languageName: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce the ${languageName} text "${text}" naturally.` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (err) {
    console.error("TTS Error:", err);
    return null;
  }
}
