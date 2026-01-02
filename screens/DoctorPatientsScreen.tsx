
import React, { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  breed: string;
  avatar?: string;
}

interface DoctorPatientsScreenProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
}

/**
 * DoctorPatientsScreen renders a grid of recently visited patients for quick access.
 * It features a preview modal before opening the full record.
 */
const DoctorPatientsScreen: React.FC<DoctorPatientsScreenProps> = ({ patients, onSelectPatient }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50">Patient Logs</h2>
        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-1">Recently accessed medical files</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.length > 0 ? patients.map((patient, idx) => (
          <div 
            key={patient.id} 
            onClick={() => setSelectedPatient(patient)}
            className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer group animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">
                <i className="fa-solid fa-paw"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate text-zinc-900 dark:text-zinc-100">{patient.name}</h4>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{patient.id}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex justify-between items-center">
               <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Verified Record</span>
               <i className="fa-solid fa-chevron-right text-zinc-300"></i>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
            <i className="fa-solid fa-folder-open text-zinc-100 text-6xl mb-4"></i>
            <p className="text-zinc-400 font-bold">No patient history found. Use Discovery to search.</p>
          </div>
        )}
      </div>

      {/* Patient Detail Modal - Dark Glass Card Pattern */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-black border-4 border-zinc-800 w-full max-w-[320px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col pointer-events-auto relative ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center space-y-6">
              <div className="relative inline-block group mt-4">
                <div className="absolute inset-0 bg-indigo-500 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-4 border-white/20">
                  <i className="fa-solid fa-shield-cat drop-shadow-md"></i>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-4xl font-lobster text-white tracking-wide drop-shadow-md">{selectedPatient.name}</h3>
                <div className="inline-block px-3 py-1 rounded-lg">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">FILE: {selectedPatient.id}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 pb-2">
                <button 
                  onClick={() => { onSelectPatient(selectedPatient.id); setSelectedPatient(null); }}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 bg-white text-black hover:bg-zinc-200 border-none flex items-center justify-center gap-3 group"
                >
                  <span>Open Full Record</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
                
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="w-full py-2 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 text-zinc-500 hover:text-rose-500 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <i className="fa-solid fa-xmark text-lg group-hover:rotate-90 transition-transform"></i>
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsScreen;
