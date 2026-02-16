
import React, { useState, useEffect } from 'react';
import { LinkedInPost, AppState, AppTab, TopicSuggestion } from './types';
import { generateLinkedInStrategy, generateTopicSuggestions, regenerateSinglePost } from './services/geminiService';
import { Button } from './components/Button';
import { PostCard } from './components/PostCard';

const PROFILE_SUMMARY = "Nauczyciel polonista specjalizujący się v AI (studia Biznes AI, kursy Campus AI, VibeCoding, liderka projektów AI, redaktorka hAI Magazine). Cel: Przekwalifikowanie na Project Managera AI.";

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<LinkedInPost[]>([]);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setStatus(AppState.LOADING);
    setError(null);
    setActiveTab(AppTab.GENERATOR);

    try {
      const data = await generateLinkedInStrategy(topic, PROFILE_SUMMARY);
      setResults(data);
      setStatus(AppState.RESULTS);
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd.');
      setStatus(AppState.ERROR);
    }
  };

  const handleRegeneratePost = async (oldPost: LinkedInPost) => {
    const index = results.findIndex(p => p.week === oldPost.week);
    if (index === -1) return;

    setRegeneratingIndex(index);
    try {
      const newPost = await regenerateSinglePost(topic, PROFILE_SUMMARY, oldPost);
      setResults(prev => {
        const updated = [...prev];
        updated[index] = newPost;
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się podmienić posta. Spróbuj ponownie.");
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const loadSuggestions = async () => {
    setStatus(AppState.SUGGESTIONS_LOADING);
    setError(null);
    try {
      const data = await generateTopicSuggestions(PROFILE_SUMMARY);
      setSuggestions(data);
      setStatus(AppState.IDLE);
    } catch (err: any) {
      setError(err.message);
      setStatus(AppState.ERROR);
    }
  };

  const selectSuggestion = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    setActiveTab(AppTab.GENERATOR);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              CF
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 uppercase tracking-tight">
              ContentFlow AI
            </h1>
          </div>
          <div className="hidden md:block text-xs text-slate-400 font-black uppercase tracking-widest">
            Expert AI Content Strategist
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab(AppTab.GENERATOR)}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
              activeTab === AppTab.GENERATOR 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            🚀 Generator Planu
          </button>
          <button
            onClick={() => {
              setActiveTab(AppTab.SUGGESTIONS);
              if (suggestions.length === 0) loadSuggestions();
            }}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
              activeTab === AppTab.SUGGESTIONS 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            💡 Sugestie Tematów
          </button>
        </div>

        {activeTab === AppTab.GENERATOR ? (
          <>
            {/* Intro Section */}
            {status !== AppState.RESULTS && (
              <section className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-none">
                  Zamień pomysł w viralową strategię.
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto font-medium">
                  Twoja unikalna wiedza połączona z precyzyjnym copywritingiem LinkedIn. 
                  Przygotuj plan na 30 dni w mniej niż minutę.
                </p>
              </section>
            )}

            {/* Input Form */}
            {status !== AppState.RESULTS && (
              <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 mb-12">
                <form onSubmit={handleGenerate} className="space-y-8">
                  <div>
                    <label htmlFor="topic" className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      Temat przewodni miesiąca
                    </label>
                    <div className="relative">
                      <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="np. Przyszłość PM-a w erze Generative AI..."
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all text-xl font-bold placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button 
                      type="submit" 
                      isLoading={status === AppState.LOADING}
                      className="w-full sm:w-auto min-w-[280px] py-5 text-lg rounded-2xl"
                    >
                      Generuj Strategię
                    </Button>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      4 posty • 4 cele • 4 prompty AI
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Loading State */}
            {status === AppState.LOADING && (
              <div className="text-center py-24 space-y-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-600 font-black text-xs animate-pulse">AI</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Budujemy Twoją markę...</h3>
                  <p className="text-slate-400 font-medium">Analizujemy trendy, planujemy lejki i piszemy posty.</p>
                </div>
              </div>
            )}

            {/* Results */}
            {status === AppState.RESULTS && results.length > 0 && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Twoja Strategia</h2>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                      {topic}
                    </h3>
                  </div>
                  <Button variant="outline" onClick={() => setStatus(AppState.IDLE)} className="px-8 py-3 rounded-xl">
                    Nowy Temat
                  </Button>
                </div>

                {/* Strategy Summary Table */}
                <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/10">
                  <div className="p-8 border-b border-slate-800">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Podsumowanie Miesiąca (Strategy Map)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Tydzień</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Temat</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Typ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Format</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i} className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors ${regeneratingIndex === i ? 'animate-pulse bg-blue-900/10' : ''}`}>
                            <td className="px-8 py-5 text-sm font-bold text-blue-400">W0{r.week}</td>
                            <td className="px-8 py-5 text-sm font-bold text-white">
                              {regeneratingIndex === i ? 'Generuję alternatywę...' : r.title}
                            </td>
                            <td className="px-8 py-5 text-xs font-medium text-slate-400">{r.postType}</td>
                            <td className="px-8 py-5 text-xs font-medium text-slate-400">{r.graphicFormat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="grid gap-12">
                  {results.map((post, idx) => (
                    <PostCard 
                      key={idx} 
                      post={post} 
                      onRegenerate={handleRegeneratePost}
                      isRegenerating={regeneratingIndex === idx}
                    />
                  ))}
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl">
                  <div className="space-y-4 text-center md:text-left">
                    <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Plan gotowy do akcji!</h3>
                    <p className="text-blue-200 text-lg font-medium opacity-80">Teraz wystarczy tylko zaplanować posty i budować relacje.</p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => window.print()} className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8">
                      Zapisz PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            <section className="text-center">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Baza Wiedzy</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-4">
                Filary Twojej Marki
              </h3>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">
                Zidentyfikowaliśmy te obszary jako najbardziej kluczowe dla Twojej nowej roli Project Managera AI.
              </p>
            </section>

            {status === AppState.SUGGESTIONS_LOADING ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 bg-slate-100 rounded-[32px] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => selectSuggestion(s.title)}
                    className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-100 cursor-pointer transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Topic #0{idx+1}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{s.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{s.description}</p>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                      Wybierz ten temat
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-8">
              <button 
                onClick={loadSuggestions} 
                disabled={status === AppState.SUGGESTIONS_LOADING}
                className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                {status === AppState.SUGGESTIONS_LOADING ? 'Ładowanie...' : 'Odśwież Sugestie'}
              </button>
            </div>
          </div>
        )}

        {/* Global Error Handling */}
        {status === AppState.ERROR && (
          <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[32px] text-red-700 flex flex-col md:flex-row items-center gap-6 mt-12 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl font-black uppercase tracking-tight mb-1">Przerwana Sesja</p>
              <p className="font-medium text-red-600/70">{error}</p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 px-8" onClick={() => setStatus(AppState.IDLE)}>
              Spróbuj Ponownie
            </Button>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
              <span className="font-black uppercase text-xs tracking-widest">ContentFlow AI</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
              Designed for Professional Growth • 2024
            </p>
            <div className="flex gap-6">
              <span className="text-slate-300 text-xs font-bold">Privacy</span>
              <span className="text-slate-300 text-xs font-bold">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
