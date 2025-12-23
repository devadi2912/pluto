
import React, { useState } from 'react';
import { PetProfile, Species, Gender } from '../types';

const MOCK_PATIENTS: PetProfile[] = [
  { id: 'PET-LUNA-123', name: 'Luna', species: Species.Dog, breed: 'Golden Retriever', dateOfBirth: '2021-06-15', gender: Gender.Female, avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'PET-MAX-55', name: 'Max', species: Species.Dog, breed: 'Beagle', dateOfBirth: '2019-04-12', gender: Gender.Male, avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'PET-BELLA-22', name: 'Bella', species: Species.Cat, breed: 'Siamese', dateOfBirth: '2022-08-20', gender: Gender.Female, avatar: 'https://images.unsplash.com/photo-1513245538231-152271936348?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'PET-CHARLIE-88', name: 'Charlie', species: Species.Dog, breed: 'Poodle', dateOfBirth: '2023-01-05', gender: Gender.Male, avatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'PET-LUCY-11', name: 'Lucy', species: Species.Cat, breed: 'Persian', dateOfBirth: '2018-11-30', gender: Gender.Female, avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'PET-COOPER-00', name: 'Cooper', species: Species.Other, breed: 'Holland Lop', dateOfBirth: '2022-03-15', gender: Gender.Unknown, avatar: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=200&h=200' }
];

interface DoctorPatientsScreenProps {
  onViewRecords?: (petId: string) => void;
}

const DoctorPatientsScreen: React.FC<DoctorPatientsScreenProps> = ({ onViewRecords }) => {
  const [selectedPatient, setSelectedPatient] = useState<PetProfile | null>(null);

  // Strictly limited to 10 recent patients
  const recentPatients = MOCK_PATIENTS.slice(0, 10);

  const handleViewRecords = () => {
    if (selectedPatient && onViewRecords) {
      onViewRecords(selectedPatient.id);
      setSelectedPatient(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-44 px-1">
      <div className="px-2">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Recent Cases</h3>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Showing last 10 visits</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentPatients.map((patient, idx) => (
          <div 
            key={patient.id}
            onClick={() => setSelectedPatient(patient)}
            className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-5 rounded-[2.5rem] flex flex-col items-start gap-4 hover:border-orange-200 dark:hover:border-zinc-700 cursor-pointer transition-all shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-300 overflow-hidden relative"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Background Blob */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            
            <div className="flex items-center gap-4 w-full">
              <div className="relative">
                <img 
                  src={patient.avatar} 
                  alt={patient.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-lg group-hover:rotate-3 transition-transform"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 flex items-center justify-center text-[8px] text-white shadow-sm ${patient.species === Species.Dog ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                  <i className={`fa-solid ${patient.species === Species.Dog ? 'fa-dog' : 'fa-cat'}`}></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg leading-tight">{patient.name}</h4>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">{patient.id}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                <i className="fa-solid fa-arrow-right-long text-sm"></i>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                {patient.breed}
              </span>
              <span className="px-3 py-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                {patient.gender}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-10">
        <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest flex items-center justify-center gap-3">
          <span className="h-[1px] w-8 bg-zinc-100 dark:bg-zinc-800"></span>
          End of Archive
          <span className="h-[1px] w-8 bg-zinc-100 dark:bg-zinc-800"></span>
        </p>
      </div>

      {/* Patient Detail Modal - Consistent Frosted Glass Style */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/20 animate-in fade-in duration-300"
          onClick={() => setSelectedPatient(null)}
        >
          <div 
            className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[40px] backdrop-saturate-150 border-2 border-white/40 dark:border-zinc-800/40 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white/80 dark:border-zinc-800/80 shadow-xl mx-auto group">
                <img src={selectedPatient.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={selectedPatient.name} />
              </div>
              <div>
                <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">{selectedPatient.name}</h3>
                <p className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{selectedPatient.id}</p>
              </div>
              
              <div className="pt-6 space-y-3 text-left border-t border-zinc-100/40 dark:border-zinc-800/40">
                <PatientDetailRow label="Species" value={selectedPatient.species} />
                <PatientDetailRow label="Breed" value={selectedPatient.breed} />
                <PatientDetailRow label="Gender" value={selectedPatient.gender} />
                <PatientDetailRow label="Age" value={calculateAge(selectedPatient.dateOfBirth)} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="py-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all active:scale-95 border border-white/40 dark:border-zinc-700/40"
                >
                  Back
                </button>
                <button 
                  onClick={handleViewRecords}
                  className="py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Open File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PatientDetailRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-zinc-50/50 dark:border-zinc-800/20">
    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{value}</span>
  </div>
);

function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  const years = Math.abs(ageDate.getUTCFullYear() - 1970);
  return years === 0 ? '< 1 year' : `${years} ${years === 1 ? 'year' : 'years'}`;
}

export default DoctorPatientsScreen;
