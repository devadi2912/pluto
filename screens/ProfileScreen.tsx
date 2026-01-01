
import React, { useState, useMemo, useRef } from 'react';
import { PetProfile, Species, Gender, Reminder } from '../types';
import { api } from '../lib/api';

interface ProfileProps {
  pet: PetProfile;
  setPet: (pet: PetProfile) => Promise<void> | void;
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
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400',
    color: '',
    microchip: ''
  });
  const [showBirthdate, setShowBirthdate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = async () => {
    if (!formData.name) return alert("Pet needs a name! ✨");
    setIsSaving(true);
    try {
      // Logic fix: We rely on the parent's setPet handler (from App.tsx) 
      // which correctly uses the authenticated user's UID to update the database.
      // Calling api.updatePetProfile with pet.id (PET-...) was causing a permission error
      // because pet.id is not the same as the user's document ID (Firebase Auth UID).
      await setPet(formData);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to save changes. Please check your connection or permissions.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAccount();
    } catch (error) {
      alert("To delete your account, you must have logged in recently. Please log out and back in, then try again.");
      console.error(error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const pendingCount = reminders.filter(r => !r.completed).length;
  const isHealthy = pendingCount === 0;

  const ageStr = useMemo(() => {
    if (!formData.dateOfBirth) return 'Age Unknown';
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    
    if (years < 0) return 'Future Date';
    
    if (years === 0) {
       const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
       return `${months} Month${months !== 1 ? 's' : ''}`;
    }
    
    return `${years} Year${years !== 1 ? 's' : ''}`;
  }, [formData.dateOfBirth]);

  const birthDisplay = new Date(formData.dateOfBirth).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  const handleVitalityClick = () => {
    if (!isHealthy && onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-in slide-in-from-bottom-10 duration-700 max-w-7xl mx-auto pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">Identity Vault</h2>
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mt-2">Personal Records</p>
        </div>
        {!readOnly && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            disabled={isSaving}
            className={`
              relative px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300
              ${isEditing 
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 hover:scale-105 shadow-xl' 
                : 'bg-transparent text-zinc-500 border-zinc-300 hover:border-orange-500 hover:text-orange-500 dark:border-zinc-700 dark:hover:border-orange-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10'
              }
              ${isSaving ? 'opacity-50 cursor-wait' : ''}
            `}
          >
             <span className="flex items-center gap-2">
               <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen'} text-xs`}></i>
               {isSaving ? 'Saving...' : (isEditing ? 'Save Details' : 'Modify')}
             </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Big Name */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/40 dark:border-zinc-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
              
              <div className="relative mb-6 mt-4">
                <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden border-[6px] border-white dark:border-zinc-800 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Pet Avatar" />
                </div>
                {isEditing && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-16 h-16 bg-zinc-900 text-white rounded-2xl shadow-xl border-4 border-white dark:border-zinc-800 flex items-center justify-center hover:scale-110 transition-transform z-20">
                    <i className="fa-solid fa-camera text-xl"></i>
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
              
              <div className="relative z-10 w-full">
                {isEditing ? (
                  <input 
                    className="text-4xl font-lobster text-center bg-transparent border-b border-zinc-300 dark:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-50 w-full mb-2 focus:border-orange-500 transition-colors py-2"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Name"
                  />
                ) : (
                  <h3 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50">{formData.name || 'Unknown'}</h3>
                )}
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/20 mt-3 backdrop-blur-md border border-white/20 dark:border-white/5">
                   <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">{ageStr}</p>
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Interaction Cards & Details */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birthday Card */}
              <button 
                onClick={() => setShowBirthdate(!showBirthdate)}
                className="relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-50/80 dark:bg-rose-950/20"
              >
                 <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform text-rose-900 dark:text-rose-100 pointer-events-none">
                    <i className="fa-solid fa-cake-candles"></i>
                 </div>
                 
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className={`w-12 h-12 bg-white dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-500 text-xl shadow-sm ${showBirthdate ? 'animate-party' : ''}`}>
                       <i className="fa-solid fa-cake-candles"></i>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-rose-400/80 mb-2">Celebration Day</p>
                       <div className="h-10 flex items-center overflow-hidden">
                         {showBirthdate ? (
                           <span className="text-2xl font-lobster text-rose-600 dark:text-rose-300 animate-in slide-in-from-bottom-4">{birthDisplay}</span>
                         ) : (
                           <span className="text-xl font-bold text-rose-900/30 dark:text-rose-100/30 group-hover:text-rose-500/50 transition-colors">Tap to Reveal</span>
                         )}
                       </div>
                    </div>
                 </div>
              </button>

              {/* Vitality Card */}
              <div 
                onClick={handleVitalityClick}
                className={`
                  relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 overflow-hidden group border-2 border-transparent 
                  ${isHealthy 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] cursor-default' 
                    : 'bg-amber-50/80 dark:bg-amber-950/20 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95'
                  }
                `}
              >
                 <div className={`absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform pointer-events-none ${isHealthy ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                    <i className={`fa-solid ${isHealthy ? 'fa-heart-pulse' : 'fa-triangle-exclamation'}`}></i>
                 </div>
                 
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div 
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all
                        ${isHealthy 
                          ? 'bg-white dark:bg-emerald-900/40 text-emerald-500' 
                          : 'bg-white dark:bg-amber-900/40 text-amber-500 animate-spring-jump'
                        }
                      `}
                      style={!isHealthy ? { animationIterationCount: 'infinite' } : {}}
                    >
                       <i className={`fa-solid ${isHealthy ? 'fa-heart-pulse' : 'fa-bell'}`}></i>
                    </div>
                    <div>
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isHealthy ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>Vitality Status</p>
                       <div className="flex flex-col">
                         <span className={`text-3xl font-lobster ${isHealthy ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>
                           {isHealthy ? 'Excellent' : 'Action Needed'}
                         </span>
                         {!isHealthy && (
                           <div className="flex items-center gap-2 mt-2 text-amber-600/70 dark:text-amber-400/70">
                              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-md">
                                {pendingCount} Pending
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Tap to Review</span>
                           </div>
                         )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-xl rounded-[3rem] p-8 border border-white/40 dark:border-zinc-800 shadow-lg">
              <h4 className="text-3xl font-lobster text-zinc-400 dark:text-zinc-500/80 mb-8 px-2 flex items-center gap-3 transition-colors hover:text-orange-500">
                 <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                 Biological Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ColorField 
                   label="Unique Medical ID" 
                   value={formData.id} 
                   icon="fingerprint" 
                   isEditing={false}
                   highlight
                />

                <ColorField 
                   label="Species" 
                   value={formData.species} 
                   icon="paw" 
                   isEditing={isEditing}
                   component={
                     isEditing ? (
                       <select 
                         value={formData.species} 
                         onChange={e => setFormData({...formData, species: e.target.value as any})}
                         className="w-full bg-transparent outline-none font-bold text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                       >
                         {Object.values(Species).map(s => (
                           <option key={s} value={s} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                             {s}
                           </option>
                         ))}
                       </select>
                     ) : null
                   }
                />

                <ColorField 
                   label="Breed" 
                   value={formData.breed} 
                   icon="dna" 
                   isEditing={isEditing}
                   onChange={v => setFormData({...formData, breed: v})}
                />

                <ColorField 
                   label="Age" 
                   value={ageStr} 
                   icon="hourglass-half" 
                   isEditing={false}
                />

                <ColorField 
                   label="Gender" 
                   value={formData.gender} 
                   icon="venus-mars" 
                   isEditing={isEditing}
                   component={
                     isEditing ? (
                       <select 
                         value={formData.gender} 
                         onChange={e => setFormData({...formData, gender: e.target.value as any})}
                         className="w-full bg-transparent outline-none font-bold text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                       >
                         {Object.values(Gender).map(g => (
                           <option key={g} value={g} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                             {g}
                           </option>
                         ))}
                       </select>
                     ) : null
                   }
                />

                <ColorField 
                   label="Date of Birth" 
                   value={formData.dateOfBirth} 
                   icon="calendar-day" 
                   inputType="date"
                   isEditing={isEditing}
                   onChange={v => setFormData({...formData, dateOfBirth: v})}
                />

                <ColorField 
                   label="Weight (kg)" 
                   value={formData.weight || ''} 
                   icon="weight-scale" 
                   isEditing={isEditing}
                   onChange={v => setFormData({...formData, weight: v})}
                />

                <ColorField 
                   label="Color / Markings" 
                   value={formData.color || ''} 
                   icon="palette" 
                   isEditing={isEditing}
                   onChange={v => setFormData({...formData, color: v})}
                />

                <ColorField 
                   label="Microchip ID" 
                   value={formData.microchip || ''} 
                   icon="barcode" 
                   isEditing={isEditing}
                   onChange={v => setFormData({...formData, microchip: v})}
                />
              </div>

              {!readOnly && (
                <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                   <button 
                     onClick={() => setShowDeleteModal(true)}
                     className="w-full py-4 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                   >
                     Delete Account & Data
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-transparent pointer-events-none">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border-4 border-white dark:border-zinc-950 space-y-8 relative z-10 animate-in zoom-in-95 pointer-events-auto">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center text-rose-500 text-4xl mx-auto shadow-lg animate-alert">
                <i className="fa-solid fa-heart-crack"></i>
              </div>
              <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Goodbye {pet.name}?</h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will permanently remove all medical records, files, and memories for <span className="text-rose-500">{pet.name}</span>. You cannot undo this action.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={performDelete} 
                disabled={isDeleting}
                className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i> Erasing Data...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isDeleting}
                className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                Keep my records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColorField: React.FC<{ 
  label: string, 
  value: string, 
  icon: string, 
  isEditing: boolean,
  onChange?: (val: string) => void,
  component?: React.ReactNode,
  inputType?: string,
  highlight?: boolean
}> = ({ label, value, icon, isEditing, onChange, component, inputType = "text", highlight }) => {
  
  return (
    <div className={`
      relative p-4 rounded-3xl transition-all duration-500 group border
      ${isEditing 
        ? 'bg-white dark:bg-zinc-800 border-orange-200 dark:border-zinc-700 shadow-sm hover:border-orange-400' 
        : highlight 
          ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 shadow-md cursor-copy'
          : 'bg-white/40 dark:bg-zinc-800/20 border-white/40 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:scale-[1.03] hover:shadow-xl hover:border-orange-500/20 cursor-default'
      }
    `}
    onClick={() => {
      if(highlight && !isEditing) {
        navigator.clipboard.writeText(value);
        alert(`ID ${value} copied to clipboard!`);
      }
    }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm bg-white dark:bg-zinc-800 ${highlight ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <i className={`fa-solid fa-${icon}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black uppercase tracking-widest mb-0.5 text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500 transition-colors">{label}</p>
          {isEditing ? (
            component || (
              <input 
                type={inputType}
                value={value}
                onChange={e => onChange && onChange(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-bold text-sm text-zinc-900 dark:text-zinc-100 w-full"
                placeholder="-"
              />
            )
          ) : (
            <p className={`font-bold truncate text-sm ${highlight ? 'text-orange-600 dark:text-orange-400 font-mono tracking-wider' : 'text-zinc-800 dark:text-zinc-200'}`}>{value || '-'}</p>
          )}
        </div>
        {highlight && !isEditing && (
           <i className="fa-solid fa-copy text-zinc-300 dark:text-zinc-600 text-xs group-hover:text-orange-400 transition-colors"></i>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
