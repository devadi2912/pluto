
import React from 'react';

interface StartScreenProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#FFFAF3] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
      
      {/* CSS for Puppy Animation */}
      <style>{`
        @keyframes runAcross {
          0% { transform: translateX(-20vw) translateY(0) rotate(0deg); }
          25% { transform: translateX(10vw) translateY(-5px) rotate(5deg); }
          50% { transform: translateX(50vw) translateY(0) rotate(0deg); }
          75% { transform: translateX(80vw) translateY(-5px) rotate(-5deg); }
          100% { transform: translateX(120vw) translateY(0) rotate(0deg); }
        }
        .puppy-run {
          animation: runAcross 8s linear infinite;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Running Puppy Layer */}
      <div className="absolute bottom-12 w-full pointer-events-none opacity-60 z-0">
         <div className="puppy-run text-4xl text-orange-400 dark:text-orange-600/50">
           <i className="fa-solid fa-dog"></i>
         </div>
      </div>

      <div className="max-w-md w-full flex flex-col items-center text-center space-y-12 relative z-10">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl rotate-6 animate-spring-jump border-4 border-white/20">
          <i className="fa-solid fa-paw text-6xl drop-shadow-md"></i>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-7xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide drop-shadow-sm">Pluto</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.25em] text-[11px] leading-loose max-w-xs mx-auto">
            A unified digital home for pet owners to track care, manage records, and stay on top of daily tasks.
          </p>
        </div>

        {/* Glassmorphism Button Container */}
        <div className="w-full bg-white/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/40 dark:border-zinc-700/50 p-6 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-4">
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all border-2 border-transparent hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Join Pluto
          </button>
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="w-full py-5 bg-transparent border-2 border-zinc-900/10 dark:border-white/10 text-zinc-800 dark:text-zinc-200 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-white/40 dark:hover:bg-zinc-800/40 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-[0.98]"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
