
import React from 'react';
import { PetProfile } from '../types';
import { NavButton } from './NavButton';
import { api } from '../lib/api';

interface PetOwnerShellProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  pet: PetProfile | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  children: React.ReactNode;
}

export const PetOwnerShell: React.FC<PetOwnerShellProps> = ({
  activeTab,
  setActiveTab,
  pet,
  darkMode,
  setDarkMode,
  children
}) => {
  const navItems = [
    { id: 'dashboard', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'Pluto AI', isAction: true, color: 'amber' },
    { id: 'documents', icon: 'folder-open', label: 'Files', color: 'indigo' },
    { id: 'profile', icon: 'paw', label: pet?.name || 'Pet', color: 'rose' },
  ];

  return (
    <div className={`h-screen flex flex-col md:flex-row transition-colors duration-500 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 mb-16 justify-center group w-full">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95"><i className="fa-solid fa-paw text-lg"></i></div>
          <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 transition-colors group-hover:text-orange-500">Pluto</h1>
        </button>
        <nav className="flex-1 space-y-4">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 border-[4px] relative group overflow-hidden ${activeTab === item.id ? 'bg-orange-500 text-white border-white dark:border-black shadow-[0_6px_20px_rgba(249,115,22,0.25)] scale-[1.05] z-10' : 'text-zinc-800 dark:text-zinc-300 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'}`}
            >
              <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90">
            <div className="relative w-8 h-8 flex items-center justify-center">
               <i className={`fa-solid fa-sun absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
               <i className={`fa-solid fa-moon absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </div>
          </button>
          <button onClick={() => api.logout()} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-110 active:scale-90"><i className="fa-solid fa-power-off text-lg"></i></button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-[100] px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs shadow-sm"><i className="fa-solid fa-paw"></i></div>
            <h1 className="text-xl font-lobster text-zinc-900 dark:text-zinc-50">Pluto</h1>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center relative active:scale-90 transition-transform">
               <i className={`fa-solid fa-sun absolute text-xl transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
               <i className={`fa-solid fa-moon absolute text-xl transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </button>
            <button onClick={() => api.logout()} className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 transition-transform"><i className="fa-solid fa-power-off text-lg"></i></button>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FFFAF3] dark:bg-zinc-950 pt-16 md:pt-0">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2">
         {navItems.map(item => (
            <NavButton key={item.id} active={activeTab === item.id} onClick={() => setActiveTab(item.id as any)} icon={item.icon} label={item.label} isAction={item.isAction} color={item.color as any} petAvatar={pet?.avatar} />
         ))}
      </nav>
    </div>
  );
};
