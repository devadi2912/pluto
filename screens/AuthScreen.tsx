
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
  const [showPassword, setShowPassword] = useState(false);

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
        qualification: 'DVM, M.Sc Animal Health',
        registrationId: `VET-ID-${mockId.substr(0,5)}`,
        experience: '10+ Years',
        clinic: 'Pluto Animal Hospital',
        address: '77 Galaxy Square, Pet City, PC 10101',
        contact: '+1 (555) 123-4567',
        emergencyContact: '+1 (800) 999-HELP',
        consultationHours: '09:00 - 17:00 (Mon-Fri)',
        medicalFocus: 'Canine Geriatrics & Nutrition'
      } : undefined
    };

    onLogin(newUser);
  };

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 bg-[#FFFAF3] dark:bg-zinc-950 min-h-screen overflow-y-auto no-scrollbar scroll-smooth animate-in fade-in duration-700 relative transition-colors duration-500">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border-2 ${
            darkMode 
              ? 'bg-zinc-900 text-amber-300 border-zinc-800' 
              : 'bg-white text-orange-600 border-orange-100'
          }`}
          aria-label="Toggle Theme"
        >
          <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'} text-xl`}></i>
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        <div className="text-center mb-8 md:mb-10 space-y-3">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
            <i className="fa-solid fa-paw text-3xl md:text-4xl"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Welcome to Pluto</h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Your Pet's Digital Home</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 lg:p-14 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-6 md:space-y-10 w-full transition-all">
          <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-3xl gap-1 md:max-w-xs md:mx-auto">
            <button 
              onClick={() => setRole('PET_OWNER')}
              className={`flex-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'PET_OWNER' ? 'bg-white dark:bg-zinc-950 text-orange-600 shadow-md' : 'text-zinc-500'
              }`}
            >
              Pet Owner
            </button>
            <button 
              onClick={() => setRole('DOCTOR')}
              className={`flex-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'DOCTOR' ? 'bg-white dark:bg-zinc-950 text-orange-600 shadow-md' : 'text-zinc-500'
              }`}
            >
              Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                placeholder="e.g. LunaLover99"
                className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm md:text-lg"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pr-14 md:pr-16 text-sm md:text-lg"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                </button>
              </div>
            </div>
          </div>

          <div className="md:max-w-xs md:mx-auto">
            <button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-4 md:py-6 rounded-[2rem] md:rounded-[2.2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] md:text-base"
            >
              Enter Pluto
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-zinc-400 dark:text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
          By continuing you agree to Pluto's terms
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
