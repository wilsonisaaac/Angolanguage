
import React from 'react';
import { LanguageInfo } from '../types';

interface Props {
  language: LanguageInfo;
  onClick: (code: LanguageInfo['code']) => void;
}

export const LanguageCard: React.FC<Props> = ({ language, onClick }) => {
  return (
    <button
      onClick={() => onClick(language.code)}
      className="group relative overflow-hidden rounded-2xl bg-white p-8 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 w-full"
    >
      <div className={`absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-125 ${language.color}`}></div>
      
      <div className="relative z-10">
        <h3 className={`text-2xl font-bold mb-2 ${language.accent}`}>{language.name}</h3>
        <p className="text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">{language.region}</p>
        <p className="text-gray-600 leading-relaxed mb-6">{language.description}</p>
        
        <div className="flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
          <span className={language.accent}>Explorar Dicionário</span>
          <svg className={`ml-2 w-4 h-4 ${language.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </button>
  );
};
