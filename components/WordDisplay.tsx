
import React, { useState } from 'react';
import { DictionaryEntry, LanguageInfo, VerbConjugation } from '../types';
import { generateAudio, getVerbConjugation } from '../services/geminiService';

interface Props {
  entry: DictionaryEntry;
  languageInfo: LanguageInfo;
}

export const WordDisplay: React.FC<Props> = ({ entry, languageInfo }) => {
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [playingExampleIndex, setPlayingExampleIndex] = useState<number | null>(null);
  const [showAllExamples, setShowAllExamples] = useState(false);
  
  // Grammar & Conjugation State
  const [conjugation, setConjugation] = useState<VerbConjugation | null>(null);
  const [loadingConjugation, setLoadingConjugation] = useState(false);
  const [activeTense, setActiveTense] = useState<'present' | 'past' | 'future'>('present');

  const playAudio = async (text: string, type: 'main' | number) => {
    if (isPlayingMain || playingExampleIndex !== null) return;

    if (type === 'main') setIsPlayingMain(true);
    else setPlayingExampleIndex(type);

    try {
      const base64 = await generateAudio(text, languageInfo.name);
      if (base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
          setIsPlayingMain(false);
          setPlayingExampleIndex(null);
        };
        source.start();
      } else {
        setIsPlayingMain(false);
        setPlayingExampleIndex(null);
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingMain(false);
      setPlayingExampleIndex(null);
    }
  };

  const handleConjugate = async () => {
    if (conjugation) {
        setConjugation(null);
        return;
    }
    setLoadingConjugation(true);
    const result = await getVerbConjugation(entry.word, languageInfo.name);
    setConjugation(result);
    setLoadingConjugation(false);
  };

  const examples = entry.examples || [];
  const hasManyExamples = examples.length > 3;
  const displayedExamples = showAllExamples ? examples : examples.slice(0, 3);
  const variations = entry.variations || [];

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
      {/* Header com a Palavra e Pronúncia */}
      <div className={`${languageInfo.color} p-10 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform rotate-12">
            <h1 className="text-9xl font-bold">{languageInfo.name[0]}</h1>
        </div>
        
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-white/10">
              {languageInfo.name} {languageInfo.ethnoName ? `— ${languageInfo.ethnoName}` : ''}
            </span>
            
            {/* Grammar Toggle Button */}
            <button 
                onClick={handleConjugate}
                disabled={loadingConjugation}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${conjugation ? 'bg-white text-gray-800' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
            >
                {loadingConjugation ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )}
                {conjugation ? 'Fechar Gramática' : 'Conjugação Verbal'}
            </button>
          </div>

          <div className="flex items-center gap-6 mb-4">
              <h2 className="text-5xl md:text-6xl font-bold font-serif tracking-tight">{entry.word}</h2>
              <button 
                  onClick={() => playAudio(entry.word, 'main')}
                  className={`p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 active:scale-90 ${isPlayingMain ? 'animate-pulse bg-white/40' : ''}`}
                  title="Ouvir pronúncia"
              >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
              </button>
          </div>

          {/* Pronúncia com Tooltip Guia */}
          {entry.pronunciation && (
            <div className="flex items-center gap-2 group/pron relative mb-2">
              <p className="text-white/70 italic text-lg">Pronúncia: {entry.pronunciation}</p>
              <div className="relative">
                <button className="text-white/30 hover:text-white/60 transition-colors p-1" aria-label="Guia de pronúncia">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* Tooltip Content */}
                <div className="absolute bottom-full left-0 mb-3 w-64 p-5 bg-white text-gray-800 text-xs rounded-2xl shadow-2xl opacity-0 invisible group-hover/pron:opacity-100 group-hover/pron:visible transition-all z-50 pointer-events-none transform -translate-x-4">
                  <p className={`font-bold mb-2 border-b pb-1 border-gray-100 ${languageInfo.accent}`}>Guia de Pronúncia Bantu</p>
                  <ul className="space-y-2 opacity-90">
                    <li>• <strong>Vogais:</strong> A, E, I, O, U são puras e abertas.</li>
                    <li>• <strong>Pré-nasalização:</strong> 'N' ou 'M' iniciais fundem-se à consoante seguinte (ex: N-zambi).</li>
                    <li>• <strong>Som de X:</strong> Soa sempre como 'SH' ou 'CH'.</li>
                    <li>• <strong>Ritmo:</strong> A penúltima sílaba é geralmente a mais forte.</li>
                  </ul>
                  <div className="absolute top-full left-6 w-3 h-3 bg-white rotate-45 -mt-1.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          )}

          {entry.etymology && <p className="text-white/60 text-sm font-medium">Etimologia: {entry.etymology}</p>}
        </div>
      </div>

      <div className="p-10 space-y-12">
        {/* Conjugation Table - Dynamic Section */}
        {conjugation && (
            <section className="animate-in slide-in-from-top-4 duration-500 mb-12">
                <div className={`p-8 rounded-3xl border-2 ${languageInfo.pattern} bg-gray-50/50`}>
                    <div className="flex items-center justify-between mb-8">
                        <h4 className={`text-xl font-bold ${languageInfo.accent} font-serif`}>
                            Tabela de Conjugação: <span className="italic">{entry.word}</span>
                        </h4>
                        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            {[
                                { id: 'present', label: 'Presente' },
                                { id: 'past', label: 'Passado' },
                                { id: 'future', label: 'Futuro' }
                            ].map((tense) => (
                                <button
                                    key={tense.id}
                                    onClick={() => setActiveTense(tense.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTense === tense.id ? `${languageInfo.color} text-white shadow-md` : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tense.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conjugation[activeTense].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-transparent hover:shadow-md transition-all">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.person}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold font-serif ${languageInfo.accent}`}>{item.form}</span>
                                    <button 
                                        onClick={() => playAudio(item.form, 999 + idx)}
                                        className="text-gray-300 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <p className="text-[10px] text-gray-400 mt-6 text-center italic uppercase tracking-wider">
                        * Conjugação gerada automaticamente pela IA baseada na raiz verbal.
                    </p>
                </div>
            </section>
        )}

        {/* Significados Bilingues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-5 bg-blue-700 rounded-sm overflow-hidden shadow-sm flex items-center justify-center">
                   <div className="w-full h-1/3 bg-green-600"></div>
                   <div className="w-full h-1/3 bg-yellow-400"></div>
                   <div className="w-full h-1/3 bg-blue-700"></div>
                </div>
                <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Significado (PT)</h4>
            </div>
            <p className="text-2xl text-gray-800 leading-snug font-medium border-l-4 border-red-500 pl-4">
              {entry.meaningPt}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-5 shadow-sm rounded-sm" />
                <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Meaning (EN)</h4>
            </div>
            <p className="text-2xl text-gray-800 leading-snug font-medium border-l-4 border-blue-500 pl-4">
              {entry.meaningEn}
            </p>
          </div>
        </div>

        {/* Gramatical Variations */}
        {variations.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {variations.map((v, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl border ${languageInfo.pattern} ${languageInfo.lightBg} flex items-center gap-2 shadow-sm`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${languageInfo.accent} opacity-60`}>{v.type}:</span>
                <span className="font-bold text-gray-700">{v.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Exemplos de Uso */}
        {examples.length > 0 && (
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-xl">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                Contexto de Uso
            </h4>
            <div className="space-y-8">
              {displayedExamples.map((ex, i) => (
                <div key={i} className="group animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <p className={`text-xl font-bold ${languageInfo.accent} italic`}>"{ex.original}"</p>
                      <button 
                        onClick={() => playAudio(ex.original, i)}
                        className={`p-2 rounded-full transition-all hover:bg-gray-200 active:scale-90 ${playingExampleIndex === i ? 'bg-gray-200 animate-pulse text-gray-800' : 'text-gray-400 opacity-60 group-hover:opacity-100'}`}
                        title="Ouvir exemplo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 mt-1">{ex.translation}</p>
                  </div>
                </div>
              ))}
            </div>
            {hasManyExamples && (
              <button 
                onClick={() => setShowAllExamples(!showAllExamples)}
                className={`mt-8 font-bold text-sm uppercase tracking-wider ${languageInfo.accent} hover:underline flex items-center gap-2 transition-all`}
              >
                {showAllExamples ? 'Mostrar Menos' : `Mostrar mais ${examples.length - 3}`}
                <svg className={`w-4 h-4 transition-transform duration-300 ${showAllExamples ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Nota Cultural - Exibida se existir */}
        {entry.culturalNote && (
          <section className={`p-8 rounded-3xl border-2 ${languageInfo.pattern} ${languageInfo.lightBg} flex flex-col md:flex-row gap-6 items-start transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${languageInfo.color} text-white shadow-lg`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <h4 className={`text-lg font-bold ${languageInfo.accent} uppercase tracking-tight`}>Nota Cultural</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white ${languageInfo.accent} border border-current opacity-70`}>Sabia que?</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg font-serif italic">
                    {entry.culturalNote}
                </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
