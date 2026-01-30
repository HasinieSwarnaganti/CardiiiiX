
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Message } from '../types';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm Vivitsu, your AI health assistant. How are you feeling today? Please describe any symptoms you're experiencing.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history including current message
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      chatHistory.push({ role: 'user', text: input });
      
      const response = await geminiService.analyzeSymptoms(chatHistory);
      const botMessage: Message = { 
        role: 'model', 
        text: response || "I'm sorry, I couldn't process that. Please try again.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Please check your Gemini API key and connection.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-4xl mx-auto shadow-sm border-x border-slate-200">
      {/* Header Info */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clinical Mode Active</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic">
          <Info size={12} />
          Emergency? Call 911 immediately.
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[85%] rounded-[1.5rem] p-5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="prose prose-slate max-w-none prose-sm text-inherit leading-relaxed">
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0 whitespace-pre-wrap">{line}</p>
                ))}
              </div>
              <div className={`text-[10px] mt-3 font-bold opacity-40 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-blue-600 animate-pulse" />
            </div>
            <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-200 rounded-tl-none flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm text-slate-500 font-black uppercase tracking-widest text-[10px]">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-slate-200 bg-white">
        <div className="flex gap-4 items-end bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your symptoms clearly..."
            className="flex-1 min-h-[44px] max-h-[150px] p-3 pl-5 bg-transparent outline-none resize-none text-slate-800 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 mb-0.5 mr-0.5"
          >
            <Send size={20} />
          </button>
        </div>
       
      </div>
    </div>
  );
};

export default ChatAssistant;
