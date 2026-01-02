
import React, { useState, useEffect, useCallback } from 'react';

interface StartScreenProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  // Handle Mouse Movement for Parallax & Trail
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5);
    const yPos = (clientY / window.innerHeight - 0.5);
    
    setMousePos({ x: xPos * 40, y: yPos * 40 });

    // Create trail particles occasionally
    if (Math.random() > 0.85) {
      const newItem = {
        id: Date.now(),
        x: clientX,
        y: clientY,
        rotation: Math.random() * 360
      };
      setTrail(prev => [newItem, ...prev].slice(0, 8));
    }
  }, []);

  // Cleanup trail over time
  useEffect(() => {
    const timer = setInterval(() => {
      setTrail(prev => prev.slice(0, -1));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#FFFAF3] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden animate-in fade-in duration-1000 select-none cursor-default"
      onMouseMove={handleMouseMove}
    >
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes blob-shift {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0); }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(20px, -20px); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fade-out-up {
          0% { opacity: 0.6; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.5) translateY(-50px); }
        }
        @keyframes wandering-pet {
          0% { left: -10%; top: 20%; opacity: 0; transform: scaleX(1); }
          10% { opacity: 0.2; }
          45% { transform: scaleX(1); }
          50% { left: 110%; top: 40%; transform: scaleX(-1); }
          100% { left: -10%; top: 60%; opacity: 0; transform: scaleX(-1); }
        }
        .animate-ripple { animation: ripple 4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-blob { animation: blob-shift 12s ease-in-out infinite; }
        .animate-float { animation: float-gentle 6s ease-in-out infinite; }
        .animate-wandering { animation: wandering-pet 25s linear infinite; }
        .trail-particle { animation: fade-out-up 1s ease-out forwards; }
        .glass-card { 
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .glass-card {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* 1. Cursor Trail Particles */}
      {trail.map(p => (
        <div 
          key={p.id} 
          className="fixed pointer-events-none z-[100] text-orange-500/40 trail-particle"
          style={{ left: p.x, top: p.y, transform: `rotate(${p.rotation}deg)` }}
        >
          <i className="fa-solid fa-paw text-lg"></i>
        </div>
      ))}

      {/* 2. Magical Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-[140px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-[140px] animate-blob" style={{ animationDelay: '-6s' }}></div>
        
        {/* Wandering Pet Shadow */}
        <div className="absolute text-7xl text-zinc-900/5 dark:text-white/5 animate-wandering">
           <i className="fa-solid fa-dog"></i>
        </div>

        {/* Multi-layered Parallax Icons */}
        <div className="absolute inset-0">
           {/* Far Layer (Slow) */}
           <FloatingIcon icon="fa-cloud" delay="0s" size="text-5xl" top="10%" left="15%" opacity="opacity-5" speed={0.2} mouseX={mousePos.x} mouseY={mousePos.y} />
           <FloatingIcon icon="fa-cloud" delay="3s" size="text-6xl" top="60%" left="80%" opacity="opacity-5" speed={0.1} mouseX={mousePos.x} mouseY={mousePos.y} />
           
           {/* Mid Layer */}
           <FloatingIcon icon="fa-paw" delay="1s" size="text-2xl" top="25%" left="20%" opacity="opacity-20" speed={0.5} mouseX={mousePos.x} mouseY={mousePos.y} />
           <FloatingIcon icon="fa-bone" delay="4s" size="text-3xl" top="75%" left="15%" opacity="opacity-20" speed={0.4} mouseX={mousePos.x} mouseY={mousePos.y} />
           <FloatingIcon icon="fa-heart" delay="2s" size="text-2xl" top="30%" left="85%" opacity="opacity-20" speed={0.6} mouseX={mousePos.x} mouseY={mousePos.y} />
           
           {/* Near Layer (Fast) */}
           <FloatingIcon icon="fa-star" delay="5s" size="text-xl" top="80%" left="75%" opacity="opacity-30" speed={0.9} mouseX={mousePos.x} mouseY={mousePos.y} />
           <FloatingIcon icon="fa-bolt" delay="1.5s" size="text-2xl" top="45%" left="90%" opacity="opacity-30" speed={1.2} mouseX={mousePos.x} mouseY={mousePos.y} />
        </div>
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10 h-full justify-between py-12 md:py-20">
        
        {/* 3. Hero Section with Magnetic Effect */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div 
            className="relative group cursor-pointer transition-transform duration-300 ease-out"
            onMouseEnter={() => setIsHoveringHero(true)}
            onMouseLeave={() => setIsHoveringHero(false)}
            style={{ transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)` }}
          >
            {/* Ripples */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 border-4 border-orange-400/30 rounded-[3rem] animate-ripple"></div>
              <div className="w-36 h-36 border-4 border-orange-400/15 rounded-[3rem] animate-ripple" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Central Badge */}
            <div className="w-36 h-36 bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-600 rounded-[3.5rem] flex items-center justify-center text-white shadow-[0_30px_70px_rgba(249,115,22,0.5)] relative z-10 transition-all duration-700 hover:scale-110 hover:rotate-[-8deg] border-[8px] border-white dark:border-zinc-900 group-hover:shadow-[0_40px_100px_rgba(249,115,22,0.7)] group-active:scale-95">
              <i className="fa-solid fa-paw text-7xl drop-shadow-2xl"></i>
              {/* Internal Glow Shine */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3.5rem] pointer-events-none"></div>
            </div>

            {/* Orbiting Elements */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isHoveringHero ? 'opacity-100' : 'opacity-20 md:opacity-40'}`}>
                <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-amber-400 rounded-full blur-[2px] shadow-[0_0_15px_rgba(251,191,36,0.8)]" style={{ animation: 'orbit 5s linear infinite' }}></div>
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-indigo-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(129,140,248,0.8)]" style={{ animation: 'orbit 9s linear reverse infinite' }}></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-rose-400 rounded-full blur-[1px]" style={{ animation: 'orbit 15s linear infinite', animationDelay: '-2s' }}></div>
            </div>
          </div>
          
          <div className="space-y-6" style={{ transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)` }}>
            <h1 className="text-8xl md:text-[10rem] font-lobster text-zinc-900 dark:text-zinc-50 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-700 hover:tracking-normal cursor-default select-none relative inline-block">
              Pluto
              <span className="absolute -top-4 -right-12 text-2xl rotate-12 opacity-50"><i className="fa-solid fa-sparkles text-orange-400"></i></span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-orange-500/30"></div>
              <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.8em] text-[10px] md:text-[13px] opacity-80 whitespace-nowrap">
                A Unified Home for Pets
              </p>
              <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-orange-500/30"></div>
            </div>
          </div>
        </div>

        {/* 4. Interactive Action Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-16 max-w-5xl">
          {/* Join Card */}
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="group relative h-48 rounded-[4rem] bg-indigo-600 dark:bg-indigo-500 text-white overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.04] active:scale-95 hover:shadow-[0_30px_60px_rgba(79,70,229,0.5)] border-[6px] border-white dark:border-zinc-900 flex-1"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
            
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
               <i className="fa-solid fa-cloud-plus text-9xl"></i>
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-center items-start px-12 text-left space-y-3">
              <div className="px-3 py-1 bg-white/20 rounded-full inline-block backdrop-blur-md">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">New Family</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-lobster leading-none drop-shadow-md">Join Us</h3>
              <p className="text-[12px] font-bold text-indigo-50/70 max-w-[200px] leading-relaxed">Start your journey and secure your pet's future identity.</p>
            </div>
            
            <div className="absolute bottom-8 right-10 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:bg-white text-white group-hover:text-indigo-600 transition-all duration-500 border border-white/20 group-hover:scale-110 group-active:scale-90">
               <i className="fa-solid fa-arrow-right-long text-xl group-hover:translate-x-1 transition-transform"></i>
            </div>
          </button>

          {/* Login Card */}
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="group relative h-48 rounded-[4rem] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.04] active:scale-95 border-[6px] border-zinc-50 dark:border-zinc-800 hover:border-orange-500/50 flex-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]"
          >
            {/* Ambient Background Shine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.05),transparent)] pointer-events-none"></div>

            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 group-hover:rotate-[-12deg] transition-all duration-1000">
               <i className="fa-solid fa-house-chimney-heart text-9xl"></i>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center items-start px-12 text-left space-y-3">
              <div className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-full inline-block">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">Welcome Back</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-lobster leading-none drop-shadow-sm text-zinc-800 dark:text-white">Sign In</h3>
              <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 max-w-[200px] leading-relaxed">Access your medical safe and track daily milestones.</p>
            </div>

            <div className="absolute bottom-8 right-10 w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white text-zinc-400 transition-all duration-500 border border-zinc-100 dark:border-zinc-700 group-hover:border-transparent group-hover:scale-110 group-active:scale-90 shadow-inner group-hover:shadow-lg">
               <i className="fa-solid fa-key text-xl group-hover:rotate-12 transition-transform"></i>
            </div>
          </button>
        </div>

        {/* 5. Footer Polish */}
        <div className="mt-12 group">
           <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-shield-heart text-orange-400"></i>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                Secure & Verified Care Network
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

interface FloatingIconProps {
  icon: string;
  delay: string;
  size: string;
  top: string;
  left: string;
  opacity: string;
  speed: number;
  mouseX: number;
  mouseY: number;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon, delay, size, top, left, opacity, speed, mouseX, mouseY }) => (
  <div 
    className={`absolute ${size} ${opacity} text-orange-500 transition-transform duration-100 ease-out animate-float`} 
    style={{ 
      top, 
      left, 
      animationDelay: delay, 
      animationDuration: `${8 + speed * 4}s`,
      transform: `translate3d(${mouseX * speed}px, ${mouseY * speed}px, 0)`
    }}
  >
    <i className={`fa-solid ${icon}`}></i>
  </div>
);
