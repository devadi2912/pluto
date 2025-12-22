
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="px-2">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Recent Cases</h3>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Showing last 10 visits</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {recentPatients.map((patient, idx) => (
          <div 
            key={patient.id}
            onClick={() => setSelectedPatient(patient)}
            className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 p-4 rounded-[2rem] flex items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-900 cursor-pointer transition-all shadow-sm group active:scale-[0.98] animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <img 
              src={patient.avatar} 
              alt={patient.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-100 dark:border-zinc-800 group-hover:rotate-3 transition-transform"
            />
            <div className="flex-1">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-100">{patient.name}</h4>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{patient.breed} • {patient.id}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6 mt-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">End of Record History</p>
      </div>

      {/* Floating Panel (Modal) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500 flex flex-col border-t-4 border-indigo-500 mb-20">
            <div className="p-8 text-center relative">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl mx-auto -mt-16 group transition-transform hover:scale-105 duration-300">
                <img src={selectedPatient.avatar} className="w-full h-full object-cover" alt={selectedPatient.name} />
              </div>

              <div className="mt-6 space-y-1">
                <h3 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50">{selectedPatient.name}</h3>
                <div className="bg-indigo-50 dark:bg-indigo-950/40 inline-block px-4 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{selectedPatient.id}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4 text-left px-2">
                <PatientDetailRow label="Species" value={selectedPatient.species} icon="paw" />
                <PatientDetailRow label="Breed" value={selectedPatient.breed} icon="dna" />
                <PatientDetailRow label="Gender" value={selectedPatient.gender} icon="venus-mars" />
                <PatientDetailRow label="Age" value={calculateAge(selectedPatient.dateOfBirth)} icon="calendar" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={handleViewRecords}
                  className="py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  View Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PatientDetailRow: React.FC<{ label: string, value: string, icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2 border-b dark:border-zinc-800/50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
    </div>
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
