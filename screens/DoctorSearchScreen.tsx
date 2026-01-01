
import React from 'react';

interface DoctorSearchScreenProps {
  searchId: string;
  setSearchId: (id: string) => void;
  handleSearch: () => void;
  isSearching?: boolean;
}

const DoctorSearchScreen: React.FC<DoctorSearchScreenProps> = ({ searchId, setSearchId, handleSearch, isSearching = false }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="space-y-6">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Patient Lookup</h3>
        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-zinc-800 dark:border-zinc-700">
          {/* Animated Background Elements */}
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <i className="fa-solid fa-dna text-emerald-400 text-xs"></i>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Scanner Ready</p>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  disabled={isSearching}
                  placeholder="PET-LUNA-123"
                  className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/10 outline-none font-bold text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-white/10 transition-all uppercase tracking-wider shadow-inner disabled:opacity-50"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] font-black text-zinc-600 uppercase tracking-widest hidden group-focus-within:block">
                  Press Enter
                </div>
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="w-16 h-16 bg-white text-zinc-900 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all group overflow-hidden relative disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {isSearching ? (
                  <i className="fa-solid fa-spinner animate-spin text-xl relative z-10 group-hover:text-white transition-colors"></i>
                ) : (
                  <i className="fa-solid fa-magnifying-glass text-xl relative z-10 group-hover:text-white transition-colors"></i>
                )}
              </button>
            </div>
            
            <div className="mt-8 flex justify-between items-center text-zinc-500">
               <span className="text-[9px] font-black uppercase tracking-widest">Global Pet Database Connected</span>
               <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4 text-orange-500 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
            <i className="fa-solid fa-shield-halved text-xs"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Medical Access Protocol</span>
        </div>
        <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed px-1">
          Accessing patient records creates a permanent log entry. All data views are restricted to professional veterinary use under Pluto's secure privacy framework.
        </p>
      </div>
    </div>
  );
};

export default DoctorSearchScreen;
