
import React, { useState } from 'react';
import { AuthUser } from '../types';
import { StartScreen } from './StartScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

type AuthView = 'START' | 'LOGIN' | 'REGISTER';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [view, setView] = useState<AuthView>('START');
  const [tempUser, setTempUser] = useState<AuthUser | null>(null); // Stores registered user for the session

  return (
    <>
      {/* Global Theme Toggle */}
      <div className="fixed top-6 right-6 z-[100]">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-2 relative overflow-hidden ${
            darkMode 
              ? 'bg-zinc-900 border-zinc-800 shadow-[0_0_25px_rgba(251,191,36,0.25)]' 
              : 'bg-white border-zinc-200 shadow-lg'
          }`}
          aria-label="Toggle Theme"
        >
          {/* Sun - Visible in Dark Mode (Switch to Light) - Spinning & Glowing */}
          <i className={`fa-solid fa-sun absolute text-xl transition-all duration-700 ${
            darkMode 
              ? 'rotate-0 scale-110 opacity-100 text-orange-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-spin-slow' 
              : 'rotate-180 scale-0 opacity-0'
          }`}></i>

          {/* Moon - Visible in Light Mode (Switch to Dark) */}
          <i className={`fa-solid fa-moon absolute text-xl transition-all duration-700 ${
            !darkMode 
              ? 'rotate-0 scale-100 opacity-100 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' 
              : '-rotate-[180deg] scale-0 opacity-0'
          }`}></i>
        </button>
      </div>

      {view === 'START' && <StartScreen onNavigate={setView} />}
      {view === 'LOGIN' && <LoginScreen onNavigate={setView} onLogin={onLogin} tempUser={tempUser} />}
      {view === 'REGISTER' && <RegisterScreen onNavigate={setView} onRegister={setTempUser} />}
    </>
  );
};

export default AuthScreen;
