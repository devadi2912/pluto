
import React from 'react';

export const NavButton: React.FC<{ 
  active: boolean, 
  onClick: () => void, 
  icon: string, 
  label: string,
  isAction?: boolean,
  color?: 'orange' | 'emerald' | 'amber' | 'rose' | 'indigo',
  petAvatar?: string
}> = ({ active, onClick, icon, label, isAction, color = 'orange', petAvatar }) => {
  const colorMap = {
    orange: 'text-orange-600 dark:text-orange-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  if (isAction) {
    return (
      <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-1 transition-all relative -top-6 group z-50 outline-none focus:outline-none ring-0 focus:ring-0"
      >
        <div className={`
          w-[60px] h-[60px] flex items-center justify-center rounded-2xl transition-all duration-500 relative overflow-hidden border-2 group-hover:rotate-3
          ${active 
            ? `bg-gradient-to-tr from-orange-500/90 to-rose-600/90 backdrop-blur-xl text-white scale-110 border-white/40 shadow-[0_12px_30px_rgba(249,115,22,0.4)]` 
            : 'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-500 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl group-hover:scale-105'
          }
        `}>
          {active ? (
             <i className="fa-solid fa-wand-magic-sparkles text-xl transition-transform group-hover:scale-110 group-hover:animate-pulse"></i>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
               {/* Subtle Frosted Dog Icon */}
               <i className="fa-solid fa-dog text-2xl text-zinc-400/10 dark:text-zinc-600/10 absolute transition-all duration-700 group-hover:scale-125 group-hover:text-orange-400/10"></i>
               {petAvatar && (
                  <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 transition-transform group-hover:scale-110">
                    <img src={petAvatar} className="w-8 h-8 rounded-full border-2 border-white/80 dark:border-zinc-800 shadow-md" alt="pet" />
                    <i className="fa-solid fa-sparkles text-[10px] text-orange-400/80 animate-pulse"></i>
                  </div>
               )}
            </div>
          )}
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 mt-1
          ${active ? 'text-zinc-900 dark:text-zinc-50 translate-y-0.5' : 'text-zinc-500 dark:text-zinc-500'}
        `}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95 outline-none focus:outline-none ring-0 focus:ring-0"
    >
      <div className={`
        w-14 h-14 flex items-center justify-center rounded-2xl transition-all border-2
        ${active 
          ? `bg-zinc-100/30 dark:bg-zinc-900/30 border-zinc-200/30 dark:border-zinc-800/30 shadow-sm ${colorMap[color]}` 
          : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-600'
        }
      `}>
        <i className={`fa-solid fa-${icon} text-xl`}></i>
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'} truncate max-w-[64px] transition-colors`}>
        {label}
      </span>
    </button>
  );
};
