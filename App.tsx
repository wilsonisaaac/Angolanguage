
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LANGUAGES, SAMPLE_DATA } from './constants';
import { LanguageCode, DictionaryEntry } from './types';
import { LanguageCard } from './components/LanguageCard';
import { WordDisplay } from './components/WordDisplay';
import { getWordMeaning } from './services/geminiService';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fcfaf7]">
      <div className="absolute inset-0 angola-pattern pointer-events-none opacity-[0.03]"></div>
      
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 text-red-600 font-bold text-sm uppercase tracking-widest mb-8 border border-red-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Património Linguístico de Angola
          </div>
          <h1 className="text-7xl md:text-9xl font-extrabold font-serif text-gray-900 mb-8 tracking-tighter">
            Ango<span className="text-red-600">language</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            O oráculo digital das línguas nacionais. Explore a sabedoria e a cultura de Angola através de significados autênticos.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {Object.values(LANGUAGES).map((lang) => (
            <LanguageCard 
              key={lang.code} 
              language={lang} 
              onClick={(code) => navigate(`/dictionary/${code}`)} 
            />
          ))}
        </div>
        
        <footer className="mt-32 text-center">
            <div className="flex justify-center gap-8 mb-6 grayscale opacity-30">
                <img src="https://flagcdn.com/w40/ao.png" alt="Angola" className="h-6" />
                <p className="text-gray-500 font-serif italic text-lg">Orgulho Nacional</p>
            </div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
                Dedicado à preservação das línguas Bantu e à democratização do conhecimento cultural angolano.
            </p>
        </footer>
      </main>
    </div>
  );
};

const DictionaryView: React.FC = () => {
  const { langCode } = useParams<{ langCode: LanguageCode }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentWords, setRecentWords] = useState<DictionaryEntry[]>([]);

  const language = langCode ? LANGUAGES[langCode] : null;

  useEffect(() => {
    if (langCode && SAMPLE_DATA[langCode]) {
      setRecentWords(SAMPLE_DATA[langCode]);
    } else {
      setRecentWords([]);
    }
    setResult(null);
    setSearchTerm('');
  }, [langCode]);

  if (!language) return <div className="p-20 text-center text-2xl">Língua não encontrada</div>;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResult(null);

    // Check samples
    const local = SAMPLE_DATA[language.code]?.find((e: any) => e.word.toLowerCase() === searchTerm.toLowerCase());
    if (local) {
        setResult(local);
        setLoading(false);
        return;
    }

    const aiResult = await getWordMeaning(searchTerm, language.code);
    if (aiResult) {
      setResult(aiResult);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${language.lightBg} selection:bg-red-200`}>
      {/* Dynamic Header */}
      <nav className={`${language.color} py-6 px-8 sticky top-0 z-50 flex items-center justify-between text-white shadow-xl`}>
        <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate('/')} 
                className="p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-105"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h2 className="text-2xl font-bold font-serif leading-none">{language.name}</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold">{language.ethnoName}</span>
            </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Angolanguage</span>
            <span className="text-[10px] opacity-60">Dicionário Nacional</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Search */}
        <div className="mb-20 text-center">
          <h3 className={`text-sm font-bold ${language.accent} uppercase tracking-[0.3em] mb-4`}>Pesquisa de Termos</h3>
          <form onSubmit={handleSearch} className="relative group max-w-3xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Escreva em ${language.name}...`}
              className={`w-full text-3xl p-8 pl-16 rounded-[2rem] bg-white border-2 ${language.pattern} focus:outline-none focus:ring-8 ${language.color.replace('bg-', 'ring-')}/5 shadow-2xl transition-all placeholder:text-gray-300 font-serif`}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <svg className={`w-8 h-8 ${language.accent} opacity-30`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${language.color} text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl text-lg flex items-center gap-2`}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Consultar'}
                </button>
            )}
          </form>
          {!loading && !result && (
              <p className="mt-8 text-gray-400 text-sm font-medium">
                  Tente palavras como: {SAMPLE_DATA[language.code]?.map((e: any) => (
                      <button key={e.word} onClick={() => { setSearchTerm(e.word); setTimeout(() => handleSearch(), 0); }} className={`${language.accent} hover:underline mx-1`}>
                          {e.word}
                      </button>
                  ))}
              </p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className={`w-16 h-16 border-4 ${language.pattern} border-t-current ${language.accent} rounded-full animate-spin`}></div>
            <div className="text-center">
                <p className="text-gray-800 text-xl font-serif font-bold animate-pulse">Consultando a Tradição...</p>
                <p className="text-gray-400 text-sm mt-1">A IA está a analisar o contexto cultural do termo.</p>
            </div>
          </div>
        )}

        {result ? (
          <WordDisplay entry={result} languageInfo={language} />
        ) : !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
                <div className={`h-[1px] flex-grow ${language.color} opacity-10`}></div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.4em]">Termos Sugeridos</h3>
                <div className={`h-[1px] flex-grow ${language.color} opacity-10`}></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentWords.map((word, i) => (
                <button
                  key={i}
                  onClick={() => { setSearchTerm(word.word); setResult(word); }}
                  className="group flex items-center justify-between p-8 bg-white hover:bg-white hover:shadow-2xl rounded-[2rem] border border-gray-100 hover:border-transparent transition-all text-left"
                >
                  <div className="space-y-1">
                    <p className={`font-bold text-2xl font-serif ${language.accent} group-hover:scale-105 transition-transform origin-left`}>{word.word}</p>
                    <p className="text-gray-500 text-sm italic line-clamp-1">{word.meaningPt}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${language.lightBg} flex items-center justify-center transition-all group-hover:${language.color} group-hover:text-white`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                  </div>
                </button>
              ))}
            </div>
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
