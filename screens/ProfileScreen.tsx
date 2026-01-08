import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  const [showNecessities, setShowNecessities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Today's date for display
  const todayStr = useMemo(() => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), []);

  // Sync form data whenever the source pet object changes (e.g., after hydration)
  useEffect(() => {
    if (pet && !isEditing) {
      setFormData(pet);
    }
  }, [pet, isEditing]);
  
  const handleSave = async () => {
    if (!formData.name) return alert("Pet needs a name! ✨");
    setIsSaving(true);
    try {
      await setPet(formData);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to save changes. Please check your connection or permissions.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Updated to destructure the response object (we only need the URL for the avatar)
        const { url } = await api.uploadFile(file);
        setFormData(prev => ({ ...prev, avatar: url }));
      } catch (error) {
        alert("Failed to upload image.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
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

  const emergencyContacts = [
    { name: "Rishav Mobile Paws Pet Emergency", number: "+916291283373" },
    { name: "Wonder Vet", number: "+91 7411794092" },
    { name: "Furry Tales", number: "+91 9147071150" }
  ];

  return (
    <div className="p-4 md:p-10 space-y-10 animate-in slide-in-from-bottom-10 duration-700 max-w-7xl mx-auto pb-40">
      <style>{`
        @keyframes drive-ambulance {
          0% { transform: translateX(0) scale(1); }
          20% { transform: translateX(-2px) scale(0.95); }
          50% { transform: translateX(5px) scale(1.05); }
          80% { transform: translateX(-1px) scale(1); }
          100% { transform: translateX(0); }
        }
        .animate-drive { animation: drive-ambulance 0.8s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">Identity Vault</h2>
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mt-2">Personal Records</p>
        </div>
        {!readOnly && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            disabled={isSaving || isUploading}
            className={`
              relative px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300
              ${isEditing 
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 hover:scale-105 shadow-xl' 
                : 'bg-transparent text-zinc-500 border-zinc-300 hover:border-orange-500 hover:text-orange-500 dark:border-zinc-700 dark:hover:border-orange-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10'
              }
              ${isSaving || isUploading ? 'opacity-50 cursor-wait' : ''}
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
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
                       <i className="fa-solid fa-spinner animate-spin text-white text-3xl"></i>
                    </div>
                  )}
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Pet Avatar" />
                </div>
                {isEditing && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-16 h-16 bg-zinc-900 text-white rounded-2xl shadow-xl border-4 border-white dark:border-zinc-800 flex items-center justify-center hover:scale-110 transition-transform z-20">
                    <i className="fa-solid fa-camera text-xl"></i>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
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
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Birthday Card */}
              <button 
                onClick={() => setShowBirthdate(!showBirthdate)}
                className="relative h-48 rounded-[3rem] p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-100 dark:bg-rose-900/40"
              >
                 <div className="absolute -right-6 -bottom-6 text-[8rem] opacity-10 rotate-12 group-hover:rotate-[20deg] transition-transform text-rose-900 dark:text-rose-100 pointer-events-none">
                    <i className="fa-solid fa-cake-candles"></i>
                 </div>
                 
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className={`w-10 h-10 bg-white dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 text-lg shadow-sm ${showBirthdate ? 'animate-party' : ''}`}>
                       <i className="fa-solid fa-cake-candles"></i>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-rose-600/70 dark:text-rose-300/70 mb-2">Celebration</p>
                       <div className="h-8 flex items-center overflow-hidden">
                         {showBirthdate ? (
                           <span className="text-lg font-lobster text-rose-600 dark:text-rose-300 animate-in slide-in-from-bottom-4">{birthDisplay}</span>
                         ) : (
                           <span className="text-lg font-bold text-rose-900/30 dark:text-rose-100/30 group-hover:text-rose-500/50 transition-colors">Tap to Reveal</span>
                         )}
                       </div>
                    </div>
                 </div>
              </button>

              {/* Vitality Card */}
              <div 
                onClick={handleVitalityClick}
                className={`
                  relative h-48 rounded-[3rem] p-6 text-left transition-all duration-300 overflow-hidden group border-2 border-transparent 
                  ${isHealthy 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] cursor-default' 
                    : 'bg-amber-100 dark:bg-amber-900/40 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95'
                  }
                `}
              >
                 <div className={`absolute -right-6 -bottom-6 text-[8rem] opacity-10 rotate-12 group-hover:rotate-[20deg] transition-transform pointer-events-none ${isHealthy ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                    <i className={`fa-solid ${isHealthy ? 'fa-heart-pulse' : 'fa-triangle-exclamation'}`}></i>
                 </div>
                 
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div 
                      className={`
                        w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm transition-all
                        ${isHealthy 
                          ? 'bg-white dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-white dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 animate-spring-jump'
                        }
                      `}
                      style={!isHealthy ? { animationIterationCount: 'infinite' } : {}}
                    >
                       <i className={`fa-solid ${isHealthy ? 'fa-heart-pulse' : 'fa-bell'}`}></i>
                    </div>
                    <div>
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isHealthy ? 'text-emerald-600/70 dark:text-emerald-300/70' : 'text-amber-600/70 dark:text-amber-300/70'}`}>Vitality</p>
                       <div className="flex flex-col">
                         <span className={`text-2xl font-lobster ${isHealthy ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>
                           {isHealthy ? 'Excellent' : 'Action'}
                         </span>
                         {!isHealthy && (
                           <div className="flex items-center gap-2 mt-1 text-amber-600/70 dark:text-amber-400/70">
                              <span className="text-[8px] font-bold bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-md">
                                {pendingCount}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Pending</span>
                           </div>
                         )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Necessities Card (New) */}
              <button 
                onClick={() => setShowNecessities(true)}
                className="relative h-48 rounded-[3rem] p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-indigo-100 dark:bg-indigo-900/40"
              >
                 <div className="absolute -right-6 -bottom-6 text-[8rem] opacity-10 rotate-12 group-hover:rotate-[20deg] transition-transform text-indigo-900 dark:text-indigo-100 pointer-events-none">
                    <i className="fa-solid fa-briefcase-medical"></i>
                 </div>
                 
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="w-10 h-10 bg-white dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg shadow-sm group-hover:scale-110 transition-transform relative overflow-hidden">
                       <i className="fa-solid fa-briefcase-medical absolute transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-0"></i>
                       <i className="fa-solid fa-truck-medical absolute transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:animate-drive text-base"></i>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-300/70 mb-2">Necessities</p>
                       <div className="h-8 flex items-center overflow-hidden">
                          <span className="text-lg font-bold text-indigo-900/30 dark:text-indigo-100/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Tap for Help</span>
                       </div>
                    </div>
                 </div>
              </button>
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
                   label="Present Date" 
                   value={todayStr} 
                   icon="calendar-check" 
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

      {/* Necessities Modal (New) */}
      {showNecessities && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-transparent pointer-events-none">
          {/* Background is interactive/scrollable because pointer-events-none is on the container and no blocking overlay */}
          
          {/* Glass Card - Compact Size & Heavy Blur */}
          <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md w-full max-w-sm rounded-[3rem] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.25)] border-2 border-white/40 dark:border-zinc-700/40 space-y-5 relative z-10 animate-in zoom-in-95 duration-300 pointer-events-auto overflow-hidden">
              
              {/* Emergency Section */}
              <div className="space-y-3">
                 <div className="flex items-center justify-center gap-3 text-rose-500 dark:text-rose-400 mb-1">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-lg shadow-inner">
                        <i className="fa-solid fa-truck-medical animate-drive"></i>
                    </div>
                    <h3 className="font-lobster text-3xl text-zinc-900 dark:text-zinc-50 drop-shadow-sm">Emergency</h3>
                 </div>
                 
                 <div className="space-y-2">
                    {emergencyContacts.map((contact, idx) => (
                      <div 
                        key={idx} 
                        className="group relative flex items-center justify-between p-3 rounded-[1.5rem] bg-white/50 dark:bg-black/20 border border-rose-100 dark:border-rose-900/30 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 hover:scale-[1.02]"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                           <p className="font-black text-zinc-800 dark:text-zinc-200 text-xs truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{contact.name}</p>
                           <p className="text-[10px] font-mono text-rose-500 dark:text-rose-400/80 mt-0.5 tracking-wider font-bold">{contact.number}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contact.number);
                          }}
                          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-rose-500 shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90"
                        >
                           <i className="fa-solid fa-copy text-xs"></i>
                        </button>
                      </div>
                    ))}
                 </div>
                 
                 <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                      24/7 Helpline Support
                    </p>
                 </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent"></div>

              {/* Necessities Quick Actions */}
              <div className="space-y-4">
                 <h3 className="font-lobster text-xl text-center text-zinc-900 dark:text-zinc-50 opacity-80">Quick Access</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <QuickAccessButton 
                      href="https://www.google.com/maps/search/veterinarians+near+me" 
                      icon="user-doctor" label="Doctors" color="indigo" 
                    />
                    <QuickAccessButton 
                      href="https://www.google.com/maps/search/pet+groomers+near+me" 
                      icon="scissors" label="Groomers" color="pink" 
                    />
                    <QuickAccessButton 
                      href="https://www.google.com/maps/search/pet+stores+near+me" 
                      icon="store" label="Pet Stores" color="amber" 
                    />
                    <QuickAccessButton 
                      href="https://www.google.com/search?q=pet+events+near+me" 
                      icon="baseball" label="Events" color="emerald" 
                    />
                 </div>
              </div>

              <button 
                onClick={() => setShowNecessities(false)}
                className="w-full py-3.5 mt-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[9px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                Close Panel
              </button>
          </div>
        </div>
      )}

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

const QuickAccessButton: React.FC<{ href: string, icon: string, label: string, color: string }> = ({ href, icon, label, color }) => {
  const colorClasses: any = {
    indigo: 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-400 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white',
    pink: 'bg-pink-50/50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/30 hover:border-pink-400 dark:hover:border-pink-400 text-pink-500 group-hover:bg-pink-500 group-hover:text-white',
    amber: 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-400 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-400 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
  };

  const textColors: any = {
    indigo: 'text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300',
    pink: 'text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300',
    amber: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300',
    emerald: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
  };

  const glowClasses: any = {
    indigo: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]',
    pink: 'hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]',
    amber: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]',
    emerald: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]',
  };

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      className={`group flex flex-col items-center gap-2 p-3 rounded-[1.5rem] border hover:scale-[1.03] active:scale-95 transition-all duration-300 ${colorClasses[color].split(' group')[0]} ${glowClasses[color]}`}
    >
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 bg-white dark:bg-zinc-800 shadow-sm group-hover:scale-110 group-hover:rotate-6 ${colorClasses[color].match(/text-\w+-\d+/)?.[0]} group-hover:bg-${color}-500 group-hover:text-white`}>
          <i className={`fa-solid fa-${icon}`}></i>
       </div>
       <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${textColors[color]}`}>{label}</span>
    </a>
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
        <div className="flex-1 min-w-0 text-left">
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