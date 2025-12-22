
import React, { useState } from 'react';
import { PetProfile, Species, Gender } from '../types';

interface ProfileProps {
  pet: PetProfile;
  setPet: (pet: PetProfile) => void;
}

const ProfileScreen: React.FC<ProfileProps> = ({ pet, setPet }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PetProfile>(pet);
  const [copied, setCopied] = useState(false);

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
    <div className="p-6 space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-4xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Pet Identity</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-8 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
            isEditing 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-b-4 border-emerald-700' 
              : 'bg-gradient-to-r from-orange-500 via-pink-500 to-rose-600 text-white border-b-4 border-rose-800'
          }`}
        >
          {isEditing ? 'Save' : 'Edit Info'}
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative p-2.5 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 shadow-2xl group">
          <img 
            src={pet.avatar} 
            className="w-44 h-44 rounded-full object-cover border-8 border-white dark:border-zinc-950 shadow-inner group-hover:scale-105 transition-transform duration-500"
            alt="Pet Avatar"
          />
          {isEditing && (
            <button className="absolute bottom-5 right-5 w-14 h-14 bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center border-4 border-orange-100 dark:border-zinc-700 shadow-2xl transition-all hover:rotate-12 active:scale-90">
              <i className="fa-solid fa-camera text-2xl"></i>
            </button>
          )}
          <div className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl border-2 border-zinc-100 dark:border-zinc-700 rotate-12">
            <i className="fa-solid fa-crown text-yellow-500 text-xl"></i>
          </div>
        </div>
        {!isEditing && (
           <h3 className="text-4xl font-lobster mt-6 text-zinc-900 dark:text-zinc-50 drop-shadow-sm">{pet.name}</h3>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 p-8 space-y-8 shadow-xl">
        {/* Pet ID Section - Subtle addition blending with details */}
        <div className="pb-4 border-b dark:border-zinc-800 flex items-center justify-between">
          <div>
             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unique Identifier</label>
             <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tighter mt-0.5">{pet.id}</p>
          </div>
          <button 
            onClick={copyId}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-orange-500'
            }`}
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
        </div>

        <InputField 
          label="Display Name" 
          value={formData.name} 
          onChange={(v) => setFormData({...formData, name: v})} 
          disabled={!isEditing} 
        />
        
        <div className="grid grid-cols-2 gap-8">
          <SelectField 
            label="Species" 
            value={formData.species} 
            options={Object.values(Species)}
            onChange={(v) => setFormData({...formData, species: v as Species})} 
            disabled={!isEditing} 
          />
          <InputField 
            label="Breed Type" 
            value={formData.breed} 
            onChange={(v) => setFormData({...formData, breed: v})} 
            disabled={!isEditing} 
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <InputField 
            label="Birthday" 
            type="date"
            value={formData.dateOfBirth} 
            onChange={(v) => setFormData({...formData, dateOfBirth: v})} 
            disabled={!isEditing} 
          />
          <SelectField 
            label="Gender" 
            value={formData.gender} 
            options={Object.values(Gender)}
            onChange={(v) => setFormData({...formData, gender: v as Gender})} 
            disabled={!isEditing} 
          />
        </div>
      </div>

      <section className="space-y-5">
        <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 px-2">Vitals & Stats</h3>
        <div className="grid grid-cols-2 gap-5">
           <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-7 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30 backdrop-blur-md">
                <i className="fa-solid fa-cake-candles text-xl"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Next B-Day</p>
              <p className="text-2xl font-bold mt-1">June 15th</p>
           </div>
           <div className="bg-gradient-to-br from-orange-500 via-rose-500 to-rose-700 p-7 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30 backdrop-blur-md">
                <i className="fa-solid fa-heart-pulse text-xl"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-100">Vitality</p>
              <p className="text-2xl font-bold mt-1">Excellent</p>
           </div>
        </div>
      </section>
    </div>
  );
};

const InputField: React.FC<{ 
  label: string, 
  value: string, 
  onChange: (v: string) => void, 
  disabled?: boolean,
  type?: string
}> = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full p-5 rounded-[1.5rem] border-2 transition-all font-bold ${
        disabled 
          ? 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-900 dark:text-zinc-50 shadow-inner' 
          : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:focus:ring-orange-900/30 outline-none shadow-xl'
      }`}
    />
  </div>
);

const SelectField: React.FC<{ 
  label: string, 
  value: string, 
  options: string[],
  onChange: (v: string) => void, 
  disabled?: boolean 
}> = ({ label, value, options, onChange, disabled }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-5 rounded-[1.5rem] border-2 appearance-none transition-all font-bold ${
          disabled 
            ? 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-900 dark:text-zinc-50 shadow-inner' 
            : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-700 focus:border-orange-400 outline-none shadow-xl'
        }`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {!disabled && (
        <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"></i>
      )}
    </div>
  </div>
);

export default ProfileScreen;
