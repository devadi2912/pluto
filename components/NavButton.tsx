
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

  const isIdentity = icon === 'paw';

  // The user requested to "push down the ai button to match the layout of the other buttons"
  // So we treat isAction almost like a normal button but keep the dog icon/animation logic.
  if (isAction) {
    return (
      <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-0.5 transition-all outline-none focus:outline-none"
      >
        <div className={`
          w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 relative overflow-hidden border-2
          ${active 
            ? `bg-orange-500 text-white scale-110 border-orange-400 shadow-lg shadow-orange-500/20` 
            : 'bg-transparent text-zinc-400 dark:text-zinc-600 border-transparent'
          }
        `}>
          <i className={`fa-solid fa-dog ${active ? 'animate-bounce text-base' : 'text-sm'}`}></i>
          {active && (
            <div className="absolute inset-0 pointer-events-none">
              <i className="fa-solid fa-sparkle absolute top-1 left-1 text-[6px] animate-pulse"></i>
            </div>
          )}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300
          ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}
        `}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-0.5 transition-all hover:scale-110 active:scale-90 outline-none"
    >
      <div className={`
        w-10 h-10 flex items-center justify-center rounded-xl transition-all border-2 overflow-hidden
        ${active 
          ? `bg-zinc-100/40 dark:bg-zinc-900/40 border-zinc-200/30 dark:border-zinc-800/30 shadow-inner ${colorMap[color]}` 
          : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-600'
        }
      `}>
        {isIdentity && petAvatar ? (
          <img 
            src={petAvatar} 
            className={`w-full h-full object-cover transition-all duration-300 ${active ? 'scale-110' : 'grayscale-[60%] opacity-50'}`} 
            alt="pet" 
          />
        ) : (
          <i className={`fa-solid fa-${icon} text-sm transition-transform ${active ? 'scale-110' : ''}`}></i>
        )}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600'} truncate max-w-[54px]`}>
        {label}
      </span>
    </button>
  );
};
