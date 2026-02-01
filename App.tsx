
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Terminal, Cpu, Play, BookOpen, Sparkles, 
  ChevronRight, FileCode, Activity, BookText, Send, User, Bot, Trash2, 
  MessagesSquare, Image as ImageIcon, Loader2, Copy, Check, X, AlertCircle, 
  Zap, Wrench, RefreshCw, Camera, Paperclip, ShieldCheck, Key, ExternalLink,
  Globe, Lock, BookMarked, Search, HelpCircle, FileStack, ChevronLeft, Layers,
  Flame, Layout, Smartphone, Share2, Heart, GraduationCap, Trophy
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { tokenize } from './services/tokenizer';
import { Parser } from './services/parser';
import { Interpreter } from './services/interpreter';
import { MemoryValue } from './types';
import { HANDBOOK } from './constants';
import { WHOLE_BOOKLET_TEXT } from './services/bookletData';
import { PAST_PAPERS, PastPaper } from './services/pastPapersData';
import MemoryInspector from './components/MemoryInspector';
import SyllabusSidebar from './components/SyllabusSidebar';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  image?: string;
}

interface AuraFix {
  explanation: string;
  fixedCode: string;
}

type ConsoleTab = 'mushraf_board' | 'tutor_mushraf' | 'aura' | 'helper';
type MobileView = 'handbook' | 'editor' | 'console';

const STYLIZED_NAME = "꧁༒♛ 𝔐𝔲𝔰𝔥𝔯𝔞𝔣♛༒꧂";

