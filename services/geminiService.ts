
import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry, LanguageCode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getWordMeaning(word: string, language: LanguageCode): Promise<DictionaryEntry | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert linguist and cultural historian specializing in Angolan Bantu languages: Umbundu, Kimbundu, Kikongo, and Cokwe. 
      Provide an authentic, accurate dictionary entry for the word "${word}" in ${language}.
      If the word is slightly misspelled, provide the correct form.
      The meanings must be detailed and provided in both Portuguese (PT) and English (EN).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaningPt: { type: Type.STRING, description: 'Formal meaning in Portuguese' },
            meaningEn: { type: Type.STRING, description: 'Formal meaning in English' },
            pronunciation: { type: Type.STRING, description: 'Phonetic breakdown' },
            etymology: { type: Type.STRING, description: 'Origin or root of the word' },
            culturalNote: { type: Type.STRING, description: 'Cultural importance of this word in Angolan society' },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: 'Authentic sentence in the national language' },
                  translation: { type: Type.STRING, description: 'Translation of the sentence' }
                }
              }
            }
          },
          required: ['word', 'meaningPt', 'meaningEn']
        }
      }
    });

    const result = JSON.parse(response.text);
    return { ...result, language };
  } catch (error) {
    console.error("Linguistic lookup error:", error);
    return null;
  }
}

export async function generateAudio(text: string, languageName: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce the ${languageName} word "${text}" naturally as a native speaker would.` }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore has a warm, neutral tone
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
