
import React, { useState, useMemo } from 'react';

interface Patient {
  id: string;
  name: string;
  breed: string;
  avatar?: string;
  lastVisit?: string;
  species?: string;
}

interface DoctorPatientsScreenProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
}

/**
 * DoctorPatientsScreen renders a high-fidelity medical directory of visited patients.
 * Optimized for clarity and minimalist professional aesthetics.
 */
const DoctorPatientsScreen: React.FC<DoctorPatientsScreenProps> = ({ patients, onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

  const filteredPatients = useMemo(() => {
    let result = patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime());
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [patients, searchQuery, sortBy]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      {/* Directory Header - Simplified */}
      <div className="px-2 space-y-1">
        <h2 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">Medical Directory</h2>
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] ml-1">Patient History Vault</p>
      </div>

      {/* Simplified Integrated Filter Bar */}
      <div className="px-2">
        <div className="group relative flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 md:p-3 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-sm focus-within:shadow-xl focus-within:border-indigo-500/30 transition-all duration-500">
          {/* Search Portion */}
          <div className="flex-1 flex items-center w-full">
            <div className="w-12 h-12 flex items-center justify-center text-zinc-400 group-focus-within:text-indigo-500 transition-colors shrink-0">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </div>
            <input 
              type="text" 
              placeholder="Search by patient name or PET-ID..." 
              className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-zinc-800 dark:text-zinc-100 py-3 pr-4"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Minimalist Sorting Portion */}
          <div className="flex bg-zinc-50 dark:bg-black/20 p-1 rounded-2xl border border-zinc-100 dark:border-zinc-800 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => setSortBy('recent')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'recent' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setSortBy('name')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'name' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Modern Medical Record Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
          <div 
            key={patient.id} 
            onClick={() => onSelectPatient(patient.id)}
            className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-50 dark:border-zinc-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer overflow-hidden animate-in zoom-in-95"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex flex-col h-full space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="relative">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/20 p-1 border-2 border-white dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    {patient.avatar ? (
                      <img src={patient.avatar} className="w-full h-full object-cover rounded-[1.25rem]" alt={patient.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-indigo-400">
                        <i className="fa-solid fa-paw"></i>
                      </div>
                    )}
                  </div>
                  {idx < 3 && sortBy === 'recent' && searchQuery === '' && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px] font-black border-2 border-white dark:border-zinc-900 shadow-sm" title="Recent History">
                      <i className="fa-solid fa-clock"></i>
                    </div>
                  )}
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-700 shadow-inner">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{patient.id.split('-')[1] || patient.id}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{patient.name}</h4>
                <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
                  {patient.species || 'Pet'} • {patient.breed || 'Mixed'}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                <div className="opacity-70">
                   <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Last Record</p>
                   <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                     {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Never'}
                   </p>
                </div>
                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-zinc-100 dark:border-zinc-700">
                   <i className="fa-solid fa-arrow-right text-xs"></i>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl">
              <i className="fa-solid fa-users-slash"></i>
            </div>
            <p className="font-lobster text-2xl">Vault Empty</p>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-loose">
              No patients match your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsScreen;
