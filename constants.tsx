
import { LanguageInfo, LanguageCode, DictionaryEntry } from './types';

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  kimbundu: {
    code: 'kimbundu',
    name: 'Kimbundu',
    ethnoName: 'Ambundu',
    region: 'Luanda, Bengo, Malanje',
    description: 'A língua dos reis de Ndongo e Matamba, núcleo da identidade de Luanda.',
    color: 'bg-[#8B0000]', // Deep Red
    accent: 'text-[#8B0000]',
    lightBg: 'bg-[#FFF5F5]',
    pattern: 'border-[#FFD700]' // Gold accent
  },
  umbundu: {
    code: 'umbundu',
    name: 'Umbundu',
    ethnoName: 'Ovimbundu',
    region: 'Benguela, Huambo, Bié',
    description: 'A língua mais falada em Angola, originária do Planalto Central.',
    color: 'bg-[#D2691E]', // Chocolate/Ochre
    accent: 'text-[#D2691E]',
    lightBg: 'bg-[#FFF8F0]',
    pattern: 'border-[#DEB887]'
  },
  kikongo: {
    code: 'kikongo',
    name: 'Kikongo',
    ethnoName: 'Bakongo',
    region: 'Uíge, Zaire, Cabinda',
    description: 'Língua ancestral do Reino do Congo, com influência transatlântica.',
    color: 'bg-[#006400]', // Dark Green
    accent: 'text-[#006400]',
    lightBg: 'bg-[#F0FFF0]',
    pattern: 'border-[#90EE90]'
  },
  cokwe: {
    code: 'cokwe',
    name: 'Cokwe',
    ethnoName: 'Tuchokwe',
    region: 'Lundas, Moxico',
    description: 'Famosa pela arte Sona e profunda filosofia tradicional do Leste.',
    color: 'bg-[#191970]', // Midnight Blue
    accent: 'text-[#191970]',
    lightBg: 'bg-[#F0F8FF]',
    pattern: 'border-[#ADD8E6]'
  }
};

export const SAMPLE_DATA: Record<LanguageCode, DictionaryEntry[]> = {
  kimbundu: [
    { word: 'Ndengue', language: 'kimbundu', meaningPt: 'Criança mais nova ou o caçula.', meaningEn: 'The youngest child or sibling.', pronunciation: 'N-de-ngue', etymology: 'Derivado do radical Bantu *-ndenge (pequeno/jovem).' },
    { word: 'Kuzola', language: 'kimbundu', meaningPt: 'Amar, sentir amor ou afeição.', meaningEn: 'To love, to feel affection.', pronunciation: 'Ku-zo-la', etymology: 'Do verbo proto-Bantu *-jola (querer/desejar).' },
    { word: 'Mbuji', language: 'kimbundu', meaningPt: 'Sabão ou sabonete.', meaningEn: 'Soap.', pronunciation: 'M-bu-ji', etymology: 'Termo arcaico para cinzas de limpeza.' }
  ],
  umbundu: [
    { word: 'Ondjila', language: 'umbundu', meaningPt: 'Caminho, estrada ou percurso.', meaningEn: 'Path, road or way.', pronunciation: 'On-dji-la', etymology: 'Raiz Bantu *-njila, comum em várias línguas da região.' },
    { word: 'Omunu', language: 'umbundu', meaningPt: 'Pessoa, ser humano.', meaningEn: 'Person, human being.', pronunciation: 'O-mu-nu', etymology: 'Variação da raiz universal Bantu *-ntu (pessoa).' },
    { word: 'Okulya', language: 'umbundu', meaningPt: 'Comer ou o ato de se alimentar.', meaningEn: 'To eat or food.', pronunciation: 'O-ku-lya', etymology: 'Radical *-lya (consumir).' }
  ],
  kikongo: [
    { word: 'Nzambi', language: 'kikongo', meaningPt: 'Deus, Divindade Suprema.', meaningEn: 'God, Supreme Divinity.', pronunciation: 'N-za-mbi', etymology: 'Conceito ancestral central de criador em toda a África Central.' },
    { word: 'Luzolo', language: 'kikongo', meaningPt: 'Vontade, amor ou desejo.', meaningEn: 'Will, love or desire.', pronunciation: 'Lu-zo-lo', etymology: 'Da raiz -zola (amor/vontade).' }
  ],
  cokwe: [
    { word: 'Zango', language: 'cokwe', meaningPt: 'Amor, afeição profunda.', meaningEn: 'Love, deep affection.', pronunciation: 'Za-ngo', etymology: 'Relacionado ao termo Lunda para união.' },
    { word: 'Munu', language: 'cokwe', meaningPt: 'Pessoa ou gente.', meaningEn: 'Person or people.', pronunciation: 'Mu-nu', etymology: 'Cognato de "Omunu" (Umbundu).' }
  ]
};
