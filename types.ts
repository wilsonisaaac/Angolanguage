
export type LanguageCode = 'umbundu' | 'kimbundu' | 'kikongo' | 'cokwe';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  region: string;
  description: string;
  color: string;
  accent: string;
  lightBg: string;
  pattern: string;
  ethnoName: string;
}

export interface ConjugationEntry {
  person: string;
  form: string;
}

export interface VerbConjugation {
  present: ConjugationEntry[];
  past: ConjugationEntry[];
  future: ConjugationEntry[];
}

export interface DictionaryEntry {
  word: string;
  language: LanguageCode;
  meaningPt: string;
  meaningEn: string;
  etymology?: string;
  isAiGenerated?: boolean;
  variations?: {
    type: string;
    value: string;
  }[];
  examples?: {
    original: string;
    translation: string;
  }[];
  culturalNote?: string;
  pronunciation?: string;
}
