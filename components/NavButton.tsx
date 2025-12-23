
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

  const activeBgMap = {
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    rose: 'bg-rose-100 dark:bg-rose-900/30',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  };

  const isIdentity = icon === 'paw';

  if (isAction) {
    return (
      <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-0.5 transition-all outline-none focus:outline-none px-2 py-1"
      >
        <div className={`
          w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 relative overflow-hidden border-2
          ${active 
            ? `bg-orange-500 text-white scale-110 border-white shadow-lg shadow-orange-500/30` 
            : 'bg-white/20 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border-white/20'
          }
        `}>
          <i className={`fa-solid fa-dog ${active ? 'animate-bounce text-lg' : 'text-sm'}`}></i>
          {active && (
            <div className="absolute inset-0 pointer-events-none">
              <i className="fa-solid fa-sparkles absolute top-1 left-1 text-[8px] animate-pulse"></i>
            </div>
          )}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-300 mt-1
          ${active ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500 dark:text-zinc-500'}
        `}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-0.5 transition-all hover:scale-110 active:scale-90 outline-none px-2 py-1"
    >
      <div className={`
        w-10 h-10 flex items-center justify-center rounded-2xl transition-all border-2 overflow-hidden
        ${active 
          ? `${activeBgMap[color]} border-white dark:border-zinc-700 shadow-sm ${colorMap[color]}` 
          : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-500'
        }
      `}>
        {isIdentity && petAvatar ? (
          <img 
            src={petAvatar} 
            className={`w-full h-full object-cover transition-all duration-300 ${active ? 'scale-110 border-2 border-white' : 'grayscale-[60%] opacity-50'}`} 
            alt="pet" 
          />
        ) : (
          <i className={`fa-solid fa-${icon} text-sm transition-transform ${active ? 'scale-110' : ''}`}></i>
        )}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors mt-1 ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'} truncate max-w-[54px]`}>
        {label}
      </span>
    </button>
  );
};
