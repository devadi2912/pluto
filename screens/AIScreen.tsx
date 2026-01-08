
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

// Demo Data Logic for suggested prompts
const getDemoResponse = (query: string, petName: string, petBreed: string) => {
  const normalized = query.toLowerCase();
  const breed = petBreed.toLowerCase();
  
  if (normalized.includes('vaccine')) {
      return {
          text: `Checking records for ${petName}... 🩺\n\nFound it! The last **Core Vaccine (DHPP)** was administered on **August 14th**.\n\nThe next **Rabies** booster is due in roughly 3 months. I also noticed a flea prevention reminder coming up next Tuesday. Would you like me to snooze that for you?`,
          sources: []
      };
  }
  
  if (normalized.includes('nearby') || normalized.includes('vets')) {
      return {
          text: `I've scanned the area for top-rated veterinary care. Here are the best options near you:\n\n**1. City Paws Medical Center** (0.8 mi) \n*Best for routine checkups. Open until 6 PM.*\n\n**2. The Friendly Vet** (1.2 mi)\n*Highly rated for grooming services.*\n\n**3. 24/7 Emergency Animal Hospital** (2.5 mi)\n*Available now for urgent care.*`,
          sources: [
              { title: "City Paws Medical", uri: "https://www.google.com/maps/search/City+Paws+Medical+Center" },
              { title: "The Friendly Vet", uri: "https://www.google.com/maps/search/The+Friendly+Vet" },
              { title: "24/7 Emergency", uri: "https://www.google.com/maps/search/24%2F7+Emergency+Animal+Hospital" }
          ]
      };
  }

  if (normalized.includes('groomer') || normalized.includes('grooming')) {
      return {
          text: `I found some top-rated groomers near you! ✂️\n\n**1. Paws & Bubbles Spa** (0.5 mi)\n*Full service spa. Open until 7 PM.*\n\n**2. The Fluffy Dog Salon** (1.2 mi)\n*Mobile grooming available.*\n\n**3. Golden Shears Pet Styling** (2.0 mi)\n*Great reviews for sensitive skin.*`,
          sources: [
              { title: "Paws & Bubbles", uri: "https://www.google.com/maps/search/Paws+Bubbles+Spa" },
              { title: "The Fluffy Dog", uri: "https://www.google.com/maps/search/The+Fluffy+Dog+Salon" },
              { title: "Golden Shears", uri: "https://www.google.com/maps/search/Golden+Shears+Pet+Styling" }
          ]
      };
  }

  if (normalized.includes('emergency')) {
      return {
          text: `🚨 **EMERGENCY CONTACTS** 🚨\n\nHere are important numbers to call right now:\n\n📞 **Primary Vet (24/7):** (555) 123-4567\n\n📞 **Animal Poison Control:** (888) 426-4435\n\n📞 **Pet Ambulance:** (555) 987-6543\n\nStay calm. I'm here if you need directions to the nearest hospital.`,
          sources: []
      };
  }
  
  if (normalized.includes('history')) {
      return {
          text: `Here is a summary of ${petName}'s recent health timeline:\n\n• **Yesterday:** Activity goal reached (100%!) 🎉\n• **Last Week:** Uploaded 'Lab Results - Bloodwork' 📄\n• **Oct 12:** Annual Wellness Exam (Weight: Healthy) 🏥\n\nEverything looks stable. No missed medications in the last 30 days!`,
          sources: []
      };
  }

  if (normalized.includes('guide')) {
    let specificTips = "";

    // Breed specific customization
    if (breed.includes('labrador')) {
        specificTips = `🐕 **Labrador Specifics:**\n- **Chewing:** Labs destroy weak toys. Invest in extreme-duty rubber toys.\n- **Diet:** They love food! Watch calories strictly to prevent joint issues.\n- **Energy:** They need serious fetch time, not just walks.`;
    } else if (breed.includes('golden') || breed.includes('retriever')) {
        specificTips = `🐕 **Golden Retriever Specifics:**\n- **Grooming:** Brush daily! They shed heavily. Pay attention to mats behind ears.\n- **Social:** They need people. Don't leave them alone for long periods.\n- **Mouthiness:** They love carrying things. Provide soft plush toys.`;
    } else if (breed.includes('pug')) {
        specificTips = `🐕 **Pug Specifics:**\n- **Breathing:** No heavy exercise in heat. Keep them cool.\n- **Hygiene:** Clean facial folds daily to prevent infection.\n- **Eyes:** Watch for scratching; their eyes are vulnerable.`;
    } else if (breed.includes('shitzu') || breed.includes('shihtzu') || breed.includes('shih tzu')) {
        specificTips = `🐕 **Shih Tzu Specifics:**\n- **Grooming:** High maintenance coat. Daily brushing is mandatory.\n- **Eyes:** Keep hair trimmed away from eyes.\n- **Activity:** Great indoor pets, short walks suffice.`;
    } else if (breed.includes('dashund') || breed.includes('dachshund') || breed.includes('sausage')) {
        specificTips = `🐕 **Dachshund Specifics:**\n- **BACK HEALTH:** **Crucial!** No jumping on/off furniture. Use ramps.\n- **Training:** Can be stubborn. Use high-value treats.\n- **Digging:** It's in their nature. Provide a dig pit or blankets.`;
    } else {
        specificTips = `🐕 **Breed Specifics:**\n- Tailor exercise to ${petName}'s energy level.\n- Research specific genetic health traits for ${petBreed || 'their breed'}.`;
    }

    return {
        text: `Here is your **Ultimate New Pet Guide** for ${petName}! 📘\n\n${specificTips}\n\n**1. The "Before They Arrive" Checklist**\n- **Pet-Proofing:** Hide toxic plants (lilies!), secure electrical cords, and remove small choking hazards.\n- **Shopping Essentials:** Stainless steel bowls, crate/bed, ID tag, and ${breed.includes('dashund') ? 'a harness (protect the neck!)' : 'a sturdy collar'}.\n- **Budgeting:** Plan for food, insurance, and an emergency fund.\n\n**2. The First 24 Hours**\n- **The Safe Zone:** Set up a quiet corner so ${petName} doesn't get overwhelmed.\n- **Routine:** Feed and walk at the exact same time daily to build trust.\n- **Vet Visit:** Book a "Wellness Check" within 72 hours.\n\n**3. Health & Maintenance**\n- **Schedule:** Track vaccines, flea/tick meds, and heartworm prevention here in Pluto.\n- **Grooming:** Trim nails regularly. **Brush teeth early**—it adds years to their life!\n- **Red Flags:** Call the vet for lethargy, not eating, or sudden behavior changes.\n\n**4. Training & Socialization**\n- **Positive Reinforcement:** Treats > Scolding. Reward good behavior immediately.\n- **Potty Training:** Consistency is key. Take them out after eating, sleeping, or playing.\n- **Socialization:** Introduce new people/sounds safely (crucial if under 16 weeks).\n\n**5. Emergency Preparedness**\n- **Kit:** Gauze, antiseptic, extra leash, and medical records.\n- **Contacts:** Save the nearest 24/7 Emergency Vet address in your phone now.`,
        sources: []
    };
  }
  
  return null;
};

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

    // DEMO INTERCEPTION
    // Check if the input matches our demo prompts to provide a seamless presentation experience
    const demoResponse = getDemoResponse(textToSend, pet.name, pet.breed);
    
    if (demoResponse) {
      // Simulate a natural thinking delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: demoResponse.text, 
          sources: demoResponse.sources, 
          timestamp: new Date() 
        }]);
        setIsLoading(false);
      }, 1500);
      return; 
    }

    // Fallback to real AI if not a demo prompt
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
              <p className="text-[15px] md:text-[16px] font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
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
            {["Guide", "Last vaccine?", "Nearby Vets", "Nearby Groomers", "Emergency", "History"].map(action => (
              <button 
                key={action}
                onClick={() => handleSend(action)}
                className={`px-6 py-3.5 backdrop-blur-md text-zinc-950 dark:text-white rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl border-2 hover:scale-110 active:scale-95 z-50 transition-all ${
                  action === "Guide" 
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-400 hover:brightness-110" 
                    : "bg-white/90 dark:bg-zinc-900/90 border-zinc-50 dark:border-zinc-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 hover:border-orange-500"
                }`}
              >
                {action === "Guide" && <i className="fa-solid fa-book-open mr-2"></i>}
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
