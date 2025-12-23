
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PetProfile, TimelineEntry, PetDocument, Reminder } from '../types';
import { getAIResponse } from '../services/geminiService';

interface AIProps {
  pet: PetProfile;
  timeline: TimelineEntry[];
  documents: PetDocument[];
  reminders: Reminder[];
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  sources?: { title: string; uri: string }[];
  timestamp: Date;
}

const PET_FACTS = [
  "Did you know? Dogs' sense of smell is 40 times better than ours.",
  "Luna might dream just like you do!",
  "A dog's nose print is as unique as a human fingerprint.",
  "Cats can make over 100 different sounds."
];

const AIScreen: React.FC<AIProps> = ({ pet, timeline, documents, reminders }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi! I'm Pluto AI. Ask me anything about ${pet.name}'s care history or nearby services. ✨`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | undefined>();

  const randomFact = useMemo(() => PET_FACTS[Math.floor(Math.random() * PET_FACTS.length)], []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => console.log("Location access denied")
    );
  }, []);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getAIResponse(textToSend, { pet, timeline, documents, reminders, location: userLocation });
    setMessages(prev => [...prev, { role: 'ai', text: response.text, sources: response.sources, timestamp: new Date() }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Messages List - Scrollable behind footer */}
      <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-12 no-scrollbar pb-60">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
            <div className={`max-w-[88%] md:max-w-[75%] p-5 md:p-7 rounded-[2rem] shadow-xl transition-all hover:translate-y-[-2px] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-br-none shadow-orange-500/20' 
                : 'bg-white dark:bg-zinc-900 border border-orange-50/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
            }`}>
              <p className="text-[15px] md:text-[17px] font-bold leading-relaxed">{msg.text}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-6 pt-5 border-t border-orange-100/50 dark:border-zinc-800 space-y-3">
                  <p className="text-[9px] font-black uppercase text-orange-500 dark:text-orange-400 tracking-[0.2em] flex items-center gap-2">
                    <i className="fa-solid fa-location-dot"></i> Grounding Results
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a key={sIdx} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:border-orange-400 hover:bg-orange-50/30 transition-all group/source">
                        <span className="text-[11px] font-bold truncate dark:text-zinc-200">{src.title}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-zinc-400 group-hover/source:text-orange-500 transition-colors"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 px-3">
              <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.role === 'ai' && <i className="fa-solid fa-check-double text-[8px] text-emerald-500"></i>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-[1.5rem] rounded-bl-none shadow-lg border border-orange-50/50 dark:border-zinc-800 w-max animate-pulse">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pluto is thinking...</span>
          </div>
        )}
        <div ref={scrollRef} className="h-10" />
      </div>

      {/* Input & Suggestions - REFINED FROSTED STYLE */}
      <div className="px-5 pb-32 pt-4 md:px-12 md:pb-12 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-3xl border-t border-white/20 dark:border-zinc-800/40 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mx-1">
            <SuggestionChip text="Last Vaccine?" onClick={() => handleSend("When was Luna's last vaccination?")} icon="syringe" />
            <SuggestionChip text="Nearby Vets" onClick={() => handleSend("Find some highly rated vet clinics nearby.")} icon="stethoscope" />
            <SuggestionChip text="History" onClick={() => handleSend("Can you summarize Luna's recent health history?")} icon="scroll" />
          </div>
          
          <div className="relative group/input">
            <input 
              type="text" 
              placeholder={randomFact}
              className="w-full pl-7 pr-16 py-5 bg-white/60 dark:bg-zinc-900/60 border-2 border-white/50 dark:border-zinc-800 focus:border-orange-500 dark:focus:border-orange-500 rounded-[2.2rem] outline-none transition-all font-bold text-base dark:text-zinc-50 shadow-2xl focus:shadow-orange-500/10"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 active:scale-90 hover:scale-110' 
                  : 'bg-white/40 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestionChip: React.FC<{ text: string, onClick: () => void, icon: string }> = ({ text, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-900/80 border-2 border-white/40 dark:border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-orange-500 hover:text-white hover:border-white transition-all shadow-xl active:scale-95 whitespace-nowrap group/chip"
  >
    <i className={`fa-solid fa-${icon} text-[10px] opacity-70 group-hover/chip:scale-110`}></i>
    {text}
  </button>
);

export default AIScreen;
