
import React from 'react';

interface DoctorSearchScreenProps {
  searchId: string;
  setSearchId: (id: string) => void;
  handleSearch: () => void;
}

const DoctorSearchScreen: React.FC<DoctorSearchScreenProps> = ({ searchId, setSearchId, handleSearch }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section className="space-y-6">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Patient Lookup</h3>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-6 text-indigo-100">Scan or enter pet identifier</p>
          <div className="flex gap-3 relative z-10">
            <input 
              type="text" 
              placeholder="PET-LUNA-123"
              className="flex-1 p-5 rounded-2xl bg-white/20 border-2 border-white/30 outline-none font-bold text-white placeholder:text-white/40 focus:bg-white/30 transition-all uppercase"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </button>
          </div>
        </div>
      </section>
      
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4 text-orange-500 mb-2">
          <i className="fa-solid fa-circle-info"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">Access Protocol</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          All views are logged. Accessing patient data without consent is prohibited under Pluto's medical privacy policy.
        </p>
      </div>
    </div>
  );
};

export default DoctorSearchScreen;
