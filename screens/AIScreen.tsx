
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
  "Dogs' sense of smell is 40 times better than ours.",
  "Luna might dream just like you do!",
  "A dog's nose print is as unique as a fingerprint.",
  "Cats can make over 100 different sounds."
];

const AIScreen: React.FC<AIProps> = ({ pet, timeline, documents, reminders }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi! I'm Pluto AI. Ask me anything about ${pet.name}'s health, documents, or scheduled care. ✨`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | undefined>();

  const randomFact = useMemo(() => PET_FACTS[Math.floor(Math.random() * PET_FACTS.length)], []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => console.log("Location access denied")
    );
  }, []);

  const handleSend = async (customInput?: string) => {
    const textToSend = (customInput || input).trim();
    if (!textToSend || isLoading) return;
    
    const userMsg: Message = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(textToSend, { 
        pet, timeline, documents, reminders, location: userLocation 
      });
      setMessages(prev => [...prev, { 
        role: 'ai', text: response.text, sources: response.sources, timestamp: new Date() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', text: "I hit a snag processing that. Try again?", timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isInputActive = input.trim().length > 0 && !isLoading;

  return (
    <div className="h-full relative overflow-hidden bg-[#FFFAF3] dark:bg-zinc-950">
      {/* Scrollable Message History - Adjusted padding for desktop to match lower input bar */}
      <div className="absolute inset-0 overflow-y-auto no-scrollbar pt-6 pb-96 md:pb-64 px-4 md:px-8 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2.2rem] shadow-sm transition-all border-2 ${
              msg.role === 'user' 
                ? 'bg-zinc-950 text-white border-zinc-900 rounded-br-none' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-bl-none shadow-md'
            }`}>
              <p className="text-[15px] md:text-[16px] font-bold leading-relaxed">{msg.text}</p>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <p className="text-[9px] font-black uppercase text-orange-600 tracking-widest">Map Results</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a key={sIdx} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 transition-all hover:scale-105 active:scale-95">
                        {src.title} <i className="fa-solid fa-external-link text-[8px]"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-2 px-4 opacity-60">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-md border border-zinc-100 dark:border-zinc-800 w-max animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} className="h-4" />
      </div>

      {/* Blended Interaction Bar - Brought lower on desktop (md:bottom-10) while keeping mobile okay (bottom-28) */}
      <div className="absolute bottom-28 md:bottom-10 left-0 right-0 p-4 md:p-8 z-40 bg-transparent">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Quick Actions - Suggestions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5 px-1">
            {["Last vaccine?", "Nearby Vets", "History"].map(action => (
              <button 
                key={action}
                onClick={() => handleSend(action)}
                className="px-6 py-3.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-950 dark:text-white rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl border-2 border-zinc-50 dark:border-zinc-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all hover:scale-110 active:scale-95 z-50"
              >
                {action}
              </button>
            ))}
          </div>
          
          {/* Main Input Field - Compact and unified */}
          <div className="relative">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder={randomFact}
                className={`w-full pl-7 pr-16 py-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-[4px] rounded-[2.5rem] outline-none transition-all duration-300 font-bold text-[15px] text-zinc-900 dark:text-zinc-50 shadow-2xl ${
                  input.length > 0 
                    ? 'border-orange-500' 
                    : 'border-white dark:border-zinc-900'
                }`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!isInputActive}
                className={`absolute right-3.5 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isInputActive 
                    ? 'bg-orange-500 text-white shadow-lg scale-110 rotate-0 hover:rotate-12 active:scale-90 active:rotate-45' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 scale-90 opacity-40'
                }`}
                aria-label="Send message"
              >
                <i className={`fa-solid fa-paper-plane text-sm ml-0.5 ${isInputActive ? 'animate-pulse' : ''}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScreen;
