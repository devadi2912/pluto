
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
  "Cats can make over 100 different sounds.",
  "Luna's whiskers help her 'see' in the dark.",
  "Dog years aren't exactly 7 per human year—it varies by size!",
  "A wagging tail doesn't always mean a dog is happy."
];

const AIScreen: React.FC<AIProps> = ({ pet, timeline, documents, reminders }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: `Woof! I'm your Pluto AI. Ask me anything about ${pet.name}'s care history, or let me find nearby stores and daycares!`, 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | undefined>();

  const randomFact = useMemo(() => PET_FACTS[Math.floor(Math.random() * PET_FACTS.length)], []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => console.log("Location access denied")
    );
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getAIResponse(input, {
      pet,
      timeline,
      documents,
      reminders,
      location: userLocation
    });

    const aiMsg: Message = { 
      role: 'ai', 
      text: response.text, 
      sources: response.sources,
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FFFAF3] dark:bg-zinc-950">
      {/* Header */}
      <div className="p-6 border-b-2 border-orange-50 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold font-lobster text-orange-600 dark:text-orange-400 tracking-wide">Pluto AI</h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Intelligent Care Companion</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse border-2 border-white/20">
          <i className="fa-solid fa-sparkles text-xl"></i>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-8">
        {messages.map((msg, idx) => {
          const isMapResult = msg.sources && msg.sources.length > 0;
          
          return (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[90%] p-5 rounded-[2rem] shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-zinc-900 border-2 border-orange-50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-bl-none'
              }`}>
                <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {isMapResult && (
                  <div className="mt-4 pt-4 border-t border-orange-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 mb-3 tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-location-dot"></i>
                      Nearby Care & Services
                    </p>
                    <div className="space-y-2">
                      {msg.sources!.map((src, sIdx) => (
                        <a 
                          key={sIdx} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-shop text-[10px]"></i>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{src.title}</span>
                          </div>
                          <i className="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-black mt-2 px-2 uppercase tracking-widest">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-[1.5rem] rounded-bl-none shadow-md border border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Section - Removed Sticky to avoid footer overlap */}
      <div className="p-6 pt-2 pb-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          <SuggestionChip text="Pet Stores" onClick={() => setInput("Find some top-rated pet stores nearby.")} color="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-100 dark:border-orange-900/50" />
          <SuggestionChip text="Daycares" onClick={() => setInput("Are there any pet daycares or boarding centers nearby?")} color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50" />
          <SuggestionChip text="Nearby Vets" onClick={() => setInput("Find some nearby vet clinics for Luna.")} color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" />
          <SuggestionChip text="Last Vaccine?" onClick={() => setInput("When was the last vaccination?")} color="bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 border-pink-100 dark:border-pink-900/50" />
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder={randomFact}
            className="w-full pl-6 pr-14 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-orange-400 dark:focus:border-orange-500 rounded-[2rem] outline-none transition-all font-bold dark:text-zinc-50 text-zinc-900 shadow-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading 
                ? 'bg-orange-500 text-white shadow-lg active:scale-90' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'
            }`}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const SuggestionChip: React.FC<{ text: string, onClick: () => void, color: string }> = ({ text, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 ${color} text-[10px] font-black rounded-xl whitespace-nowrap border active:scale-95 transition-all shadow-sm uppercase tracking-widest`}
  >
    {text}
  </button>
);

export default AIScreen;
