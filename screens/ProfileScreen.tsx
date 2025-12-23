
import React, { useState, useMemo } from 'react';
import { PetProfile, Species, Gender, Reminder } from '../types';

interface ProfileProps {
  pet: PetProfile;
  setPet: (pet: PetProfile) => void;
  reminders: Reminder[];
  onNavigate?: (tab: 'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai') => void;
}

const ProfileScreen: React.FC<ProfileProps> = ({ pet, setPet, reminders, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PetProfile>(pet);
  const [copied, setCopied] = useState(false);

  // Logic for Vitality Button
  const pendingTasks = useMemo(() => reminders.filter(r => !r.completed).length, [reminders]);
  const isExcellent = pendingTasks === 0;

  const handleSave = () => {
    setPet(formData);
    setIsEditing(false);
  };

  const copyId = () => {
    navigator.clipboard.writeText(pet.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 md:p-12 space-y-10 pb-32 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-3xl md:text-4xl font-bold font-lobster text-zinc-900 dark:text-zinc-50">Pet Identity</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
            isEditing ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:scale-105'
          }`}
        >
          <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'} mr-2`}></i>
          {isEditing ? 'Save' : 'Edit Info'}
        </button>
      </div>

      {/* Identity Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-zinc-50 dark:border-zinc-800 p-8 md:p-16 shadow-2xl relative">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10">
          <div className="relative group">
            <div className="p-1.5 bg-gradient-to-tr from-orange-400 to-purple-600 rounded-[2.2rem] shadow-2xl transition-transform group-hover:rotate-3 duration-500">
              <img src={pet.avatar} className="w-40 h-40 md:w-56 md:h-56 rounded-[1.75rem] object-cover border-4 border-white dark:border-zinc-900 shadow-inner" alt="Avatar" />
            </div>
            {isEditing && (
              <button className="absolute bottom-2 right-2 w-12 h-12 bg-white dark:bg-zinc-800 text-orange-600 rounded-xl shadow-2xl flex items-center justify-center border-2 border-orange-50 dark:border-zinc-700 hover:scale-110 transition-transform">
                <i className="fa-solid fa-camera text-xl"></i>
              </button>
            )}
          </div>
          <div className="text-center md:text-left space-y-3 min-w-0 flex-1">
             <h3 className="text-5xl md:text-6xl font-lobster text-zinc-900 dark:text-zinc-50 truncate">{pet.name}</h3>
             <div className="flex items-center justify-center md:justify-start gap-3">
               <span className="px-4 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-lg font-black text-[9px] uppercase tracking-widest border border-orange-100/50 dark:border-orange-900/50">{pet.id}</span>
               <button onClick={copyId} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-orange-500 border border-zinc-100 dark:border-zinc-800'}`}>
                 <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
               </button>
             </div>
          </div>
        </div>

        {/* Dynamic Birthday & Vitality Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Party Birthday Button */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-800 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-indigo-500/20 transition-all border-4 border-transparent hover:border-white/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md animate-party">
                <i className="fa-solid fa-cake-candles text-xl"></i>
              </div>
              <div className="flex gap-1">
                <i className="fa-solid fa-sparkles text-amber-300 animate-pulse"></i>
                <i className="fa-solid fa-confetti text-pink-300 animate-bounce delay-100"></i>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Birthday Countdown</p>
            <p className="text-2xl font-bold mt-1 font-lobster">June 15th</p>
            <p className="text-[11px] mt-0.5 opacity-80">{pet.name}'s Big Day is coming! 🎉</p>
          </div>

          {/* Smart Vitality Button */}
          <div className={`p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-500 border-4 border-transparent ${
            isExcellent 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-800 hover:border-emerald-400/30' 
              : 'bg-gradient-to-br from-rose-500 to-orange-700 hover:border-rose-400/30'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className={`w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-md transition-all duration-500 ${
              isExcellent ? 'animate-pulse' : 'animate-alert'
            }`}>
              <i className={`fa-solid ${isExcellent ? 'fa-heart-pulse' : 'fa-triangle-exclamation'} text-xl`}></i>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Health Vitality</p>
            <p className="text-2xl font-bold mt-1 font-lobster">
              {isExcellent ? 'Excellent' : 'Needs Care'}
            </p>
            <p className="text-[11px] mt-0.5 opacity-80">
              {isExcellent 
                ? `${pet.name} is peak happy! ✨` 
                : `${pendingTasks} tasks are pending attention! ⚠️`}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} disabled={!isEditing} />
            <SelectField label="Species" value={formData.species} options={Object.values(Species)} onChange={v => setFormData({...formData, species: v as any})} disabled={!isEditing} />
            <InputField label="Breed" value={formData.breed} onChange={v => setFormData({...formData, breed: v})} disabled={!isEditing} />
          </div>
          <div className="space-y-6">
            <InputField label="Birthday" type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} disabled={!isEditing} />
            <SelectField label="Gender" value={formData.gender} options={Object.values(Gender)} onChange={v => setFormData({...formData, gender: v as any})} disabled={!isEditing} />
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner">
               <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Life Stats</p>
               <p className="text-xl font-bold dark:text-zinc-50">Active Care Record</p>
               <p className="text-[11px] text-zinc-500 mt-0.5">Verified Health Passport</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string, onChange: (v: string) => void, disabled: boolean, type?: string }> = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest ml-1">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 transition-all font-bold text-base ${disabled ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent text-zinc-500' : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-800 focus:border-orange-500 dark:text-white shadow-lg'}`}
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest ml-1">{label}</label>
    <select 
      value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 transition-all font-bold text-base appearance-none ${disabled ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent text-zinc-500' : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-800 focus:border-orange-500 dark:text-white shadow-lg'}`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileScreen;
