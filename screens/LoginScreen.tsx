
import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types';

interface LoginScreenProps {
  onNavigate: (view: 'START') => void;
  onLogin: (user: AuthUser) => void;
  tempUser: AuthUser | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLogin, tempUser }) => {
  const [role, setRole] = useState<UserRole>('PET_OWNER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username.trim()) return;

    // Check if the user matches the session-registered user
    if (tempUser && tempUser.username.toLowerCase() === username.toLowerCase()) {
      onLogin(tempUser);
      return;
    }

    // Fallback: Create a mock user if no registration matches
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
    <div className="flex-1 flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 bg-[#FFFAF3] dark:bg-zinc-950 min-h-screen overflow-y-auto no-scrollbar scroll-smooth animate-in fade-in slide-in-from-right-10 duration-500 relative transition-colors">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate('START')}
        className="absolute top-6 left-6 w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-orange-500 shadow-md transition-all z-50 border border-zinc-100 dark:border-zinc-800"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center pt-10 md:pt-0">
        <div className="text-center mb-8 md:mb-10 space-y-3">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
            <i className="fa-solid fa-paw text-3xl md:text-4xl"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Access your dashboard</p>
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
                className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm md:text-lg transition-all"
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
                  className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pr-14 md:pr-16 text-sm md:text-lg transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
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
      </div>
    </div>
  );
};
