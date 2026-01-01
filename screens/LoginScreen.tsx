
import React, { useState, useEffect } from 'react';
import { UserRole, AuthUser } from '../types';
import { api } from '../lib/api';

interface LoginScreenProps {
  onNavigate: (view: 'START' | 'LOGIN' | 'REGISTER') => void;
  onLogin: (user: AuthUser) => void;
  tempUser: AuthUser | null;
  onVerifyNeeded: (email: string) => void;
  onForgotPassword: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLogin, tempUser, onVerifyNeeded, onForgotPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Pre-fill username if coming from registration
  useEffect(() => {
    if (tempUser) {
      setUsername(tempUser.username);
    }
  }, [tempUser]);

  const handleLogin = async () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert("Please enter both your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const authUser = await api.login({
        username: cleanUsername,
        password: cleanPassword
      });
      // If successful (and verified), standard login proceeds
      onLogin(authUser);
    } catch (err: any) {
      console.error(err);
      
      // If email is not verified, api.login now throws but keeps the session active.
      // App.tsx listener will detect the active unverified session and redirect to VERIFY_EMAIL.
      
      if (err.code !== 'auth/email-not-verified') {
         let msg = "Invalid credentials. Please try again.";
         if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            msg = "Email or password incorrect";
         } else if (err.code === 'auth/too-many-requests') {
            msg = "Too many failed attempts. Try again later.";
         }
         alert(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 bg-white dark:bg-black min-h-screen overflow-y-auto no-scrollbar scroll-smooth animate-in fade-in slide-in-from-right-10 duration-500 relative transition-colors">
      
      <style>{`
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
        @keyframes runAround {
          0% { transform: translate(0, 0) scaleX(1); }
          10% { transform: translate(35vw, -10vh) scaleX(1) rotate(10deg); }
          25% { transform: translate(40vw, 20vh) scaleX(1) rotate(90deg); }
          40% { transform: translate(0, 35vh) scaleX(-1) rotate(10deg); }
          60% { transform: translate(-40vw, 20vh) scaleX(-1) rotate(-10deg); }
          80% { transform: translate(-35vw, -20vh) scaleX(-1) rotate(-45deg); }
          100% { transform: translate(0, 0) scaleX(1) rotate(0deg); }
        }
        .animate-puppy-idle { animation: happy-bounce 2s ease-in-out infinite; }
        .animate-puppy-run { animation: runAround 3s ease-in-out forwards; z-index: 100; }
      `}</style>

      <button 
        onClick={() => onNavigate('START')}
        className="absolute top-6 left-6 w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-orange-500 shadow-md transition-all z-50 border border-zinc-100 dark:border-zinc-800"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center pt-10 md:pt-0">
        
        {/* Puppy Dash - Top centered */}
        <div className="h-12 mb-4 flex items-center justify-center overflow-visible">
             <button 
               onClick={() => setIsRunning(true)}
               onAnimationEnd={() => setIsRunning(false)}
               className={`text-3xl text-orange-500 dark:text-orange-400 drop-shadow-lg filter cursor-pointer transition-all duration-300 hover:text-orange-600 ${isRunning ? 'animate-puppy-run pointer-events-none' : 'animate-puppy-idle'}`}
             >
                <i className="fa-solid fa-dog"></i>
             </button>
        </div>

        <div className="text-center mb-8 md:mb-10 space-y-3">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-amber-400 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto rotate-12 hover:rotate-0 transition-transform duration-500">
            <i className="fa-solid fa-paw text-3xl md:text-4xl"></i>
          </div>
          <h1 className="text-4xl md:text-6xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Access your dashboard</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 lg:p-14 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-6 md:space-y-10 w-full transition-all">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                disabled={isLoading}
                type="email" 
                placeholder="you@email.com"
                className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white text-sm md:text-lg transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  disabled={isLoading}
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl md:rounded-[1.75rem] font-bold text-zinc-900 dark:text-white pr-14 md:pr-16 text-sm md:text-lg transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => onForgotPassword(username)}
                  className="text-[10px] font-bold text-zinc-400 hover:text-orange-500 transition-colors uppercase tracking-widest outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <div className="md:max-w-xs md:mx-auto flex flex-col gap-4">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-4 md:py-6 rounded-[2rem] md:rounded-[2.2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] md:text-base ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? 'Verifying...' : 'Enter Pluto'}
            </button>
            
            <button 
              onClick={() => onNavigate('REGISTER')}
              className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors"
            >
              Don't have an account? Join us
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] text-zinc-400 font-bold italic">Demo Login: demo@pluto.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};
