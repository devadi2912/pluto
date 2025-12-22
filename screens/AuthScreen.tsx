
import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [role, setRole] = useState<UserRole>('PET_OWNER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username.trim()) return;

    const mockId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newUser: AuthUser = {
      id: `USR-${mockId}`,
      username,
      role,
      petId: role === 'PET_OWNER' ? `PET-LUNA-123` : undefined,
      doctorDetails: role === 'DOCTOR' ? {
        id: `DOC-${mockId}`,
        name: `Dr. ${username}`,
        specialization: 'General Veterinary',
        clinic: 'Pluto Animal Hospital',
        contact: 'contact@plutocare.com'
      } : undefined
    };

    onLogin(newUser);
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-8 bg-[#FFFAF3] dark:bg-zinc-950 min-h-screen animate-in fade-in duration-700 relative">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg border-2 ${
            darkMode 
              ? 'bg-zinc-900 text-amber-300 border-zinc-800' 
              : 'bg-white text-orange-600 border-orange-100'
          }`}
        >
          <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'} text-xl`}></i>
        </button>
      </div>

      <div className="text-center mb-12 space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
          <i className="fa-solid fa-paw text-4xl"></i>
        </div>
        <h1 className="text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Welcome to Pluto</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Your Pet's Digital Home</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-8">
        <div className="flex p-2 bg-zinc-100 dark:bg-zinc-800 rounded-3xl gap-2">
          <button 
            onClick={() => setRole('PET_OWNER')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              role === 'PET_OWNER' ? 'bg-white dark:bg-zinc-900 text-orange-600 shadow-md' : 'text-zinc-400'
            }`}
          >
            Pet Owner
          </button>
          <button 
            onClick={() => setRole('DOCTOR')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              role === 'DOCTOR' ? 'bg-white dark:bg-zinc-900 text-orange-600 shadow-md' : 'text-zinc-400'
            }`}
          >
            Doctor
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              placeholder="e.g. LunaLover99"
              className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold dark:text-white"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
        >
          Enter Pluto
        </button>
      </div>

      <p className="mt-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
        By continuing you agree to Pluto's terms
      </p>
    </div>
  );
};

export default AuthScreen;
