
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

      {/* Patient Detail Modal - Glass Card Pattern */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-transparent backdrop-blur-none pointer-events-none animate-in fade-in duration-300"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl border-4 border-white dark:border-zinc-950 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-shield-cat"></i>
              </div>
              <div>
                <h3 className="text-4xl font-lobster text-zinc-950 dark:text-zinc-50">{selectedPatient.name}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">File: {selectedPatient.id}</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => { onSelectPatient(selectedPatient.id); setSelectedPatient(null); }}
                  className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-4 border-white dark:border-zinc-950"
                >
                  Open Full Record
                </button>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="w-full py-5 bg-white/40 dark:bg-zinc-800/40 text-zinc-500 rounded-2xl font-black uppercase tracking-widest border-2 border-white dark:border-zinc-700"
                >
                  Dismiss
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
