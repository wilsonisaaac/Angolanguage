
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LANGUAGES, SAMPLE_DATA } from './constants';
import { LanguageCode, DictionaryEntry } from './types';
import { LanguageCard } from './components/LanguageCard';
import { WordDisplay } from './components/WordDisplay';
import { getWordMeaning } from './services/geminiService';

type SearchTarget = 'all' | 'word' | 'meaning' | 'etymology';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1e2229] flex flex-col justify-between">
      <div className="absolute top-0 right-10 bottom-0 w-[6px] bg-[#e63946] opacity-80"></div>
      <div className="absolute bottom-40 left-0 right-0 h-[4px] bg-[#e63946] opacity-60"></div>
      <div className="absolute bottom-48 left-0 right-0 h-[4px] bg-[#e63946] opacity-40"></div>
      <div className="absolute bottom-56 left-0 right-0 h-[4px] bg-[#e63946] opacity-20"></div>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-48 relative z-10 w-full">
        <header className="text-center mb-16">
          <p className="text-[#e63946] font-bold text-sm uppercase tracking-[0.4em] mb-4">
            Dicionário Multilingue
          </p>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter uppercase">
            Angolanguage
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Português, Inglês, Umbundu, Kimbundu, Kikongo e Cokwe
          </p>
          
          <div className="inline-block border-y-2 border-white/20 py-8 px-12 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase">
              Dicionário
            </h2>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
              Línguas Bantu - Português e Inglês
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {Object.values(LANGUAGES).map((lang) => (
            <LanguageCard 
              key={lang.code} 
              language={lang} 
              onClick={(code) => navigate(`/dictionary/${code}`)} 
            />
          ))}
        </div>
      </main>

      <footer className="bg-[#e63946] py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <p className="text-white font-bold text-xs uppercase tracking-[0.2em]">
                Desenvolvido por WMISAAC
            </p>
            <div className="flex gap-4 opacity-50">
                <img src="https://flagcdn.com/w20/ao.png" alt="Angola" className="h-4" />
            </div>
        </div>
      </footer>
    </div>
  );
};

