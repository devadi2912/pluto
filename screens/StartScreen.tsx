
import React, { useState } from 'react';

interface StartScreenProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#FFFAF3] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
      
      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }
        
        /* Crazy Run Animation */
        @keyframes runAround {
          0% { transform: translate(0, 0) scaleX(1); }
          10% { transform: translate(35vw, -10vh) scaleX(1) rotate(10deg); } /* Dash Top-Right */
          25% { transform: translate(40vw, 20vh) scaleX(1) rotate(90deg); } /* Down Right Side */
          40% { transform: translate(0, 35vh) scaleX(-1) rotate(10deg); } /* Bottom Center (Turned) */
          60% { transform: translate(-40vw, 20vh) scaleX(-1) rotate(-10deg); } /* Bottom Left Side */
          80% { transform: translate(-35vw, -20vh) scaleX(-1) rotate(-45deg); } /* Top Left */
          100% { transform: translate(0, 0) scaleX(1) rotate(0deg); } /* Home */
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-puppy-idle {
          animation: happy-bounce 2s ease-in-out infinite;
        }
        .animate-puppy-run {
          animation: runAround 3s ease-in-out forwards;
          z-index: 100;
        }
        .animate-heartbeat {
          animation: heartbeat 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full flex flex-col items-center text-center relative z-10 h-full justify-center">
        
        {/* Main Logo Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-10 w-full">
          <div className="group cursor-pointer">
            <div className="w-40 h-40 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[3rem] flex items-center justify-center text-white shadow-2xl rotate-6 animate-float border-[6px] border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_50px_rgba(249,115,22,0.6)]">
              <i className="fa-solid fa-paw text-7xl drop-shadow-md animate-heartbeat"></i>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-8xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide drop-shadow-sm transition-all duration-300 hover:tracking-widest cursor-default">
              Pluto
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.25em] text-[11px] leading-loose max-w-xs mx-auto">
              A unified digital home for pet owners
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="w-full pb-12 flex flex-col items-center gap-6">
          
          {/* Puppy Animation - Clickable & Smaller */}
          <div className="h-12 flex items-center justify-center overflow-visible">
             <button 
               onClick={() => setIsRunning(true)}
               onAnimationEnd={() => setIsRunning(false)}
               className={`text-3xl text-orange-500 dark:text-orange-400 drop-shadow-lg filter pb-2 cursor-pointer transition-colors hover:text-orange-600 ${isRunning ? 'animate-puppy-run pointer-events-none' : 'animate-puppy-idle'}`}
               title="Catch me if you can!"
               aria-label="Play animation"
             >
                <i className="fa-solid fa-dog"></i>
             </button>
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={() => onNavigate('REGISTER')}
              className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(24,24,27,0.5)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] border-4 border-white dark:border-black active:scale-[0.98]"
            >
              Join Pluto
            </button>
            <button 
              onClick={() => onNavigate('LOGIN')}
              className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] border-4 border-white dark:border-black active:scale-[0.98]"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
