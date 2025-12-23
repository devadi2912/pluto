
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PetProfile>(pet);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Animation states
  const [isBirthdayJumping, setIsBirthdayJumping] = useState(false);

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

  const petAge = useMemo(() => {
    const diff = Date.now() - new Date(pet.dateOfBirth).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, [pet.dateOfBirth]);

  const triggerBirthdayJump = () => {
    setIsBirthdayJumping(true);
    setTimeout(() => setIsBirthdayJumping(false), 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-12 space-y-8 md:space-y-12 pb-44 md:pb-12 animate-in slide-in-from-bottom-10 duration-700 max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex items-center justify-between px-2">
        <div className="animate-in slide-in-from-left duration-500">
          <h2 className="text-3xl md:text-5xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">My Identity</h2>
          <p className="hidden md:block text-[11px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.4em] mt-2">Personal Medical Vault</p>
        </div>
        {!readOnly && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-6 md:px-10 py-3 md:py-4 rounded-[1.75rem] text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 border-4 shadow-[0_0_20px_rgba(249,115,22,0.1)] ${
              isEditing 
                ? 'bg-emerald-500 text-white border-white dark:border-zinc-900 shadow-[0_0_25px_rgba(16,185,129,0.2)]' 
                : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-white dark:border-zinc-900 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]'
            }`}
          >
            {isEditing ? (
              <span className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-sm"></i> Commit Changes</span>
            ) : (
              <span className="flex items-center gap-2"><i className="fa-solid fa-pen-nib text-sm"></i> Modify Record</span>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Frosted Avatar Card with Organic Jump Animation */}
        <div className="lg:col-span-5 space-y-8">
           <div className={`backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-8 rounded-[4rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl relative group flex flex-col items-center transition-all duration-700 ${isBirthdayJumping ? 'animate-spring-jump' : ''}`}>
              <div className="relative mb-6">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-zinc-800 shadow-inner group-hover:rotate-1 transition-transform duration-500">
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Pet Avatar" />
                </div>
                {!readOnly && isEditing ? (
                   <>
                     <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:rotate-12 transition-all border-4 border-white dark:border-zinc-900"
                     >
                        <i className="fa-solid fa-camera-retro text-2xl"></i>
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                   </>
                ) : (
                  <button 
                    onClick={triggerBirthdayJump}
                    className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:rotate-45 transition-all border-4 border-white dark:border-zinc-900"
                  >
                    <i className="fa-solid fa-cake-candles text-lg"></i>
                  </button>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{pet.name}</h3>
                <div className="flex items-center justify-center gap-3 bg-white/70 dark:bg-zinc-800/50 px-5 py-2 rounded-full border border-white/40 dark:border-zinc-700 shadow-sm backdrop-blur-md">
                   <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{pet.id}</span>
                   <button onClick={copyId} className={`text-xs transition-all ${copied ? 'text-emerald-500' : 'text-zinc-400 hover:text-orange-500 hover:scale-110'}`}>
                      <i className={`fa-solid ${copied ? 'fa-check-circle' : 'fa-copy'}`}></i>
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <VitalCard label="Weight" value={pet.weight} unit="KG" icon="weight-scale" color="orange" />
                <VitalCard label="Age" value={petAge} unit="YR" icon="clock-rotate-left" color="indigo" />
              </div>
           </div>

           <div className="backdrop-blur-xl bg-zinc-950/80 rounded-[2.5rem] p-8 text-white border border-zinc-800/50 shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-40"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Care Optimization</p>
                   <p className="text-2xl font-bold font-lobster tracking-wider mt-1">{isExcellent ? 'Fully Synchronized' : 'Attention Required'}</p>
                </div>
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow-xl transition-all ${isExcellent ? 'bg-emerald-500 shadow-emerald-500/30 animate-pulse' : 'bg-rose-500 shadow-rose-500/30 animate-alert'}`}>
                   <i className={`fa-solid ${isExcellent ? 'fa-heart-pulse' : 'fa-triangle-exclamation'}`}></i>
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Frosted Details Card */}
        <div className="lg:col-span-7 space-y-8">
           <div className="backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-8 md:p-12 rounded-[4rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl space-y-12">
              <section className="space-y-8 animate-in slide-in-from-right duration-700 delay-150">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                    <h4 className="text-2xl font-black tracking-wide text-zinc-900 dark:text-zinc-100">My Companion</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} disabled={!isEditing || readOnly} />
                    <SelectField label="Species" value={formData.species} options={Object.values(Species)} onChange={v => setFormData({...formData, species: v as any})} disabled={!isEditing || readOnly} />
                    <InputField label="Breed" value={formData.breed} onChange={v => setFormData({...formData, breed: v})} disabled={!isEditing || readOnly} />
                    <SelectField label="Gender" value={formData.gender} options={Object.values(Gender)} onChange={v => setFormData({...formData, gender: v as any})} disabled={!isEditing || readOnly} />
                 </div>
              </section>

              <section className="space-y-8 animate-in slide-in-from-right duration-700 delay-300">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <h4 className="text-2xl font-black tracking-wide text-zinc-900 dark:text-zinc-100">Care Metadata</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Birth Date" type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} disabled={!isEditing || readOnly} />
                    <div className="space-y-3">
                       <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-widest ml-1">Current Weight (kg)</label>
                       <input 
                         type={(!isEditing || readOnly) ? "text" : "number"}
                         value={formData.weight || ''} 
                         onChange={e => setFormData({...formData, weight: e.target.value})} 
                         disabled={!isEditing || readOnly}
                         className={`w-full p-5 rounded-[2rem] border-2 transition-all font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${(!isEditing || readOnly) ? 'bg-white/30 dark:bg-zinc-800/30 border-transparent text-zinc-600 dark:text-zinc-400 cursor-default' : 'bg-white dark:bg-zinc-900 border-orange-100 dark:border-zinc-700 focus:border-orange-500 text-zinc-950 dark:text-white shadow-xl'}`}
                       />
                    </div>
                 </div>
              </section>

              <div className="p-10 bg-white/20 dark:bg-zinc-800/30 rounded-[3rem] border-2 border-dashed border-white/50 dark:border-zinc-700/50 flex flex-col items-center gap-5 text-center transition-all hover:bg-white/40 dark:hover:bg-zinc-800/50">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white dark:border-zinc-900 bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 text-xs shadow-xl transition-all hover:-translate-y-1">
                          <i className="fa-solid fa-shield-dog"></i>
                       </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 tracking-[0.4em]">Secure Ledger Record</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const VitalCard: React.FC<{ label: string, value: string | number | undefined, unit: string, icon: string, color: 'orange' | 'indigo' }> = ({ label, value, unit, icon, color }) => (
  <div className={`p-6 rounded-[2.5rem] text-center border-2 transition-all group/vital hover:shadow-xl ${
    color === 'orange' 
      ? 'bg-white/60 dark:bg-orange-950/20 border-white/80 dark:border-orange-900/30' 
      : 'bg-white/60 dark:bg-indigo-950/20 border-white/80 dark:border-indigo-900/30'
  }`}>
    <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl transition-all group-hover/vital:rotate-12 ${
      color === 'orange' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-indigo-500 text-white shadow-indigo-500/20'
    } shadow-lg`}>
      <i className={`fa-solid fa-${icon}`}></i>
    </div>
    <p className="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-3xl font-black ${color === 'orange' ? 'text-orange-700' : 'text-indigo-700'} dark:text-white`}>
      {value}<span className="text-[12px] ml-1 font-black opacity-60 uppercase">{unit}</span>
    </p>
  </div>
);

const InputField: React.FC<{ label: string, value: string, onChange: (v: string) => void, disabled: boolean, type?: string }> = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-[0.2em] ml-2">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`w-full p-5 rounded-[2rem] border-2 transition-all font-bold text-sm ${disabled ? 'bg-white/40 dark:bg-zinc-800/30 border-transparent text-zinc-700 dark:text-zinc-400 cursor-default' : 'bg-white dark:bg-zinc-900 border-white dark:border-zinc-700 focus:border-orange-500 text-zinc-950 dark:text-white shadow-xl'}`}
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-[0.2em] ml-2">{label}</label>
    <div className="relative">
      <select 
        value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`w-full p-5 rounded-[2rem] border-2 transition-all font-bold text-sm appearance-none ${disabled ? 'bg-white/40 dark:bg-zinc-800/30 border-transparent text-zinc-700 dark:text-zinc-400 cursor-default' : 'bg-white dark:bg-zinc-900 border-white dark:border-zinc-700 focus:border-orange-500 text-zinc-950 dark:text-white shadow-xl'}`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {!disabled && <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]"></i>}
    </div>
  </div>
);

export default ProfileScreen;