const DictionaryView: React.FC = () => {
  const { langCode } = useParams<{ langCode: LanguageCode }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<SearchTarget>('all');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [localEntries, setLocalEntries] = useState<DictionaryEntry[]>([]);
  const [history, setHistory] = useState<DictionaryEntry[]>([]);

  const language = langCode ? LANGUAGES[langCode] : null;

  useEffect(() => {
    if (langCode) {
      const savedHistory = localStorage.getItem(`history_${langCode}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      else setHistory([]);
    }
  }, [langCode]);

  useEffect(() => {
    if (langCode && SAMPLE_DATA[langCode]) setLocalEntries(SAMPLE_DATA[langCode]);
    else setLocalEntries([]);
    setResult(null);
    setSearchTerm('');
  }, [langCode]);

  const addToHistory = (entry: DictionaryEntry) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.word.toLowerCase() !== entry.word.toLowerCase());
      const newHistory = [entry, ...filtered].slice(0, 10);
      if (langCode) localStorage.setItem(`history_${langCode}`, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    if (langCode) {
      localStorage.removeItem(`history_${langCode}`);
      setHistory([]);
    }
  };

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) return localEntries;
    const term = searchTerm.toLowerCase();
    
    return localEntries.filter(entry => {
      const matchWord = entry.word.toLowerCase().includes(term);
      const matchMeaning = entry.meaningPt.toLowerCase().includes(term) || entry.meaningEn.toLowerCase().includes(term);
      const matchEtymology = entry.etymology?.toLowerCase().includes(term);

      if (searchTarget === 'word') return matchWord;
      if (searchTarget === 'meaning') return matchMeaning;
      if (searchTarget === 'etymology') return matchEtymology;
      return matchWord || matchMeaning || matchEtymology;
    });
  }, [searchTerm, localEntries, searchTarget]);

  if (!language) return <div className="p-20 text-center text-2xl">Língua não encontrada</div>;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResult(null);

    // Try finding exact local match in word or translations
    const exactLocal = localEntries.find(e => 
        e.word.toLowerCase() === searchTerm.toLowerCase() ||
        e.meaningPt.toLowerCase() === searchTerm.toLowerCase() ||
        e.meaningEn.toLowerCase() === searchTerm.toLowerCase()
    );

    if (exactLocal) {
        const entry = { ...exactLocal, isAiGenerated: false };
        setResult(entry);
        addToHistory(entry);
        setLoading(false);
        return;
    }

    const aiResult = await getWordMeaning(searchTerm, language.code);
    if (aiResult) {
      const entry = { ...aiResult, isAiGenerated: true };
      setResult(entry);
      addToHistory(entry);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${language.lightBg} selection:bg-red-200`}>
      <nav className={`${language.color} py-6 px-8 sticky top-0 z-50 flex items-center justify-between text-white shadow-xl`}>
        <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h2 className="text-2xl font-bold font-serif leading-none">{language.name}</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">{language.ethnoName}</span>
            </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Angolanguage</span>
            <span className="text-[10px] opacity-60">Pesquisa Bidirecional</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h3 className={`text-sm font-bold ${language.accent} uppercase tracking-[0.3em] mb-4`}>Pesquisa Inteligente (Vice-Versa)</h3>
          <p className="text-gray-400 text-sm mb-6">Traduza de Português, Inglês ou {language.name} instantaneamente</p>
          
          <div className="max-w-3xl mx-auto mb-8 space-y-4">
            <form onSubmit={handleSearch} className="relative group shadow-2xl rounded-[2rem]">
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <svg className={`w-8 h-8 ${language.accent} opacity-30`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); if (result) setResult(null); }}
                placeholder="Ex: Amor, Love, ou termo Bantu..."
                className={`w-full text-2xl md:text-3xl p-8 pl-16 pr-44 rounded-[2rem] bg-white border-2 ${language.pattern} focus:outline-none focus:ring-8 ${language.color.replace('bg-', 'ring-')}/5 transition-all placeholder:text-gray-300 font-serif`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                  <button type="submit" disabled={loading} className={`${language.color} text-white px-6 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl text-lg flex items-center gap-2`}>
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="hidden sm:inline">Traduzir</span>}
                      <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </button>
                )}
              </div>
            </form>

            <div className="flex justify-center gap-2">
               {[{ id: 'all', label: 'Tudo' }, { id: 'word', label: 'Palavra' }, { id: 'meaning', label: 'Significado' }, { id: 'etymology', label: 'Etimologia' }].map((target) => (
                 <button key={target.id} onClick={() => setSearchTarget(target.id as SearchTarget)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${searchTarget === target.id ? `${language.color} text-white border-transparent shadow-md scale-105` : `bg-white text-gray-400 border-gray-100 hover:bg-gray-50`}`}>{target.label}</button>
               ))}
            </div>
          </div>

          {history.length > 0 && !result && !loading && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-4 px-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Consultas Recentes</span>
                <button onClick={clearHistory} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors">Limpar Tudo</button>
              </div>
              <div className="flex flex-wrap gap-2 px-2 justify-center">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setResult(h); setSearchTerm(h.word); }} className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all group">
                    {h.isAiGenerated ? (
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><title>IA</title><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><title>Local</title><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                    )}
                    <span className={`font-bold text-sm ${language.accent}`}>{h.word}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className={`w-16 h-16 border-4 ${language.pattern} border-t-current ${language.accent} rounded-full animate-spin`}></div>
            <div className="text-center">
                <p className="text-gray-800 text-xl font-serif font-bold animate-pulse">Detectando Idioma...</p>
                <p className="text-gray-400 text-sm mt-1">Cruzando dados entre PT, EN e {language.name}.</p>
            </div>
          </div>
        )}

        {result ? (
          <div className="animate-in fade-in zoom-in duration-500">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => { setResult(null); setSearchTerm(''); }} className="text-gray-400 hover:text-gray-600 flex items-center gap-2 font-bold text-sm uppercase transition-colors">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     Voltar à Pesquisa
                 </button>
                 {result.isAiGenerated && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">IA Especialista</div>
                 )}
             </div>
             <WordDisplay entry={result} languageInfo={language} />
          </div>
        ) : !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
                <div className={`h-[1px] flex-grow ${language.color} opacity-10`}></div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.4em]">
                    {searchTerm ? `Resultados Bidirecionais (${filteredWords.length})` : 'Sugestões Locais'}
                </h3>
                <div className={`h-[1px] flex-grow ${language.color} opacity-10`}></div>
            </div>

            {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredWords.map((word, i) => {
                    const matchInMeaning = searchTerm && (word.meaningPt.toLowerCase().includes(searchTerm.toLowerCase()) || word.meaningEn.toLowerCase().includes(searchTerm.toLowerCase())) && !word.word.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    return (
                      <button key={i} onClick={() => { const entry = { ...word, isAiGenerated: false }; setResult(entry); addToHistory(entry); }} className="group flex items-center justify-between p-8 bg-white hover:shadow-2xl rounded-[2rem] border border-gray-100 transition-all text-left relative overflow-hidden">
                        {matchInMeaning && (
                          <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white ${language.color} rounded-bl-xl`}>Tradução Encontrada</div>
                        )}
                        <div className="space-y-1 pr-4">
                          <p className={`font-bold text-2xl font-serif ${language.accent} group-hover:scale-105 transition-transform origin-left`}>{word.word}</p>
                          <div className="flex flex-col gap-0.5">
                              <p className={`text-sm italic ${matchInMeaning && word.meaningPt.toLowerCase().includes(searchTerm.toLowerCase()) ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>PT: {word.meaningPt}</p>
                              <p className={`text-xs italic ${matchInMeaning && word.meaningEn.toLowerCase().includes(searchTerm.toLowerCase()) ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>EN: {word.meaningEn}</p>
                          </div>
                        </div>
                        <div className={`shrink-0 w-10 h-10 rounded-full ${language.lightBg} flex items-center justify-center transition-all group-hover:${language.color} group-hover:text-white`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
                      </button>
                    );
                  })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 mb-4 font-medium">Nenhum termo local encontrado. Deseja pesquisar na base global?</p>
                    <button onClick={handleSearch} className={`${language.color} text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto`}>
                        Traduzir via IA <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dictionary/:langCode" element={<DictionaryView />} />
      </Routes>
    </Router>
  );
};

export default App;
