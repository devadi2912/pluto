
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

  const glowMap = {
    orange: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    emerald: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    amber: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    rose: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    indigo: 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]',
  };

  const isIdentity = icon === 'paw';

  if (isAction) {
    return (
      <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-0.5 transition-all outline-none focus:outline-none px-3 py-1"
      >
        <div className={`
          w-10 h-10 flex items-center justify-center transition-all duration-300 relative
          ${active ? 'scale-125' : 'scale-100'}
        `}>
          <i className={`
            fa-solid fa-${icon === 'wand-magic-sparkles' ? 'wand-magic-sparkles' : 'house-medical'} 
            ${active ? `${colorMap[color]} ${glowMap[color]} animate-bounce text-xl` : 'text-zinc-500 dark:text-zinc-500 text-lg'}
            transition-all duration-300
          `}></i>
          {active && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <i className="fa-solid fa-sparkles absolute top-0 right-0 text-[10px] text-orange-400 animate-pulse"></i>
            </div>
          )}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 mt-0.5
          ${active ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-700 dark:text-zinc-500'}
        `}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-0.5 transition-all hover:scale-110 active:scale-90 outline-none px-3 py-1"
    >
      <div className={`
        w-9 h-9 flex items-center justify-center transition-all duration-300 relative
        ${active ? 'scale-115' : 'scale-100'}
      `}>
        {isIdentity && petAvatar ? (
          <div className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300 ${active ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-zinc-300 dark:border-zinc-700'}`}>
            <img 
              src={petAvatar} 
              className={`w-full h-full object-cover transition-all duration-300 ${active ? 'scale-110 grayscale-0' : 'grayscale-[80%] opacity-50'}`} 
              alt="pet" 
            />
          </div>
        ) : (
          <i className={`
            fa-solid fa-${icon} text-lg transition-all duration-300
            ${active ? `${colorMap[color]} ${glowMap[color]}` : 'text-zinc-500 dark:text-zinc-500'}
          `}></i>
        )}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors mt-0.5 ${active ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-500'} truncate max-w-[50px]`}>
        {label}
      </span>
    </button>
  );
};
