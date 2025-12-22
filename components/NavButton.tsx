
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
      <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all relative -top-6 group z-50">
        <div className="absolute inset-0 bg-white dark:bg-zinc-950 rounded-2xl scale-[1.05] shadow-sm pointer-events-none"></div>
        
        <div className={`
          w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-xl border-2 relative overflow-hidden
          ${active 
            ? `${color === 'indigo' ? 'bg-indigo-600' : 'bg-orange-500'} text-white shadow-xl scale-110 border-white/40` 
            : 'bg-zinc-100/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-500 dark:text-zinc-400 shadow-sm hover:scale-110 border-zinc-200/50 dark:border-zinc-800/50'
          }
        `}>
          {petAvatar && !active ? (
            <div className="flex flex-col items-center justify-center gap-0.5">
               <img src={petAvatar} className="w-8 h-8 rounded-full border border-white/50" alt="pet" />
               <i className="fa-solid fa-sparkles text-[10px] text-orange-400 opacity-60"></i>
            </div>
          ) : (
            <i className={`fa-solid fa-${icon} text-2xl`}></i>
          )}
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-500'} truncate max-w-[64px] transition-colors`}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95">
      <div className={`
        w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-md border-2
        ${active 
          ? `bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 ${colorMap[color]}` 
          : 'bg-transparent border-transparent text-zinc-500 dark:text-zinc-600'
        }
      `}>
        <i className={`fa-solid fa-${icon} text-xl`}></i>
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-500'} truncate max-w-[64px] transition-colors`}>
        {label}
      </span>
    </button>
  );
};
