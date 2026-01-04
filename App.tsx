
import React, { useState, useEffect } from 'react';
import { AppState, SongInfo, IdentifyCandidate, SearchFilters, UserProfile } from './types';
import { rescueMusic } from './services/geminiService';
import { dbService } from './services/dbService';
import { 
  Music, 
  Search, 
  Library, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  XCircle,
  User,
  Sparkles,
  ChevronRight,
  TrendingUp,
  History,
  Clock
} from 'lucide-react';

const GENRES = ["Pop", "Rock", "Sertanejo", "Pagode", "Eletrônica", "Rap/Trap", "MPB", "Funk", "Gospel", "Internacional"];
const VOCAL_TYPES = ["Masculina", "Feminina", "Grupo", "Instrumental"];
const ERAS = ["Anos 80/90", "Clássicos Antigos", "Início dos 2000", "Recente (Últimos anos)"];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<SongInfo[]>([]);
  const [results, setResults] = useState<IdentifyCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  // Onboarding Data
  const [onboardingName, setOnboardingName] = useState({ first: '', last: '' });

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const savedUser = await dbService.getUser();
      const savedLib = await dbService.getLibrary();
      
      if (savedLib) setLibrary(savedLib);
      
      if (savedUser && savedUser.firstName) {
        setUser(savedUser);
        setState(AppState.HOME);
      } else {
        setState(AppState.ONBOARDING);
      }
      setIsLoading(false);
    };
    initApp();
  }, []);

  const finalizeOnboarding = async () => {
    if (!onboardingName.first) return;
    const newUser: UserProfile = { 
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      firstName: onboardingName.first, 
      lastName: onboardingName.last 
    };
    await dbService.saveUser(newUser);
    setUser(newUser);
    setState(AppState.HOME);
  };

  const handleSaveToLibrary = async (candidate: IdentifyCandidate) => {
    const newSong: SongInfo = {
      id: Math.random().toString(36).substr(2, 9),
      ...candidate,
      timestamp: Date.now()
    };
    const updatedLib = [newSong, ...library];
    setLibrary(updatedLib);
    await dbService.saveLibrary(updatedLib);
    setFeedback('Memória resgatada e salva!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemoveFromLibrary = async (id: string) => {
    const updatedLib = library.filter(s => s.id !== id);
    setLibrary(updatedLib);
    await dbService.saveLibrary(updatedLib);
    setFeedback('Removido da biblioteca');
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleRescue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const candidates = await rescueMusic(searchQuery, filters);
      if (candidates.length === 0) {
        setError("Hmm... essa memória está difícil. Pode me dar mais detalhes?");
      } else {
        setResults(candidates);
        setState(AppState.RESULTS);
      }
    } catch (err) {
      setError("Ocorreu uma interferência no resgate. Tente novamente!");
    } finally {
      setIsLoading(false);
    }
  };

  const favoriteGenre = library.length > 0 
    ? Object.entries(library.reduce((acc, curr) => {
        acc[curr.genre] = (acc[curr.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
    : "Nenhum ainda";

  const goHome = () => {
    setState(AppState.HOME);
    setError(null);
    setSearchQuery('');
    setFilters({});
  };

  if (isLoading && state === AppState.ONBOARDING && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (state === AppState.ONBOARDING) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 music-gradient rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-pulse">
          <Music size={40} />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter">SOUNDNOTE</h1>
        <p className="text-slate-400 mb-10 max-w-sm">Bem-vindo ao resgatador de memórias musicais. Como podemos te chamar?</p>
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="text" 
            placeholder="Seu primeiro nome"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={onboardingName.first}
            onChange={e => setOnboardingName({...onboardingName, first: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Seu sobrenome"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={onboardingName.last}
            onChange={e => setOnboardingName({...onboardingName, last: e.target.value})}
          />
          <button 
            disabled={!onboardingName.first}
            onClick={finalizeOnboarding}
            className="w-full py-4 music-gradient rounded-2xl font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Começar Experiência
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4">
      <header className="w-full max-w-2xl flex justify-between items-center py-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
          <div className="w-12 h-12 music-gradient rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Music size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">SOUNDNOTE</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Memória Musical</p>
          </div>
        </div>
        <div className="flex gap-2">
          {state !== AppState.HOME && (
            <button onClick={goHome} className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <button onClick={() => setState(AppState.PROFILE)} className="p-1 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors overflow-hidden">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
              <User size={20} className="text-purple-400" />
            </div>
          </button>
        </div>
      </header>

      <main className="w-full max-w-lg flex-1 flex flex-col mt-4 pb-20">
        
        {state === AppState.HOME && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="py-4">
              <h2 className="text-3xl font-bold">Olá, {user?.firstName}! ✨</h2>
              <p className="text-slate-400 mt-1">Sua mente está pronta para resgatar algo hoje?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-3xl col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resgates no Banco</p>
                  <p className="text-3xl font-black text-purple-400">{library.length} <span className="text-sm font-medium text-slate-400">músicas</span></p>
                </div>
                <TrendingUp size={32} className="text-purple-500/30" />
              </div>

              <button onClick={() => setState(AppState.SEARCH_TEXT)} className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-purple-500/40 transition-all text-center group">
                <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Search size={28} /></div>
                <div><p className="font-bold">Buscar Música</p><p className="text-xs text-slate-500 mt-1">Por fragmentos</p></div>
              </button>

              <button onClick={() => setState(AppState.LIBRARY)} className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-pink-500/40 transition-all text-center group">
                <div className="w-14 h-14 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform"><Library size={28} /></div>
                <div><p className="font-bold">Biblioteca</p><p className="text-xs text-slate-500 mt-1">Suas lembranças</p></div>
              </button>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Histórico Recente</h3>
              {library.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Suas memórias aparecerão aqui...</p>
              ) : (
                library.slice(0, 3).map(song => (
                  <div key={song.id} className="flex items-center gap-4 mb-3 p-3 glass-card rounded-2xl">
                    <div className="w-10 h-10 music-gradient rounded-lg flex items-center justify-center flex-shrink-0"><Music size={18} /></div>
                    <div className="flex-1 min-w-0"><p className="font-bold truncate text-sm">{song.name}</p><p className="text-[10px] text-slate-400 truncate">{song.artist}</p></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {state === AppState.SEARCH_TEXT && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2"><h2 className="text-2xl font-black">Resgatar da Memória</h2><p className="text-slate-400">O que você lembra? Trechos, estilo ou onde ouviu.</p></div>
            <textarea 
              autoFocus
              className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 min-h-[180px] text-lg outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              placeholder="Ex: Tinha um refrão que falava sobre o mar e era uma voz feminina, estilo MPB..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button disabled={!searchQuery.trim()} onClick={() => setState(AppState.SEARCH_FILTERS)} className="w-full py-5 music-gradient rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl">Próximo Passo <ChevronRight size={20} /></button>
          </div>
        )}

        {state === AppState.SEARCH_FILTERS && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-300">
            <div><h2 className="text-2xl font-black">Refinar Detalhes</h2><p className="text-slate-400">Isso ajuda o Soundnote a ser mais preciso.</p></div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Estilo Musical</p>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button key={g} onClick={() => setFilters({...filters, genre: g})} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.genre === g ? 'music-gradient text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Voz</p>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none" value={filters.vocalType} onChange={e => setFilters({...filters, vocalType: e.target.value})}><option value="">Selecione</option>{VOCAL_TYPES.map(v => <option key={v} value={v}>{v}</option>)}</select>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Época</p>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none" value={filters.era} onChange={e => setFilters({...filters, era: e.target.value})}><option value="">Qualquer</option>{ERAS.map(e => <option key={e} value={e}>{e}</option>)}</select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setState(AppState.SEARCH_TEXT)} className="flex-1 py-4 bg-slate-900 rounded-2xl font-bold">Voltar</button>
              <button onClick={handleRescue} className="flex-1 py-4 music-gradient rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">Resgatar! <Sparkles size={20} /></button>
            </div>
          </div>
        )}

        {isLoading && state !== AppState.ONBOARDING && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full music-gradient opacity-20 animate-ping absolute top-0 left-0"></div>
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 flex items-center justify-center"><Loader2 size={40} className="text-purple-500 animate-spin" /></div>
            </div>
            <h3 className="text-xl font-bold">Resgatando memórias...</h3>
          </div>
        )}

        {!isLoading && state === AppState.RESULTS && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-black">Candidatos encontrados 👀</h2>
            {error && <div className="glass-card p-6 rounded-3xl text-center"><XCircle size={40} className="text-red-500 mx-auto mb-4" /><p className="font-bold text-red-400">{error}</p></div>}
            <div className="space-y-4">
              {results.map((c, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0"><h3 className="text-2xl font-black truncate">{c.name}</h3><p className="text-purple-400 font-bold">{c.artist}</p></div>
                    <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800"><span className="text-[10px] font-black text-slate-500">{c.confidence}% Confiança</span></div>
                  </div>
                  <p className="text-sm text-slate-300 italic mb-6">"{c.report}"</p>
                  <button onClick={() => handleSaveToLibrary(c)} className="w-full py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"><Plus size={18} /> Salvar no Banco</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === AppState.LIBRARY && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black">Banco de Memórias</h2>
            {library.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-3xl"><Music size={48} className="mx-auto mb-4 text-slate-800" /><p className="text-slate-400">Sua biblioteca está vazia.</p></div>
            ) : (
              <div className="grid gap-3">
                {library.map(song => (
                  <div key={song.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-900/40 transition-all">
                    <div className="w-12 h-12 music-gradient rounded-xl flex items-center justify-center flex-shrink-0"><Music size={22} /></div>
                    <div className="flex-1 min-w-0"><p className="font-bold truncate">{song.name}</p><p className="text-xs text-slate-500 truncate">{song.artist}</p></div>
                    <button onClick={() => handleRemoveFromLibrary(song.id)} className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state === AppState.PROFILE && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-24 h-24 music-gradient rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden">
                <User size={48} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-500 text-sm font-medium">Usuário Soundnote</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 rounded-3xl text-center"><p className="text-xs font-bold text-slate-500 mb-2">Resgatadas</p><p className="text-4xl font-black text-purple-400">{library.length}</p></div>
              <div className="glass-card p-6 rounded-3xl text-center"><p className="text-xs font-bold text-slate-500 mb-2">Estilo Favorito</p><p className="text-xl font-black text-pink-400 truncate">{favoriteGenre}</p></div>
            </div>
            <button 
              onClick={async () => {
                if (confirm('Deseja realmente apagar todos os seus dados?')) {
                  await dbService.clearAll();
                  window.location.reload();
                }
              }}
              className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/20 mt-10"
            >
              Limpar Banco de Memórias
            </button>
          </div>
        )}

      </main>

      {feedback && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-10 z-50">
          <CheckCircle2 size={24} />
          <span className="font-black text-sm uppercase tracking-wider">{feedback}</span>
        </div>
      )}

      <footer className="w-full text-center py-6 text-slate-600 text-xs font-bold uppercase tracking-widest">
        Soundnote &copy; {new Date().getFullYear()} — Banco de Memórias Ativo
      </footer>
    </div>
  );
};

export default App;
