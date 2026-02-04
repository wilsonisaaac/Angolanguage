
import React, { useState } from 'react';
import { DictionaryEntry, LanguageInfo } from '../types';
import { generateAudio } from '../services/geminiService';

interface Props {
  entry: DictionaryEntry;
  languageInfo: LanguageInfo;
}

export const WordDisplay: React.FC<Props> = ({ entry, languageInfo }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const base64 = await generateAudio(entry.word, languageInfo.name);
    if (base64) {
      // Decode and play logic
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
      source.onended = () => setIsPlaying(false);
      source.start();
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className={`${languageInfo.color} p-10 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform rotate-12">
            <h1 className="text-9xl font-bold">{languageInfo.name[0]}</h1>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-4">
              <h2 className="text-5xl md:text-6xl font-bold font-serif tracking-tight">{entry.word}</h2>
              <button 
                  onClick={handlePlayAudio}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 active:scale-90"
                  title="Ouvir pronúncia"
              >
                  <svg className={`w-8 h-8 ${isPlaying ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
              </button>
          </div>
          {entry.pronunciation && <p className="text-white/70 italic text-lg mb-2">Pronúncia: {entry.pronunciation}</p>}
          {entry.etymology && <p className="text-white/60 text-sm font-medium">Etimologia: {entry.etymology}</p>}
        </div>
      </div>

      <div className="p-10 space-y-12">
        {/* Bilingual Meanings */}
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

        {/* Examples Section */}
        {entry.examples && entry.examples.length > 0 && (
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-xl">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                Contexto de Uso
            </h4>
            <div className="space-y-6">
              {entry.examples.map((ex, i) => (
                <div key={i} className="group">
                  <p className={`text-xl font-bold ${languageInfo.accent} italic`}>"{ex.original}"</p>
                  <p className="text-gray-600 mt-2">{ex.translation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Context */}
        {entry.culturalNote && (
          <div className={`p-8 rounded-3xl border-2 ${languageInfo.pattern} ${languageInfo.lightBg} flex gap-6 items-start transition-all hover:shadow-lg`}>
            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${languageInfo.color} text-white shadow-lg`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
                <h4 className={`text-lg font-bold ${languageInfo.accent} mb-2 uppercase tracking-tight`}>Nota Cultural</h4>
                <p className="text-gray-700 leading-relaxed text-lg">{entry.culturalNote}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
