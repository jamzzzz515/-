import React, { useState, useEffect, useRef } from 'react';
import { AppState, Spread, DrawnCard, ChatMessage, Theme, TarotCard } from './types';
import { SPREADS, FULL_DECK, THEMES } from './constants';
import { getTarotInterpretation, getFollowUpResponse, recommendSpread } from './services/geminiService';
import StarField from './components/StarField';
import Card from './components/Card';
import Toast from './components/Toast';

const App: React.FC = () => {
  // State
  const [state, setState] = useState<AppState>('INTENTION');
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<Spread>(SPREADS[1]); 
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('random');
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [readingText, setReadingText] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [breathCount, setBreathCount] = useState(3);
  
  // Library State
  const [selectedLibraryCard, setSelectedLibraryCard] = useState<TarotCard | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Refs for scrolling
  const readingRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  const closeToast = () => {
    setToast({ visible: false, message: '' });
  };

  // --- Handlers ---

  const handleQuestionSubmit = async () => {
    if (!question.trim()) {
        showToast("请输入内容");
        return;
    }
    const recommendedId = await recommendSpread(question);
    const spread = SPREADS.find(s => s.id === recommendedId) || SPREADS[1];
    setSelectedSpread(spread);
    setState('BREATHING');
  };

  // Breathing Timer Effect
  useEffect(() => {
    let timer: any;
    if (state === 'BREATHING') {
        setBreathCount(3);
        timer = setInterval(() => {
            setBreathCount(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => setState('METHOD_SELECT'), 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1500); 
    }
    return () => clearInterval(timer);
  }, [state]);

  const startDrawing = (method: 'random' | 'manual') => {
    setDrawMethod(method);
    if (method === 'random') {
        performDraw([]);
    } else {
        setManualNumbers(new Array(selectedSpread.positions.length).fill(''));
        setState('NUMBER_INPUT');
    }
  };

  const performDraw = (userSeeds: number[]) => {
    const deckCopy = [...FULL_DECK];
    const result: DrawnCard[] = [];
    
    for (let i = deckCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }

    for (let i = 0; i < selectedSpread.positions.length; i++) {
        const card = deckCopy[i];
        const isUpright = Math.random() > 0.3; // 70% chance upright
        result.push({
            ...card,
            isUpright,
            positionName: selectedSpread.positions[i]
        });
    }

    setDrawnCards(result);
    setState('REVEAL');
  };

  const handleManualSubmit = () => {
      // Validation: Check for empty strings
      if (manualNumbers.some(n => !n || n.trim() === '')) {
          showToast("请输入内容");
          return;
      }

      const seeds = manualNumbers.map(n => parseInt(n, 10));
      if (seeds.some(n => isNaN(n) || n < 1 || n > 78)) {
          showToast("请输入 1 到 78 之间的数字");
          return;
      }
      
      const result: DrawnCard[] = [];
      const usedIndices = new Set<number>();

      seeds.forEach((seed, idx) => {
          let actualIndex = (seed - 1) % 78;
          while(usedIndices.has(actualIndex)) {
              actualIndex = (actualIndex + 1) % 78;
          }
          usedIndices.add(actualIndex);

          const card = FULL_DECK[actualIndex];
          const isUpright = Math.random() > 0.5; 
          result.push({
              ...card,
              isUpright,
              positionName: selectedSpread.positions[idx]
          });
      });

      setDrawnCards(result);
      setState('REVEAL');
  };

  const revealCard = (index: number) => {
    if (index !== revealedCount) return; 
    setRevealedCount(prev => prev + 1);
  };

  useEffect(() => {
      if (state === 'REVEAL' && revealedCount === drawnCards.length && drawnCards.length > 0) {
          setState('READING');
          fetchInterpretation();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount, state]);

  // Auto-scroll to bottom of chat when history updates
  useEffect(() => {
    if (state === 'READING' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, state]);

  const fetchInterpretation = async () => {
      setIsInterpreting(true);
      const text = await getTarotInterpretation(question, selectedSpread, drawnCards);
      setReadingText(text);
      setIsInterpreting(false);
      
      const initialHistory: ChatMessage[] = [];
      
      // Add user question to history
      if (question) {
        initialHistory.push({
          role: 'user',
          content: question,
          timestamp: Date.now()
        });
      }
      
      initialHistory.push({
          role: 'model',
          content: text,
          timestamp: Date.now()
      });

      setChatHistory(initialHistory);
  };

  const handleFollowUp = async () => {
      if (isFollowUpLoading) return;

      if (!followUpInput.trim()) {
          showToast("请输入内容");
          return;
      }
      
      const userMsg: ChatMessage = { role: 'user', content: followUpInput, timestamp: Date.now() };
      setChatHistory(prev => [...prev, userMsg]);
      setFollowUpInput('');
      setIsFollowUpLoading(true);

      const geminiHistory = chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
      }));
      
      const response = await getFollowUpResponse(geminiHistory, userMsg.content);
      
      setChatHistory(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
      setIsFollowUpLoading(false);
  };

  const resetApp = () => {
      if (state === 'READING' || confirm("确定要开始新的占卜吗？当前的进度将丢失。")) {
        setState('INTENTION');
        setQuestion('');
        setDrawnCards([]);
        setRevealedCount(0);
        setReadingText('');
        setChatHistory([]);
        setManualNumbers([]);
        window.scrollTo(0, 0);
      }
  };

  const filteredLibrary = FULL_DECK.filter(c => c.name.includes(librarySearch));

  // --- Renders ---

  // Theme styles
  const bgGradient = `bg-gradient-to-b from-slate-950 via-${currentTheme.primaryColor}-950 to-slate-950`;
  const accentText = `text-${currentTheme.accentColor}-400`;
  const borderStyle = `border-${currentTheme.primaryColor}-800`;

  // Helper to format text with newlines into paragraphs
  const formatText = (text: string) => {
      return text.split('\n').map((line, index) => {
          if (!line.trim()) return <br key={index} />;
          // Replace **text** with styled spans
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
              <p key={index} className="mb-2">
                  {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className={`text-${currentTheme.accentColor}-200`}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                  })}
              </p>
          );
      });
  };

  return (
    <div className={`min-h-screen w-full text-indigo-50 relative overflow-x-hidden flex flex-col ${bgGradient} transition-colors duration-1000`}>
        <StarField />
        <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />
        
        {/* Header */}
        <header className={`relative z-20 w-full p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center border-b ${borderStyle} bg-slate-950/80 backdrop-blur-sm gap-4`}>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setState('INTENTION')}>
                <span className="text-3xl">🔮</span>
                <div className="flex flex-col">
                  <h1 className={`text-2xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-${currentTheme.accentColor}-200 to-${currentTheme.accentColor}-600`}>LUMINA TAROT</h1>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">心灵指引</span>
                </div>
            </div>
            
            <div className="flex gap-4 items-center">
                {/* Theme Switcher */}
                <div className="flex gap-2">
                   {THEMES.map(t => (
                     <button 
                        key={t.id}
                        onClick={() => setCurrentTheme(t)}
                        className={`w-6 h-6 rounded-full border-2 ${currentTheme.id === t.id ? `border-${t.accentColor}-400 scale-110` : 'border-transparent opacity-50'} transition-all`}
                        style={{ background: t.id === 'classic' ? '#312e81' : t.id === 'nature' ? '#064e3b' : '#701a75' }}
                        title={t.name}
                     />
                   ))}
                </div>

                {/* Library Button */}
                <button 
                    onClick={() => setState(state === 'LIBRARY' ? 'INTENTION' : 'LIBRARY')}
                    className={`text-xs uppercase tracking-widest border border-slate-700 px-3 py-1 rounded hover:border-${currentTheme.accentColor}-500 transition`}
                >
                    {state === 'LIBRARY' ? '返回' : '牌意百科'}
                </button>

                {/* Prominent New Reading Button (Header) */}
                {state !== 'INTENTION' && (
                    <button 
                        onClick={resetApp} 
                        className={`text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full bg-gradient-to-r from-${currentTheme.accentColor}-600 to-${currentTheme.primaryColor}-600 text-white border border-${currentTheme.accentColor}-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300`}
                    >
                        新占卜
                    </button>
                )}
            </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]`}>
            
            {/* LIBRARY VIEW */}
            {state === 'LIBRARY' && (
                <div className="w-full animate-in fade-in duration-500">
                     <div className="mb-8 text-center">
                        <h2 className="text-3xl font-serif mb-4 text-slate-200">塔罗牌全书</h2>
                        <input 
                            type="text" 
                            placeholder="搜索牌名..." 
                            value={librarySearch}
                            onChange={e => setLibrarySearch(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-center w-full max-w-md focus:border-yellow-500 focus:outline-none"
                        />
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredLibrary.map(card => (
                            <div 
                                key={card.id} 
                                onClick={() => setSelectedLibraryCard(card)}
                                className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 cursor-pointer hover:border-yellow-600 hover:bg-slate-800 transition text-center flex flex-col items-center gap-2"
                            >
                                <div className="text-2xl">
                                    {card.suit === 'None' ? '🌟' : 
                                     card.suit === '权杖' ? '🪄' : 
                                     card.suit === '圣杯' ? '🏆' : 
                                     card.suit === '宝剑' ? '⚔️' : '🪙'}
                                </div>
                                <div className="text-sm font-bold text-slate-300">{card.name}</div>
                            </div>
                        ))}
                     </div>

                     {/* Detail Modal */}
                     {selectedLibraryCard && (
                         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedLibraryCard(null)}>
                             <div className="bg-slate-900 border border-yellow-700 rounded-xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
                                 <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={() => setSelectedLibraryCard(null)}>✕</button>
                                 <h3 className="text-2xl font-serif text-yellow-500 mb-2">{selectedLibraryCard.name}</h3>
                                 <p className="text-sm text-slate-400 uppercase mb-4">{selectedLibraryCard.suit === 'None' ? '大阿卡纳' : `${selectedLibraryCard.suit}牌组`}</p>
                                 
                                 <div className="space-y-4 text-slate-200 text-sm leading-relaxed">
                                     <p>{selectedLibraryCard.meaning}</p>
                                     
                                     <div className="grid grid-cols-2 gap-4 mt-4">
                                         <div className="bg-slate-950 p-3 rounded border border-green-900/30">
                                             <span className="block text-green-400 text-xs uppercase mb-1">正位关键词</span>
                                             {selectedLibraryCard.keywordsUpright.join(', ')}
                                         </div>
                                         <div className="bg-slate-950 p-3 rounded border border-red-900/30">
                                             <span className="block text-red-400 text-xs uppercase mb-1">逆位关键词</span>
                                             {selectedLibraryCard.keywordsReversed.join(', ')}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}
                </div>
            )}

            {/* Stage 1: Intention */}
            {state === 'INTENTION' && (
                <div className="w-full max-w-2xl text-center animate-in fade-in zoom-in duration-700">
                    <h2 className="text-3xl md:text-4xl mb-6 font-light text-slate-200">心中的疑惑是什么？</h2>
                    <p className={`text-${currentTheme.primaryColor}-300 mb-8`}>请专注于当下困扰你的问题或处境。</p>
                    <div className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-${currentTheme.accentColor}-600 to-${currentTheme.primaryColor}-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                        <input 
                            type="text" 
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="例如：这份工作未来的发展如何？"
                            className={`relative w-full ${currentTheme.frontBg} border ${borderStyle} rounded-lg p-4 text-lg focus:outline-none focus:border-${currentTheme.accentColor}-500 text-center placeholder-slate-600 transition-all`}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                        />
                    </div>
                    <button 
                        onClick={handleQuestionSubmit}
                        className={`mt-8 px-8 py-3 bg-${currentTheme.primaryColor}-900/50 hover:bg-${currentTheme.primaryColor}-800 border border-${currentTheme.primaryColor}-600 rounded-full uppercase tracking-widest text-sm transition-all`}
                    >
                        开始指引
                    </button>
                </div>
            )}

            {/* Stage 2: Breathing */}
            {state === 'BREATHING' && (
                <div className="text-center">
                    <div className={`text-8xl font-thin text-${currentTheme.accentColor}-100 mb-8 transition-all duration-1000 transform ${breathCount === 0 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
                        {breathCount > 0 ? breathCount : '✨'}
                    </div>
                    <p className={`text-xl text-${currentTheme.primaryColor}-300 animate-pulse`}>
                        闭上双眼，深呼吸。<br/>让宇宙清晰地听到你的愿望。
                    </p>
                    <div className="mt-8 text-sm text-slate-500 uppercase tracking-widest">
                        正在校准能量频率...
                    </div>
                </div>
            )}

            {/* Stage 3: Method Select */}
            {state === 'METHOD_SELECT' && (
                <div className="w-full max-w-2xl text-center animate-in slide-in-from-bottom-10 duration-500">
                    <h2 className="text-2xl mb-2 text-slate-200">当前牌阵: <span className={accentText}>{selectedSpread.name}</span></h2>
                    <p className="text-sm text-slate-400 mb-12">{selectedSpread.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => startDrawing('random')}
                            className={`group p-8 ${currentTheme.frontBg}/50 border ${borderStyle} rounded-xl hover:border-${currentTheme.accentColor}-500 hover:bg-slate-800 transition-all`}
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌌</div>
                            <h3 className="text-xl font-bold mb-2">宇宙随机抽取</h3>
                            <p className="text-sm text-slate-400">完全信任随机性，让潜意识通过数字以太显化。</p>
                        </button>

                        <button 
                            onClick={() => startDrawing('manual')}
                            className={`group p-8 ${currentTheme.frontBg}/50 border ${borderStyle} rounded-xl hover:border-${currentTheme.accentColor}-500 hover:bg-slate-800 transition-all`}
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔢</div>
                            <h3 className="text-xl font-bold mb-2">数字共鸣抽取</h3>
                            <p className="text-sm text-slate-400">凭直觉报出数字，主动与牌面产生连结。</p>
                        </button>
                    </div>
                    
                    <div className="mt-8 flex justify-center items-center">
                        <label className="text-xs text-slate-500 mr-2">更换牌阵:</label>
                        <select 
                            className={`bg-slate-900 border ${borderStyle} text-xs text-slate-300 p-1 rounded focus:outline-none`}
                            value={selectedSpread.id}
                            onChange={(e) => setSelectedSpread(SPREADS.find(s => s.id === e.target.value) || SPREADS[0])}
                        >
                            {SPREADS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* Stage 3.5: Manual Input */}
            {state === 'NUMBER_INPUT' && (
                <div className="w-full max-w-md text-center">
                    <h3 className="text-xl mb-6">请输入 {selectedSpread.positions.length} 个数字 (1-78)</h3>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {manualNumbers.map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <label className="text-[10px] uppercase text-slate-400 mb-1 truncate w-full">{selectedSpread.positions[idx]}</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="78"
                                    value={val}
                                    onChange={(e) => {
                                        const newArr = [...manualNumbers];
                                        newArr[idx] = e.target.value;
                                        setManualNumbers(newArr);
                                    }}
                                    className={`w-full p-3 bg-slate-800 border ${borderStyle} rounded text-center text-${currentTheme.accentColor}-400 font-bold focus:border-${currentTheme.accentColor}-400 focus:outline-none`}
                                />
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleManualSubmit}
                        className={`px-8 py-3 bg-${currentTheme.accentColor}-600/20 hover:bg-${currentTheme.accentColor}-600/40 border border-${currentTheme.accentColor}-600 text-${currentTheme.accentColor}-200 rounded-full transition-all`}
                    >
                        揭示命运
                    </button>
                </div>
            )}

            {/* Stage 4 & 5: Reveal & Reading */}
            {(state === 'REVEAL' || state === 'READING') && (
                <div className="w-full max-w-5xl flex flex-col items-center">
                    {/* Cards Display */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
                        {drawnCards.map((card, idx) => (
                            <Card 
                                key={`${card.id}-${idx}`} 
                                card={card} 
                                index={idx}
                                isRevealed={idx < revealedCount}
                                onReveal={() => revealCard(idx)}
                                theme={currentTheme}
                            />
                        ))}
                    </div>

                    {/* Instruction during reveal */}
                    {state === 'REVEAL' && revealedCount < drawnCards.length && (
                        <p className={`animate-pulse text-${currentTheme.accentColor}-200 mb-8`}>请按顺序点击卡牌翻开...</p>
                    )}

                    {/* Interpretation Area */}
                    {state === 'READING' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            
                            {/* Scrollable Reading Content */}
                            <div ref={readingRef} className="w-full">
                                {/* Chat History */}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`mb-6 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            max-w-full md:max-w-[85%] rounded-2xl p-6 shadow-xl 
                                            ${msg.role === 'user' 
                                                ? `bg-${currentTheme.primaryColor}-900/80 border border-${currentTheme.primaryColor}-600 text-white rounded-tr-sm` 
                                                : `bg-slate-900/80 border ${borderStyle} text-slate-200 rounded-tl-sm`
                                            }
                                        `}>
                                            {msg.role === 'model' && i === 1 && (
                                                <h3 className={`text-2xl font-serif text-center text-${currentTheme.accentColor}-500 mb-6 border-b ${borderStyle} pb-4`}>
                                                    塔罗指引
                                                </h3>
                                            )}
                                            <div className="prose prose-invert max-w-none leading-relaxed">
                                                {formatText(msg.content)}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading Indicator */}
                                {(isInterpreting || isFollowUpLoading) && (
                                    <div className="flex justify-start mb-6">
                                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                                            <div className={`w-4 h-4 border-2 border-${currentTheme.accentColor}-500 border-t-transparent rounded-full animate-spin`}></div>
                                            <span className="text-xs text-slate-400 animate-pulse">
                                                {isInterpreting ? "正在连接高维智慧..." : "Lumina 正在思考..."}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Spacer to prevent bottom input from blocking content */}
                                <div className="h-48 w-full flex-shrink-0"></div>
                                
                                {/* Invisible div to track scroll end */}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Sticky Bottom Input Bar */}
                            {!isInterpreting && (
                                <div className={`fixed bottom-0 left-0 w-full z-40 bg-slate-950/90 backdrop-blur-md border-t ${borderStyle} p-4`}>
                                    <div className="container mx-auto max-w-3xl flex gap-2">
                                        <input 
                                            type="text" 
                                            value={followUpInput}
                                            onChange={(e) => setFollowUpInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                                            placeholder="向塔罗师追问更多细节..."
                                            className={`flex-1 bg-slate-900 border border-slate-700 rounded-full px-6 py-3 text-sm focus:border-${currentTheme.accentColor}-500 focus:outline-none shadow-inner`}
                                        />
                                        <button 
                                            onClick={handleFollowUp}
                                            disabled={isFollowUpLoading}
                                            className={`w-12 h-12 flex items-center justify-center bg-${currentTheme.accentColor}-700 hover:bg-${currentTheme.accentColor}-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:scale-90 active:scale-95 shadow-lg shadow-${currentTheme.accentColor}-900/50`}
                                        >
                                            <span className="text-xl">➤</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </main>
    </div>
  );
};

export default App;