const App: React.FC = () => {
  const [code, setCode] = useState(HANDBOOK[6].examples[0].code);
  const [logs, setLogs] = useState<string[]>([]);
  const [memory, setMemory] = useState<Record<string, MemoryValue>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>(HANDBOOK[6].id);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'bot', text: `Welcome to AURALEX. I am ${STYLIZED_NAME}. I've designed this system to help you master 9618 logic.` }
  ]);
  const [helperHistory, setHelperHistory] = useState<ChatMessage[]>([
    { role: 'bot', text: `Helper Active. Ask me anything about the AS Level syllabus!` }
  ]);
  const [userQuestion, setUserQuestion] = useState("");
  const [helperQuestion, setHelperQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isHelperTyping, setIsHelperTyping] = useState(false);
  const [auraFix, setAuraFix] = useState<AuraFix | null>(null);
  const [isAuraAnalyzing, setIsAuraAnalyzing] = useState(false);

  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [activeTab, setActiveTab] = useState<ConsoleTab>('mushraf_board');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1440);
  const [handbookWidth, setHandbookWidth] = useState(380);
  const [consoleWidth, setConsoleWidth] = useState(450);
  const [showBookletModal, setShowBookletModal] = useState(false);
  const [showPastPapersModal, setShowPastPapersModal] = useState(false);
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [paperMode, setPaperMode] = useState<'questions' | 'marking_key'>('questions');
  const [inputNeeded, setInputNeeded] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isShared, setIsShared] = useState(false);

  const currentSection = HANDBOOK.find(s => s.id === activeTopic);
  
  const isResizingHandbook = useRef(false);
  const isResizingConsole = useRef(false);
  const inputResolver = useRef<((val: string) => void) | null>(null);
  const boardEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const helperEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { boardEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);
  useEffect(() => { helperEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [helperHistory, isHelperTyping]);

  const handleScroll = () => {
    if (editorRef.current && highlightRef.current && gutterRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop;
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AURALEX | Mushraf 9618 IDE',
      text: 'Check out this amazing 9618 Pseudocode IDE built by Mushraf!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const runCode = async (source: string) => {
    setIsRunning(true);
    setErrorLine(null);
    setAuraFix(null);
    setLogs([`🖥️ Initializing Mushraf-Logic-Board...`]);
    setMemory({});
    if (window.innerWidth < 1024) setMobileView('console');
    
    try {
      const tokens = tokenize(source);
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const interpreter = new Interpreter(
        (name) => new Promise(resolve => {
          setInputNeeded(name);
          inputResolver.current = resolve;
        }),
        (msg) => setLogs(prev => [...prev, `> ${msg}`])
      );
      
      const updateMemory = () => setMemory({ ...interpreter.memory });
      const interval = setInterval(updateMemory, 100);
      await interpreter.run(ast);
      clearInterval(interval);
      updateMemory();
      setLogs(prev => [...prev, "✨ Logic Execution Complete."]);
    } catch (err: any) {
      setLogs(prev => [...prev, `❌ ${err.message}`]);
      const lineMatch = err.message.match(/line (\d+)/i);
      setErrorLine(lineMatch ? parseInt(lineMatch[1]) : null);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzeWithAura = async () => {
    if (!process.env.API_KEY || !errorLine) return;
    setIsAuraAnalyzing(true);
    setActiveTab('aura');
    if (window.innerWidth < 1024) setMobileView('console');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `I am using the AURALEX IDE by Mushraf. There is an error on line ${errorLine}. Please explain and fix this code:\n${code}`,
        config: { 
          responseMimeType: "application/json", 
          responseSchema: {
            type: Type.OBJECT,
            properties: { explanation: { type: Type.STRING }, fixedCode: { type: Type.STRING } },
            required: ["explanation", "fixedCode"]
          }
        }
      });
      const result = JSON.parse(response.text || "{}");
      setAuraFix(result);
    } catch (err) {
      setAuraFix({ explanation: "Connection to AURA core failed. Check your API link.", fixedCode: code });
    } finally {
      setIsAuraAnalyzing(false);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingHandbook.current) {
      const sidebarWidth = isSidebarCollapsed ? 64 : 256;
      const newWidth = e.clientX - sidebarWidth;
      if (newWidth > 150 && newWidth < window.innerWidth * 0.4) setHandbookWidth(newWidth);
    }
    if (isResizingConsole.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 150 && newWidth < window.innerWidth * 0.4) setConsoleWidth(newWidth);
    }
  }, [isSidebarCollapsed]);

  const stopResizing = useCallback(() => {
    isResizingHandbook.current = false;
    isResizingConsole.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const startResizingHandbook = () => {
    isResizingHandbook.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  };

  const startResizingConsole = () => {
    isResizingConsole.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  };

  const injectCode = (newCode: string) => {
    setCode(newCode);
    setLogs(["⚡ Logic Refreshed."]);
    setMemory({});
    setErrorLine(null);
    setAuraFix(null);
    if (window.innerWidth < 1024) setMobileView('editor');
  };

  const handleChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userQuestion.trim() && !selectedImage) return;
    const q = userQuestion;
    const img = selectedImage;
    setUserQuestion("");
    setSelectedImage(null);
    setChatHistory(prev => [...prev, { role: 'user', text: q, image: img || undefined }]);
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const parts: any[] = [{ text: `You are Tutor Mushraf. Help the student with 9618 AS Level CS. Use this booklet: ${WHOLE_BOOKLET_TEXT}. Question: ${q}` }];
      if (img) parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/jpeg' } });
      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts } });
      setChatHistory(prev => [...prev, { role: 'bot', text: response.text || "Neural link timed out." }]);
    } catch { setChatHistory(prev => [...prev, { role: 'bot', text: "Error connecting to Mushraf-AI." }]); }
    finally { setIsTyping(false); }
  };

  const handleHelperChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!helperQuestion.trim()) return;
    const q = helperQuestion;
    setHelperQuestion("");
    setHelperHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsHelperTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: `You are HELPER AI. Based on Mushraf's 9618 Booklet: ${WHOLE_BOOKLET_TEXT}. Question: ${q}` 
      });
      setHelperHistory(prev => [...prev, { role: 'bot', text: response.text || "Data stream interrupted." }]);
    } catch { setHelperHistory(prev => [...prev, { role: 'bot', text: "Helper Core Offline." }]); }
    finally { setIsHelperTyping(false); }
  };

  const renderCode = (text: string) => {
    const rules = [
      { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, color: '#475569' },
      { regex: /"([^"]*)"|'([^']*)'/g, color: '#34d399' },
      { regex: /\b(DECLARE|CONSTANT|TYPE|ENDTYPE|INPUT|OUTPUT|IF|THEN|ELSE|ENDIF|CASE|OF|OTHERWISE|ENDCASE|FOR|TO|STEP|NEXT|WHILE|DO|ENDWHILE|REPEAT|UNTIL|PROCEDURE|ENDPROCEDURE|FUNCTION|RETURNS|RETURN|CALL|BYREF|BYVAL|ARRAY|OF|INTEGER|REAL|STRING|BOOLEAN|CHAR|DATE|TRUE|FALSE|DIV|MOD|AND|OR|NOT)\b/gi, color: '#818cf8' },
      { regex: /\b\d+(\.\d+)?\b/g, color: '#fb923c' },
      { regex: /(←|<-|<>|<=|>=|<|>|=|\+|\-|\*|\/|\^|&)/g, color: '#22d3ee' }
    ];
    return text.split('\n').map((line, i) => {
      let escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let matches: any[] = [];
      rules.forEach(rule => {
        let m; const re = new RegExp(rule.regex.source, rule.regex.flags);
        while ((m = re.exec(escaped)) !== null) {
          if (!matches.some(p => (m!.index >= p.start && m!.index < p.end))) {
            matches.push({ start: m.index, end: re.lastIndex, color: rule.color, content: m[0] });
          }
        }
      });
      matches.sort((a, b) => a.start - b.start);
      let lastIndex = 0; let chunks = [];
      matches.forEach((m, idx) => {
        if (m.start > lastIndex) chunks.push(escaped.slice(lastIndex, m.start));
        chunks.push(<span key={idx} style={{ color: m.color }}>{m.content}</span>);
        lastIndex = m.end;
      });
      if (lastIndex < escaped.length) chunks.push(escaped.slice(lastIndex));
      return (
        <div key={i} className={`flex min-h-[1.5rem] ${errorLine === i + 1 ? 'bg-rose-500/20' : ''}`}>
          {chunks.length > 0 ? chunks : <span>&nbsp;</span>}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-sans border-t-2 border-cyan-500/20">
      <SyllabusSidebar sections={HANDBOOK} activeTopic={activeTopic} onSelectTopic={handleSidebarSelect} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-4 lg:gap-6 overflow-hidden">
            <button onClick={() => setIsSidebarCollapsed(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-cyan-400"><Layout size={20} /></button>
            <div onClick={() => setShowFounderModal(true)} className="cursor-pointer group">
              <span className="text-[12px] lg:text-[14px] font-black mushraf-stylized uppercase tracking-tight whitespace-nowrap">{STYLIZED_NAME}</span>
              <div className="hidden lg:block text-[8px] font-black text-cyan-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Founder Profile</div>
            </div>
            <div className="hidden lg:block h-4 w-px bg-slate-800" />
            <div className="flex gap-1.5 lg:gap-2">
              <button onClick={() => setShowBookletModal(true)} className="flex items-center gap-2 px-2.5 lg:px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:border-indigo-400/50 transition-all">
                <BookMarked size={12} /> <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest">Booklet</span>
              </button>
              <button onClick={() => setShowPastPapersModal(true)} className="btn-fire flex items-center gap-2 px-2.5 lg:px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg">
                <Flame size={14} className="fill-amber-200" /> <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Papers</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
             <button onClick={handleShare} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isShared ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {isShared ? <Check size={14} /> : <Share2 size={14} />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{isShared ? 'Copied' : 'Share App'}</span>
             </button>
            <button onClick={() => runCode(code)} disabled={isRunning} className="px-4 lg:px-6 py-1.5 rounded-full bg-cyan-600 text-white text-[10px] lg:text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-950/20">
              <Play size={12} className="inline mr-2" fill="currentColor" /> <span className="hidden xs:inline">Run Logic</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className={`${mobileView === 'handbook' ? 'flex' : 'hidden'} lg:flex flex-col border-r border-slate-800 bg-slate-900/5 overflow-y-auto p-4 lg:p-6 shrink-0 transition-all`} style={{ width: window.innerWidth >= 1024 ? `${handbookWidth}px` : '100%' }}>
            {currentSection && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">{currentSection.title}</h2>
                <p className="text-slate-400 text-[11px] lg:text-xs leading-relaxed">{currentSection.content}</p>
                <div className="space-y-4">
                  {currentSection.examples.map((ex, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800/60 bg-black/20 group hover:border-cyan-500/40 transition-all">
                      <div className="flex justify-between mb-3 border-b border-slate-800/40 pb-2">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ex.title}</h4>
                        <button onClick={() => injectCode(ex.code)} className="text-[10px] text-cyan-400 underline font-black uppercase">Load Module</button>
                      </div>
                      <pre className="text-[10px] lg:text-[11px] font-mono text-slate-400 bg-black/40 p-3 rounded-lg border border-slate-800/40 overflow-x-auto">{ex.code}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-8 flex items-center gap-3 opacity-40">
                <GraduationCap size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Built for 9618 Excellence</span>
            </div>
          </div>
          
          <div onMouseDown={startResizingHandbook} className="hidden lg:block w-1 cursor-col-resize hover:bg-cyan-500/40 transition-colors z-30" />

          <div className={`flex-1 flex flex-col min-w-0 bg-slate-950/20 relative ${mobileView !== 'editor' && 'hidden lg:flex'}`}>
            <div className="flex-1 flex overflow-hidden font-mono text-[13px] lg:text-[14px] leading-[1.5rem]">
              <div ref={gutterRef} className="w-10 lg:w-12 flex flex-col items-end px-2 lg:px-3 py-6 bg-slate-900/20 border-r border-slate-800/40 text-slate-700 overflow-hidden">
                {code.split('\n').map((_, i) => <div key={i} className={errorLine === i + 1 ? 'text-rose-500 font-bold' : ''}>{i + 1}</div>)}
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-0 p-4 lg:p-6 pointer-events-none whitespace-pre overflow-hidden z-0 font-mono">
                  {renderCode(code)}
                </div>
                <textarea ref={editorRef} value={code} onChange={e => { setCode(e.target.value); setErrorLine(null); }} onScroll={handleScroll} spellCheck={false} className="absolute inset-0 w-full h-full bg-transparent p-4 lg:p-6 font-mono text-transparent caret-white resize-none focus:outline-none z-10 overflow-auto whitespace-pre" />
              </div>
            </div>
            <div className="h-8 flex items-center justify-between px-6 bg-slate-900/40 border-t border-slate-800 text-[10px] font-bold text-slate-500">
                <div className="flex gap-4">
                    <span>LINES: {code.split('\n').length}</span>
                    <span>CHARS: {code.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="uppercase tracking-widest">Logic Engine Stable</span>
                </div>
            </div>
          </div>

          <div onMouseDown={startResizingConsole} className="hidden lg:block w-1 cursor-col-resize hover:bg-cyan-500/40 transition-colors z-30" />

          <div className={`${mobileView === 'console' ? 'flex' : 'hidden'} lg:flex flex-col border-l border-slate-800 bg-[#020617] shrink-0`} style={{ width: window.innerWidth >= 1024 ? `${consoleWidth}px` : '100%' }}>
            <div className="h-10 flex border-b border-slate-800 bg-slate-900/40 shrink-0">
              <button onClick={() => setActiveTab('mushraf_board')} className={`flex-1 text-[9px] font-black uppercase tracking-widest ${activeTab === 'mushraf_board' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600'}`}>BOARD</button>
              <button onClick={() => setActiveTab('tutor_mushraf')} className={`flex-1 text-[9px] font-black uppercase tracking-widest ${activeTab === 'tutor_mushraf' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600'}`}>TUTOR</button>
              <button onClick={() => setActiveTab('helper')} className={`flex-1 text-[9px] font-black uppercase tracking-widest ${activeTab === 'helper' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-600'}`}>HELPER</button>
              {errorLine && <button onClick={() => setActiveTab('aura')} className={`flex-1 text-[9px] font-black uppercase text-amber-500 animate-pulse bg-amber-500/10`}>AURA</button>}
            </div>
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeTab === 'mushraf_board' ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in">
                  <div className="h-[45%] flex flex-col border-b border-slate-800">
                    <div className="h-6 flex items-center px-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">REAL-TIME CONSOLE</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1 bg-black/30 custom-scrollbar">
                      {logs.map((log, i) => <div key={i} className={log.includes('❌') ? 'text-rose-400' : 'text-slate-500'}>{log}</div>)}
                      {errorLine && <button onClick={analyzeWithAura} className="mt-2 flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] rounded-lg font-black uppercase shadow-xl hover:bg-amber-500/30 transition-all"><Zap size={10} fill="currentColor" /> Analyze with AURA</button>}
                      {inputNeeded && (
                        <div className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/40 rounded-xl shadow-2xl">
                          <p className="text-[9px] text-cyan-500 font-black uppercase mb-2 tracking-widest">Input: {inputNeeded}</p>
                          <div className="flex gap-2">
                            <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && inputResolver.current?.(inputValue)} className="flex-1 bg-black border border-slate-700 rounded-lg px-3 text-white outline-none focus:border-cyan-500" />
                            <button onClick={() => { inputResolver.current?.(inputValue); setInputNeeded(null); setInputValue(""); }} className="bg-cyan-600 px-4 rounded-lg text-[10px] font-bold">OK</button>
                          </div>
                        </div>
                      )}
                      <div ref={boardEndRef} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-6 flex items-center px-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">TRACE TABLE / MEMORY</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar"><MemoryInspector memory={memory} /></div>
                  </div>
                </div>
              ) : activeTab === 'aura' ? (
                <div className="flex-1 flex flex-col p-6 overflow-hidden bg-slate-950/40">
                  {isAuraAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-amber-500 animate-pulse"><RefreshCw size={32} className="animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest">Healing Logic Core...</span></div>
                  ) : auraFix ? (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Aura Analysis</span><button onClick={() => { setCode(auraFix.fixedCode); setAuraFix(null); setErrorLine(null); }} className="px-4 py-2 bg-amber-500 text-black text-[10px] font-black rounded-lg uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">Fix Code</button></div>
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-xs shadow-lg whitespace-pre-wrap leading-relaxed">{auraFix.explanation}</div>
                      <div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-auto custom-scrollbar text-slate-400">{auraFix.fixedCode}</div>
                    </div>
                  ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-800 uppercase text-[9px] tracking-widest">Aura Core Standing By</div>}
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                    {(activeTab === 'tutor_mushraf' ? chatHistory : helperHistory).map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl text-[13px] max-w-[85%] shadow-xl ${m.role === 'user' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20'}`}>
                          {m.image && <img src={m.image} className="rounded-lg mb-3 border border-slate-700 w-full" />}
                          <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                        </div>
                      </div>
                    ))}
                    {(isTyping || isHelperTyping) && <div className="p-4 bg-slate-800/40 text-[10px] animate-pulse rounded-lg mx-5 text-slate-500 uppercase tracking-widest">Processing Question...</div>}
                    <div ref={activeTab === 'tutor_mushraf' ? chatEndRef : helperEndRef} />
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-900/40 backdrop-blur-md">
                    {selectedImage && <div className="mb-2 w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/40 shadow-xl"><img src={selectedImage} className="w-full h-full object-cover" /></div>}
                    <form onSubmit={activeTab === 'tutor_mushraf' ? handleChat : handleHelperChat} className="flex gap-2">
                      {activeTab === 'tutor_mushraf' && <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"><Camera size={18} /></button>}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setSelectedImage(ev.target?.result as string); r.readAsDataURL(f); } }} className="hidden" />
                      <input value={activeTab === 'tutor_mushraf' ? userQuestion : helperQuestion} onChange={e => activeTab === 'tutor_mushraf' ? setUserQuestion(e.target.value) : setHelperQuestion(e.target.value)} placeholder={activeTab === 'tutor_mushraf' ? "Ask Mushraf AI..." : "Ask Syllabus Helper..." } className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500/50 transition-all" />
                      <button type="submit" disabled={isTyping || isHelperTyping} className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all"><Send size={18} /></button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden h-16 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl flex items-center justify-around px-2 z-30 shrink-0">
          <button onClick={() => setMobileView('handbook')} className={`flex flex-col items-center gap-1 flex-1 ${mobileView === 'handbook' ? 'text-cyan-400' : 'text-slate-500'}`}><BookOpen size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Docs</span></button>
          <button onClick={() => setMobileView('editor')} className={`flex flex-col items-center gap-1 flex-1 ${mobileView === 'editor' ? 'text-cyan-400' : 'text-slate-500'}`}><Smartphone size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Code</span></button>
          <button onClick={() => setMobileView('console')} className={`flex flex-col items-center gap-1 flex-1 ${mobileView === 'console' ? 'text-cyan-400' : 'text-slate-500'}`}><Terminal size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Board</span></button>
          <button onClick={() => { setMobileView('console'); setActiveTab('tutor_mushraf'); }} className={`flex flex-col items-center gap-1 flex-1 ${mobileView === 'console' && activeTab === 'tutor_mushraf' ? 'text-indigo-400' : 'text-slate-500'}`}><Bot size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Tutor</span></button>
        </div>
      </main>

      {/* MODALS */}
      {showFounderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/95 backdrop-blur-2xl animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-[0_0_100px_rgba(34,211,238,0.2)]">
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-1 animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        <User size={64} className="text-white" />
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-slate-900 shadow-xl">
                    <ShieldCheck size={20} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black mushraf-stylized mb-4">{STYLIZED_NAME}</h2>
              <div className="flex gap-2 mb-8">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase tracking-widest">Lead Architect</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-widest">9618 Expert</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-10 opacity-90 max-w-md">
                "I created AURALEX because I believe logic is a superpower. Every student deserves a professional workspace to build their dreams. Use this tool, share it with your peers, and let's ace 9618 together."
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                 <div className="p-4 rounded-3xl bg-slate-800/40 border border-slate-700/50">
                    <Trophy className="text-amber-500 mb-2 mx-auto" size={24} />
                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Mission</div>
                    <div className="text-xs font-bold text-slate-200">AS Excellence</div>
                 </div>
                 <div className="p-4 rounded-3xl bg-slate-800/40 border border-slate-700/50">
                    <Globe className="text-cyan-500 mb-2 mx-auto" size={24} />
                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Reach</div>
                    <div className="text-xs font-bold text-slate-200">Global AS Students</div>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <button onClick={() => setShowFounderModal(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Back to Board</button>
                 <button onClick={handleShare} className="flex-1 py-4 bg-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-900/40 hover:bg-cyan-500 transition-all flex items-center justify-center gap-3">
                   <Share2 size={16} /> Share My Vision
                 </button>
              </div>
           </div>
        </div>
      )}

      {showBookletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <h2 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-cyan-400">9618 Master Syllabus Booklet</h2>
              <button onClick={() => setShowBookletModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-slate-950/40">
              <div className="max-w-3xl mx-auto space-y-12">
                {WHOLE_BOOKLET_TEXT.split('---').map((s, i) => s.trim() && (
                  <section key={i} className="space-y-4 border-l-2 border-cyan-500/30 pl-4 lg:pl-6">
                    <h3 className="text-cyan-400 font-black text-base lg:text-lg uppercase tracking-tight">{s.trim().split('\n')[0]}</h3>
                    <div className="text-slate-300 text-[13px] lg:text-sm leading-relaxed whitespace-pre-line font-mono opacity-90">{s.trim().split('\n').slice(1).join('\n')}</div>
                  </section>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© Mushraf Academic Publishing 2025</p>
            </div>
          </div>
        </div>
      )}

      {showPastPapersModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-64 border-b lg:border-r border-slate-800 flex flex-col bg-slate-900/60 shrink-0 h-[30%] lg:h-full">
              <div className="p-4 border-b border-slate-800"><h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Syllabus Papers</h3></div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {PAST_PAPERS.map(p => (
                  <button key={p.id} onClick={() => { setSelectedPaper(p); setPaperMode('questions'); }} className={`w-full text-left p-3 rounded-xl transition-all border ${selectedPaper?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-transparent hover:bg-white/5'}`}>
                    <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-black uppercase text-slate-500">{p.year}</span></div>
                    <h4 className="text-xs font-bold text-slate-200 leading-tight">{p.title}</h4>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
              <header className="h-14 lg:h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/40 shrink-0">
                {selectedPaper && (
                  <div className="flex bg-black/40 rounded-lg p-1 border border-slate-800">
                    <button onClick={() => setPaperMode('questions')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase ${paperMode === 'questions' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40' : 'text-slate-500'}`}>Questions</button>
                    <button onClick={() => setPaperMode('marking_key')} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase ${paperMode === 'marking_key' ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/40' : 'text-slate-500'}`}>Marking Key</button>
                  </div>
                )}
                <button onClick={() => { setShowPastPapersModal(false); setSelectedPaper(null); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                {!selectedPaper ? <div className="h-full flex flex-col items-center justify-center opacity-50"><FileStack size={48} /><p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Papers Ready for Analysis</p></div> : (
                  <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-2">
                    <h2 className="text-lg lg:text-xl font-bold text-white border-b border-slate-800 pb-4">{selectedPaper.title}</h2>
                    {(paperMode === 'questions' ? selectedPaper.content.questions : selectedPaper.content.markingKey).map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${paperMode === 'questions' ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
                        <div className="flex gap-4"><div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${paperMode === 'questions' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>{idx + 1}</div><p className="text-[13px] lg:text-sm text-slate-300 font-mono py-1 leading-relaxed">{item}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleSidebarSelect(id: string) {
    setActiveTopic(id);
    const s = HANDBOOK.find(x => x.id === id);
    if (s?.examples.length) injectCode(s.examples[0].code);
    if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
  }
};

export default App;
