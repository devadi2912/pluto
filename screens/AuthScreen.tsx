
import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [role, setRole] = useState<UserRole>('PET_OWNER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSigningUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verification email sent! Check your inbox.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            username: email.split('@')[0],
            role,
            petId: role === 'PET_OWNER' ? `PET-LUNA-123` : undefined // Mocked pet link for MVP
          };
          onLogin(authUser);
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-8 bg-[#FFFAF3] dark:bg-zinc-950 min-h-screen animate-in fade-in duration-700 relative">
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
        <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Your Pet's Digital Home</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-8">
        <div className="flex p-2 bg-zinc-100 dark:bg-zinc-800 rounded-3xl gap-2">
          <button 
            onClick={() => setRole('PET_OWNER')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              role === 'PET_OWNER' ? 'bg-white dark:bg-zinc-900 text-orange-600 shadow-md' : 'text-zinc-500'
            }`}
          >
            Pet Owner
          </button>
          <button 
            onClick={() => setRole('DOCTOR')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              role === 'DOCTOR' ? 'bg-white dark:bg-zinc-900 text-orange-600 shadow-md' : 'text-zinc-500'
            }`}
          >
            Doctor
          </button>
        </div>

        <div className="space-y-6">
          {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="luna@paws.com"
              className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pr-14"
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

        <button 
          onClick={handleAuth}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] disabled:opacity-50"
        >
          {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isSigningUp ? 'Join the Pack' : 'Enter Pluto')}
        </button>
        
        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="w-full text-center text-[10px] font-black uppercase text-zinc-400 hover:text-orange-500 transition-colors"
        >
          {isSigningUp ? 'Already a member? Sign In' : 'New here? Create Account'}
        </button>
      </div>

      <p className="mt-8 text-center text-zinc-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
        Securely powered by Supabase & Gemini AI
      </p>
    </div>
  );
};

export default AuthScreen;
