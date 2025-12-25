
import React, { useState } from 'react';
import { UserRole, AuthUser, Species, Doctor } from '../types';

interface RegisterScreenProps {
  onNavigate: (view: 'START' | 'LOGIN') => void;
  onRegister: (user: AuthUser) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate, onRegister }) => {
  const [role, setRole] = useState<UserRole>('PET_OWNER');
  
  // Auth Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Pet Fields
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<Species>(Species.Dog);
  const [breed, setBreed] = useState('');

  // Doctor Fields
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [docExp, setDocExp] = useState('');

  const theme = role === 'PET_OWNER' ? 'indigo' : 'emerald';

  const handleRegister = () => {
    if (!username || !password) {
      alert("Please create a username and password.");
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    let newUser: AuthUser;

    if (role === 'PET_OWNER') {
      if (!petName) { alert("Please enter your pet's name"); return; }
      const petId = `PET-${petName.toUpperCase()}-${uniqueNum}`;
      
      newUser = {
        id: `USR-${uniqueNum}`,
        username,
        role: 'PET_OWNER',
        petId: petId,
      };
    } else {
      if (!docName) { alert("Please enter your name"); return; }
      const docId = `DOC-${docName.toUpperCase().split(' ')[0]}-${uniqueNum}`;
      
      const newDoctor: Doctor = {
         id: docId,
         name: docName,
         specialization: docSpec || 'General Veterinary',
         clinic: docClinic || 'Private Practice',
         experience: docExp || '1 Year',
         qualification: 'DVM',
         registrationId: `VET-${uniqueNum}`,
         address: 'To be updated',
         contact: 'To be updated',
         emergencyContact: 'To be updated',
         consultationHours: '09:00 - 17:00',
         medicalFocus: 'General Care'
      };

      newUser = {
        id: `USR-${uniqueNum}`,
        username,
        role: 'DOCTOR',
        doctorDetails: newDoctor
      };
    }

    onRegister(newUser);
    alert(`Registration Successful! \nGenerated ID: ${role === 'PET_OWNER' ? newUser.petId : newUser.doctorDetails?.id}`);
    onNavigate('LOGIN');
  };

  return (
    <div className={`fixed inset-0 w-full h-full bg-${theme}-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden no-scrollbar animate-in fade-in slide-in-from-right-10 duration-500`}>
       {/* Back Button */}
       <button 
        onClick={() => onNavigate('START')}
        className="fixed top-6 left-6 w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-md transition-all z-[100] border border-zinc-100 dark:border-zinc-800"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="w-full min-h-full flex flex-col items-center py-10 px-6 md:px-12 pb-40">
         <div className="text-center mb-10 space-y-2 mt-12 md:mt-0">
           <h2 className={`text-4xl md:text-5xl font-lobster text-${theme}-600 dark:text-${theme}-400`}>New {role === 'PET_OWNER' ? 'Family' : 'Professional'}</h2>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Create your Pluto identity</p>
         </div>

         {/* Role Toggle */}
         <div className="flex p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-lg border-2 border-zinc-100 dark:border-zinc-800 mb-10 relative z-10">
            <button 
              onClick={() => setRole('PET_OWNER')}
              className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'PET_OWNER' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-zinc-400 hover:text-indigo-500'
              }`}
            >
              Pet Owner
            </button>
            <button 
              onClick={() => setRole('DOCTOR')}
              className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'DOCTOR' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'text-zinc-400 hover:text-emerald-500'
              }`}
            >
              Doctor
            </button>
         </div>

         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-white dark:border-zinc-800 w-full max-w-4xl space-y-8">
            
            {/* Credentials Section */}
            <div className="space-y-6">
               <h3 className="text-xl font-lobster text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">Login Credentials</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Username</label>
                     <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Unique Handle" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Password</label>
                     <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Secret Key" />
                  </div>
               </div>
            </div>

            {/* Specific Details Section */}
            <div className="space-y-6">
               <h3 className={`text-xl font-lobster text-${theme}-600 dark:text-${theme}-400 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2`}>
                 {role === 'PET_OWNER' ? 'Pet Profile' : 'Professional Profile'}
               </h3>
               
               {role === 'PET_OWNER' ? (
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Pet Name</label>
                       <input value={petName} onChange={e => setPetName(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Luna" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Species</label>
                         <div className="relative">
                           <select value={species} onChange={e => setSpecies(e.target.value as Species)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm appearance-none cursor-pointer">
                              {Object.values(Species).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"></i>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Breed</label>
                         <input value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Retriever" />
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Full Name</label>
                       <input value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Dr. Jane Doe" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Specialization</label>
                         <input value={docSpec} onChange={e => setDocSpec(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Surgery" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Years Exp.</label>
                         <input value={docExp} onChange={e => setDocExp(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. 8 Years" />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Primary Clinic</label>
                       <input value={docClinic} onChange={e => setDocClinic(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. City Vet" />
                    </div>
                 </div>
               )}
            </div>

            <div className="pt-4">
              <button 
                onClick={handleRegister}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-${theme}-500 border-4 border-white dark:border-zinc-950`}
              >
                Register Account
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};
