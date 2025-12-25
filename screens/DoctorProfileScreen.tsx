
import React, { useState } from 'react';
import { Doctor } from '../types';

interface DoctorProfileScreenProps {
  doctorProfile: Doctor;
  doctorId: string;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ doctorProfile, doctorId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Doctor & { bio?: string; languages?: string }>(
    { ...doctorProfile, bio: 'Dedicated to compassionate care for all furry friends.', languages: 'English, Spanish' }
  );
  const [status, setStatus] = useState<'Available' | 'In Surgery' | 'On Break'>('Available');

  const handleSave = () => {
    setIsEditing(false);
  };

  const toggleStatus = () => {
    const statuses: ('Available' | 'In Surgery' | 'On Break')[] = ['Available', 'In Surgery', 'On Break'];
    const currentIndex = statuses.indexOf(status);
    setStatus(statuses[(currentIndex + 1) % statuses.length]);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Available': return 'bg-emerald-500 shadow-emerald-500/30';
      case 'In Surgery': return 'bg-rose-500 shadow-rose-500/30';
      case 'On Break': return 'bg-amber-500 shadow-amber-500/30';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-44 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div>
          <h3 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight tracking-wide">Professional Profile</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2">Verified Medical Identity Vault</p>
        </div>
        <div className="flex gap-4">
            <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-8 md:px-12 py-4 rounded-[1.75rem] text-[10px] font-black tracking-widest uppercase transition-all shadow-2xl border-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] ${
                isEditing 
                ? 'bg-emerald-500 text-white border-white dark:border-black shadow-emerald-500/20' 
                : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-white dark:border-black hover:scale-[1.03]'
            }`}
            >
            <div className="flex items-center gap-3">
                <i className={`fa-solid ${isEditing ? 'fa-check-circle' : 'fa-user-tie'} text-sm`}></i>
                {isEditing ? 'Commit Changes' : 'Update Profile'}
            </div>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column: Doctor Photo & Quick Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-10 rounded-[3.5rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
              <div className="relative mb-8 group cursor-pointer" onClick={toggleStatus}>
                 <div className="w-44 h-44 md:w-56 md:h-56 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[3rem] flex items-center justify-center text-white text-6xl shadow-2xl border-8 border-white dark:border-zinc-950 transition-transform group-hover:rotate-2">
                    <i className="fa-solid fa-user-md"></i>
                 </div>
                 <div className={`absolute -bottom-2 -right-2 px-6 py-2 ${getStatusColor(status)} text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-zinc-950 transition-colors`}>
                    <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{status}</p>
                 </div>
              </div>
              <h4 className="text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{formData.name}</h4>
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">{formData.specialization}</p>
              
              {/* Fun Interactive Buttons */}
              <div className="flex gap-3 mt-6">
                <FunButton icon="coffee" onClick={() => setStatus('On Break')} />
                <FunButton icon="hand-holding-heart" onClick={() => alert("High five! You're doing great!")} />
                <FunButton icon="share-nodes" onClick={() => alert("Profile shared!")} />
              </div>

              <div className="w-full mt-10 pt-10 border-t border-white/40 dark:border-zinc-800 grid grid-cols-1 gap-4">
                 <StatRow 
                    label="Practice Experience" 
                    value={formData.experience} 
                    icon="briefcase" 
                    isEditing={isEditing}
                    onChange={(v) => setFormData({...formData, experience: v})}
                 />
                 <StatRow 
                    label="Professional License" 
                    value={formData.registrationId} 
                    icon="id-card-clip" 
                    isEditing={isEditing}
                    onChange={(v) => setFormData({...formData, registrationId: v})}
                 />
              </div>
           </div>
        </div>

        {/* Right column: Details */}
        <div className="lg:col-span-8">
           <div className="backdrop-blur-2xl bg-white/40 dark:bg-zinc-900/40 p-10 md:p-14 rounded-[4rem] border-4 border-white/60 dark:border-zinc-800/50 shadow-2xl space-y-12">
              <section className="space-y-10 animate-in slide-in-from-right duration-700">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <h5 className="text-2xl font-black tracking-wide text-zinc-900 dark:text-zinc-100">Medical Credentials</h5>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bio Field - Full Width */}
                    <div className="md:col-span-2">
                        <ProfileField 
                           icon="quote-left" label="Bio / Motto" value={formData.bio || ''} isEditing={isEditing} color="indigo"
                           onChange={(v) => setFormData({...formData, bio: v})}
                        />
                    </div>

                    <ProfileField 
                       icon="language" label="Languages Spoken" value={formData.languages || ''} isEditing={isEditing} color="rose"
                       onChange={(v) => setFormData({...formData, languages: v})}
                    />
                    <ProfileField 
                       icon="graduation-cap" label="Academic Certification" value={formData.qualification} isEditing={isEditing} color="emerald"
                       onChange={(v) => setFormData({...formData, qualification: v})}
                    />
                    <ProfileField 
                       icon="phone" label="Primary Contact" value={formData.contact} isEditing={isEditing} color="sky"
                       onChange={(v) => setFormData({...formData, contact: v})}
                    />
                    <ProfileField 
                       icon="truck-medical" label="Emergency Pager" value={formData.emergencyContact} isEditing={isEditing} color="rose"
                       onChange={(v) => setFormData({...formData, emergencyContact: v})}
                    />
                    <ProfileField 
                       icon="clock" label="Consultation Hours" value={formData.consultationHours} isEditing={isEditing} color="amber"
                       onChange={(v) => setFormData({...formData, consultationHours: v})}
                    />
                    <ProfileField 
                       icon="clinic-medical" label="Facility Primary" value={formData.clinic} isEditing={isEditing} color="emerald"
                       onChange={(v) => setFormData({...formData, clinic: v})}
                    />
                    <ProfileField 
                       icon="microscope" label="Medical Focus" value={formData.medicalFocus} isEditing={isEditing} color="indigo"
                       onChange={(v) => setFormData({...formData, medicalFocus: v})}
                    />
                    <div className="md:col-span-2">
                       <ProfileField 
                          icon="location-arrow" label="Practice Base" value={formData.address} isEditing={isEditing} color="sky"
                          onChange={(v) => setFormData({...formData, address: v})}
                       />
                    </div>
                 </div>
              </section>

              <div className="p-6 md:p-10 bg-white/20 dark:bg-zinc-800/30 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-700/50 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8 shadow-inner transition-all hover:bg-white/40 group">
                 <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center text-emerald-500 text-4xl shadow-xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12">
                    <i className="fa-solid fa-vault"></i>
                 </div>
                 <div className="min-w-0">
                    <h6 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-widest uppercase">Medical Access Shield</h6>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2 leading-relaxed">Your professional identity is cryptographically linked to the Pluto health ecosystem. All interactions are logged for medical compliance and record security.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const FunButton: React.FC<{ icon: string, onClick: () => void }> = ({ icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center active:scale-90"
  >
    <i className={`fa-solid fa-${icon}`}></i>
  </button>
);

const StatRow: React.FC<{ label: string, value: string, icon: string, isEditing?: boolean, onChange?: (val: string) => void }> = ({ label, value, icon, isEditing, onChange }) => (
  <div className="flex items-center gap-5 p-5 bg-white/30 dark:bg-zinc-800/50 rounded-[1.75rem] border border-white/40 dark:border-zinc-700/50 w-full transition-all hover:bg-white/50 group/stat">
     <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-emerald-500 text-lg shadow-md transition-transform group-hover/stat:scale-110">
        <i className={`fa-solid fa-${icon}`}></i>
     </div>
     <div className="text-left flex-1 min-w-0">
        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none">{label}</p>
        {isEditing && onChange ? (
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 outline-none font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-1 focus:border-emerald-500 transition-colors py-1"
            />
        ) : (
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate mt-1.5">{value}</p>
        )}
     </div>
  </div>
);

const ProfileField: React.FC<{ 
  icon: string, label: string, value: string, isEditing?: boolean, color?: string, onChange?: (v: string) => void 
}> = ({ icon, label, value, isEditing, color = 'emerald', onChange }) => (
  <div className="space-y-4 group min-w-0">
    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-2">{label}</label>
    <div className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all ${
      isEditing ? 'bg-white dark:bg-zinc-900 border-emerald-500/30 shadow-2xl' : 'bg-white/30 dark:bg-zinc-800/40 border-transparent hover:border-white/60 dark:hover:border-zinc-700/50'
    }`}>
      <i className={`fa-solid fa-${icon} text-emerald-500 text-xl mt-0.5 shadow-emerald-500/20`}></i>
      {isEditing && onChange ? (
        <input 
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-zinc-800 dark:text-zinc-200 w-full"
        />
      ) : (
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 break-words flex-1 min-w-0 leading-tight">{value}</span>
      )}
    </div>
  </div>
);

export default DoctorProfileScreen;
