
import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { StartScreen } from './StartScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { api } from '../lib/api';
import firebase from 'firebase/compat/app';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  unverifiedUser?: firebase.User | null; // Passed from App.tsx if session exists but unverified
}

type AuthView = 'START' | 'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, darkMode, setDarkMode, unverifiedUser }) => {
  const [view, setView] = useState<AuthView>('START');
  const [tempUser, setTempUser] = useState<AuthUser | null>(null); 
  const [pendingEmail, setPendingEmail] = useState<string>('');

  // If App.tsx detects an unverified session, automatically show verification screen
  useEffect(() => {
    if (unverifiedUser) {
      setPendingEmail(unverifiedUser.email || '');
      setView('VERIFY_EMAIL');
    }
  }, [unverifiedUser]);

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
      {view === 'LOGIN' && (
        <LoginScreen 
          onNavigate={setView} 
          onLogin={onLogin} 
          tempUser={tempUser} 
          onVerifyNeeded={(email) => { setPendingEmail(email); setView('VERIFY_EMAIL'); }} 
          onForgotPassword={(email) => { setPendingEmail(email); setView('FORGOT_PASSWORD'); }}
        />
      )}
      {view === 'REGISTER' && <RegisterScreen onNavigate={setView} onRegister={(user) => { setTempUser(user); setPendingEmail(user.username); setView('VERIFY_EMAIL'); }} />}
      {view === 'VERIFY_EMAIL' && <VerifyEmailScreen email={pendingEmail} onNavigate={() => { api.logout(); setView('LOGIN'); }} />}
      {view === 'FORGOT_PASSWORD' && <ForgotPasswordScreen initialEmail={pendingEmail} onNavigate={() => setView('LOGIN')} />}
    </>
  );
};

const ForgotPasswordScreen: React.FC<{ initialEmail: string, onNavigate: () => void }> = ({ initialEmail, onNavigate }) => {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }
    setStatus('sending');
    try {
      await api.sendPasswordReset(email.trim());
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('User not found.');
      } else {
        setErrorMsg('Failed to send reset link.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 bg-white dark:bg-black min-h-screen overflow-y-auto no-scrollbar scroll-smooth animate-in fade-in slide-in-from-right-10 duration-500 relative transition-colors">
       <button 
        onClick={onNavigate}
        className="absolute top-6 left-6 w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-orange-500 shadow-md transition-all z-50 border border-zinc-100 dark:border-zinc-800"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="max-w-xl mx-auto w-full flex flex-col items-center pt-10 md:pt-0">
        <div className="h-20 mb-6 flex items-center justify-center overflow-visible">
           <div className="text-5xl text-orange-500 dark:text-orange-400 drop-shadow-lg filter animate-pulse">
              <i className="fa-solid fa-key"></i>
           </div>
        </div>

        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Forgot Password</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">Recover your access</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-8 w-full text-center">
           {status === 'success' ? (
             <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-500 text-2xl">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-600 dark:text-zinc-300 font-bold text-lg">Check your inbox</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">We sent you a password change link to <span className="text-orange-500">{email}</span></p>
                </div>
                <button 
                  onClick={onNavigate}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-4 md:py-6 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
                >
                  Sign In
                </button>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    disabled={status === 'sending'}
                    placeholder="you@email.com"
                    className="w-full p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold text-zinc-900 dark:text-white text-sm transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                
                {status === 'error' && (
                  <p className="text-rose-500 text-xs font-bold">{errorMsg}</p>
                )}

                <button 
                  onClick={handleReset}
                  disabled={status === 'sending'}
                  className={`w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 md:py-6 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] ${status === 'sending' ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {status === 'sending' ? 'Sending...' : 'Get Reset Link'}
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const VerifyEmailScreen: React.FC<{ email: string, onNavigate: () => void }> = ({ email, onNavigate }) => {
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await api.resendVerificationEmail();
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000); // Reset after 5s
    } catch (error) {
      console.error(error);
      setResendStatus('error');
      setTimeout(() => setResendStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start md:justify-center p-6 md:p-12 lg:p-16 bg-white dark:bg-black min-h-screen overflow-y-auto no-scrollbar scroll-smooth animate-in fade-in slide-in-from-right-10 duration-500 relative transition-colors">
       <style>{`
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
        .animate-puppy-idle { animation: happy-bounce 2s ease-in-out infinite; }
      `}</style>
      
      <div className="max-w-xl mx-auto w-full flex flex-col items-center pt-10 md:pt-0">
        <div className="h-20 mb-6 flex items-center justify-center overflow-visible">
           <div className="text-5xl text-orange-500 dark:text-orange-400 drop-shadow-lg filter animate-puppy-idle">
              <i className="fa-solid fa-envelope-open-text"></i>
           </div>
        </div>

        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Verify Email</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">One last step before you start</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-orange-50 dark:border-zinc-800 space-y-8 w-full text-center">
           <p className="text-zinc-600 dark:text-zinc-300 font-bold text-lg leading-relaxed">
             We have sent you a verification email to:
           </p>
           <div className="bg-orange-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-orange-100 dark:border-zinc-700">
             <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">{email || 'your email'}</span>
           </div>
           
           <div className="space-y-4">
             <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold">
               Please check your inbox (and spam folder), click the link, and then log in.
             </p>
             
             {/* Resend Logic */}
             <div className="pt-2">
                <button
                  onClick={handleResend}
                  disabled={resendStatus !== 'idle'}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                    resendStatus === 'sent' ? 'text-emerald-500 cursor-default' : 
                    resendStatus === 'error' ? 'text-rose-500' :
                    'text-zinc-400 hover:text-orange-500'
                  }`}
                >
                  {resendStatus === 'sending' ? 'Sending...' : 
                   resendStatus === 'sent' ? 'Email Sent!' : 
                   resendStatus === 'error' ? 'Failed. Try again.' :
                   "Didn't receive it? Resend Email"}
                </button>
             </div>
           </div>

           <button 
              onClick={onNavigate}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-4 md:py-6 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
            >
              Return to Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
