
import React, { useState, useMemo, useRef } from 'react';
import { PetProfile, Species, Gender, Reminder } from '../types';

interface ProfileProps {
  pet: PetProfile;
  setPet: (pet: PetProfile) => void;
  reminders: Reminder[];
  onNavigate?: (tab: 'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai') => void;
  readOnly?: boolean;
}

const ProfileScreen: React.FC<ProfileProps> = ({ pet, setPet, reminders, onNavigate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(!pet?.id);
  const [formData, setFormData] = useState<PetProfile>(pet || {
    id: 'PET-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    name: '',
    species: Species.Dog,
    breed: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: Gender.Unknown,
    weight: '0',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSave = () => {
    if (!formData.name) return alert("Pet needs a name! ✨");
    setPet(formData);
    setIsEditing(false);
  };

  const ageStr = useMemo(() => {
    if (!formData.dateOfBirth) return 'Age Unknown';
    const years = Math.abs(new Date(Date.now() - new Date(formData.dateOfBirth).getTime()).getUTCFullYear() - 1970);
    return years === 0 ? 'Newborn' : `${years} Years Old`;
  }, [formData.dateOfBirth]);

  return (
    <div className="p-4 md:p-12 space-y-12 animate-in slide-in-from-bottom-10 duration-700 max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">Identity Vault</h2>
          <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-2">Personal Records</p>
        </div>
        {!readOnly && (
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest border-4 shadow-xl ${isEditing ? 'bg-emerald-500 text-white border-white' : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-white'}`}>
            {isEditing ? 'Save Record' : 'Modify File'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 flex flex-col items-center">
           <div className="backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-10 rounded-[4rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl w-full text-center">
              <div className="relative mb-8 flex justify-center">
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-[4rem] overflow-hidden border-8 border-white dark:border-zinc-800 shadow-inner bg-zinc-100 flex items-center justify-center">
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Pet Avatar" />
                </div>
                {isEditing && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] shadow-xl border-4 border-white flex items-center justify-center">
                    <i className="fa-solid fa-camera text-2xl"></i>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onload = () => setFormData({...formData, avatar: r.result as string});
                    r.readAsDataURL(file);
                  }
                }} />
              </div>
              <h3 className="text-5xl font-lobster text-zinc-900 dark:text-zinc-50">{formData.name || 'Your Pet'}</h3>
              <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest mt-2">{ageStr}</p>
           </div>
        </div>

        <div className="lg:col-span-7">
           <div className="backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-8 md:p-14 rounded-[4rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} disabled={!isEditing} />
              <SelectField label="Species" value={formData.species} options={Object.values(Species)} onChange={v => setFormData({...formData, species: v as any})} disabled={!isEditing} />
              <InputField label="Breed" value={formData.breed} onChange={v => setFormData({...formData, breed: v})} disabled={!isEditing} />
              <SelectField label="Gender" value={formData.gender} options={Object.values(Gender)} onChange={v => setFormData({...formData, gender: v as any})} disabled={!isEditing} />
              <InputField label="Birth Date" type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} disabled={!isEditing} />
              <InputField label="Weight (kg)" value={formData.weight || ''} onChange={v => setFormData({...formData, weight: v})} disabled={!isEditing} />
           </div>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string, onChange: (v: string) => void, disabled: boolean, type?: string }> = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={`w-full p-5 rounded-[2rem] border-2 transition-all font-bold text-sm ${disabled ? 'bg-white/30 dark:bg-zinc-800/30 border-transparent text-zinc-600' : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-800 focus:border-orange-500 text-zinc-950 dark:text-white shadow-xl'}`} />
  </div>
);

const SelectField: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={`w-full p-5 rounded-[2rem] border-2 transition-all font-bold text-sm appearance-none ${disabled ? 'bg-white/30 dark:bg-zinc-800/30 border-transparent text-zinc-600' : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-800 focus:border-orange-500 text-zinc-950 dark:text-white shadow-xl'}`}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileScreen;
