
import React, { useState, useEffect, useMemo } from 'react';
import { Doctor } from '../types';
import { api } from '../lib/api';

interface DoctorProfileScreenProps {
  doctorProfile: Doctor;
  doctorId: string;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ doctorProfile, doctorId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Today's date for display
  const todayStr = useMemo(() => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), []);

  // Initialize state merging props with default fallbacks for visual completeness
  const [formData, setFormData] = useState<Doctor>(() => ({
    ...doctorProfile,
    bio: doctorProfile.bio || 'Dedicated to compassionate care for all furry friends. I specialize in preventative medicine and routine surgeries, ensuring your pets live their happiest, healthiest lives.',
    languages: doctorProfile.languages || 'English',
    clinic: doctorProfile.clinic || 'Private Practice',
    experience: doctorProfile.experience || 'Start Year',
    contact: doctorProfile.contact || '',
    emergencyContact: doctorProfile.emergencyContact || '',
    address: doctorProfile.address || '',
    medicalFocus: doctorProfile.medicalFocus || 'General Veterinary',
    qualification: doctorProfile.qualification || 'DVM',
    registrationId: doctorProfile.registrationId || 'Pending',
    consultationHours: doctorProfile.consultationHours || 'Mon-Fri 09:00 - 17:00'
  }));

  // Keep form data in sync if parent props update
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...doctorProfile,
      bio: doctorProfile.bio || prev.bio,
      languages: doctorProfile.languages || prev.languages
    }));
  }, [doctorProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updatedProfile = await api.updateDoctorProfile(doctorId, formData);
        setFormData(prev => ({ ...prev, ...updatedProfile }));
        setIsEditing(false);
    } catch (error) {
        console.error(error);
        alert("Failed to save profile.");
    } finally {
        setIsSaving(false);
    }
  };

  const [status, setStatus] = useState<'Available' | 'In Surgery' | 'On Break'>('Available');

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-44 max-w-7xl mx-auto px-4 sm:px-6">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes heartbeat-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-heartbeat-slow { animation: heartbeat-slow 3s ease-in-out infinite; }
      `}</style>

      {/* Header / Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
        <div>
          <h3 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight tracking-wide">Professional Profile</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2 ml-1">Verified Medical Identity Vault</p>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`
            relative px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
            flex items-center gap-3 shadow-xl border-2
            ${isEditing 
              ? 'bg-emerald-500 text-white border-emerald-400 hover:shadow-emerald-500/30' 
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent hover:scale-105'
            }
            ${isSaving ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'} text-sm`}></i>
          {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar Card & Status */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white dark:border-zinc-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group hover:shadow-emerald-500/10 transition-shadow duration-500">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>
              
              {/* Decorative floating icons */}
              <div className="absolute top-10 left-8 text-emerald-200/50 text-2xl animate-float-slow" style={{ animationDelay: '0s' }}>
                 <i className="fa-solid fa-notes-medical"></i>
              </div>
              <div className="absolute top-20 right-8 text-teal-200/50 text-xl animate-float-slow" style={{ animationDelay: '1.5s' }}>
                 <i className="fa-solid fa-pills"></i>
              </div>

              <div className="relative mb-6 mt-4 cursor-pointer" onClick={toggleStatus}>
                 <div className="w-48 h-48 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-[2.5rem] flex items-center justify-center text-white text-7xl shadow-2xl border-[6px] border-white dark:border-zinc-950 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 relative z-10">
                    <i className="fa-solid fa-user-doctor drop-shadow-md"></i>
                 </div>
                 
                 {/* Status Pill */}
                 <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 ${getStatusColor(status)} text-white rounded-full shadow-lg border-4 border-white dark:border-zinc-950 transition-all active:scale-95 z-20 flex items-center gap-2`}>
                    {status === 'In Surgery' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                    <p className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{status}</p>
                 </div>
              </div>
              
              <div className="w-full relative z-10 px-2 mt-4">
                 {isEditing ? (
                   <input 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full text-center text-3xl font-lobster bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-50 pb-1"
                     placeholder="Dr. Name"
                   />
                 ) : (
                   <h4 className="text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{formData.name}</h4>
                 )}
                 
                 {isEditing ? (
                   <input 
                     value={formData.specialization}
                     onChange={e => setFormData({...formData, specialization: e.target.value})}
                     className="w-full text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 outline-none mt-2 pb-1"
                     placeholder="Specialization"
                   />
                 ) : (
                   <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                     <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">{formData.specialization}</p>
                   </div>
                 )}
              </div>

              <div className="w-full mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                 <StatRow label="Present Date" value={todayStr} icon="calendar-day" />
                 <StatRow label="System ID" value={doctorId} icon="fingerprint" copyable onClick={() => copyToClipboard(doctorId, 'UID')} />
                 <StatRow label="License #" value={formData.registrationId} icon="id-card" isEditing={isEditing} onChange={v => setFormData({...formData, registrationId: v})} />
                 <StatRow label="Experience" value={formData.experience} icon="briefcase" isEditing={isEditing} onChange={v => setFormData({...formData, experience: v})} />
              </div>
           </div>
           
           <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">Network Status</p>
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Active & Verified</span>
              </div>
           </div>
        </div>

        {/* Right Column: Detailed Info Grid */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Bio Section */}
           <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl transition-all hover:shadow-2xl hover:bg-white/90 dark:hover:bg-zinc-900/90 group relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                <i className="fa-solid fa-quote-right text-6xl"></i>
              </div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <i className="fa-solid fa-quote-left text-sm"></i>
                 </div>
                 <h5 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">About Me</h5>
              </div>
              {isEditing ? (
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full h-24 bg-zinc-50 dark:bg-black/20 p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 focus:border-indigo-400 outline-none text-sm font-bold text-zinc-700 dark:text-zinc-300 resize-none relative z-10"
                  placeholder="Share a brief professional bio..."
                />
              ) : (
                <p className="text-sm md:text-base font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed italic opacity-90 group-hover:opacity-100 transition-opacity relative z-10">
                   "{formData.bio || 'No bio provided.'}"
                </p>
              )}
           </div>

           {/* Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <InfoCard 
                title="Practice Info" 
                icon="clinic-medical" 
                color="emerald"
                fields={[
                   { label: 'Clinic Name', value: formData.clinic, key: 'clinic' },
                   { label: 'Address', value: formData.address, key: 'address' },
                   { label: 'Consultation Hours', value: formData.consultationHours, key: 'consultationHours' }
                ]}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />

              <InfoCard 
                title="Contact Details" 
                icon="address-book" 
                color="sky"
                fields={[
                   { label: 'Primary Phone', value: formData.contact, key: 'contact' },
                   { label: 'Emergency Line', value: formData.emergencyContact, key: 'emergencyContact' },
                   { label: 'Languages', value: formData.languages || '', key: 'languages' }
                ]}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />
              
              <InfoCard 
                title="Medical Focus" 
                icon="microscope" 
                color="amber"
                fullWidth
                fields={[
                   { label: 'Primary Focus', value: formData.medicalFocus, key: 'medicalFocus' },
                   { label: 'Qualifications', value: formData.qualification, key: 'qualification' }
                ]}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const StatRow: React.FC<{ 
  label: string, 
  value: string, 
  icon: string, 
  isEditing?: boolean, 
  onChange?: (val: string) => void, 
  copyable?: boolean,
  onClick?: () => void
}> = ({ label, value, icon, isEditing, onChange, copyable, onClick }) => (
  <div className="flex items-center gap-4 group cursor-default">
     <div className={`w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:scale-110 shadow-sm transition-all border border-zinc-100 dark:border-zinc-700`}>
        <i className={`fa-solid fa-${icon}`}></i>
     </div>
     <div className="flex-1 min-w-0 text-left">
        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">{label}</p>
        {isEditing && onChange ? (
           <input 
             value={value}
             onChange={e => onChange(e.target.value)}
             className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 outline-none text-sm font-bold text-zinc-800 dark:text-zinc-200"
           />
        ) : (
           <p className={`text-sm font-bold truncate ${copyable ? 'text-emerald-600 dark:text-emerald-400 font-mono' : 'text-zinc-700 dark:text-zinc-300'}`}>
             {value || '-'}
           </p>
        )}
     </div>
     {copyable && !isEditing && (
       <button onClick={onClick} className="text-zinc-300 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
         <i className="fa-solid fa-copy"></i>
       </button>
     )}
  </div>
);

interface InfoCardProps {
  title: string;
  icon: string;
  color: 'emerald' | 'sky' | 'amber';
  fields: { label: string, value: string, key: keyof Doctor }[];
  isEditing: boolean;
  formData: Doctor;
  setFormData: React.Dispatch<React.SetStateAction<Doctor>>;
  fullWidth?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, color, fields, isEditing, formData, setFormData, fullWidth }) => {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    sky: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
  };

  const bgHoverColors = {
    emerald: 'hover:shadow-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-900/50',
    sky: 'hover:shadow-sky-500/10 hover:border-sky-200 dark:hover:border-sky-900/50',
    amber: 'hover:shadow-amber-500/10 hover:border-amber-200 dark:hover:border-amber-900/50'
  };

  return (
    <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 ${bgHoverColors[color]} ${fullWidth ? 'md:col-span-2' : ''} group`}>
       <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
             <i className={`fa-solid fa-${icon} text-sm`}></i>
          </div>
          <h5 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors">{title}</h5>
       </div>
       
       <div className={`grid ${fullWidth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {fields.map((field, idx) => (
             <div key={idx} className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">{field.label}</label>
                {isEditing ? (
                  <input 
                    value={field.value}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 outline-none text-sm font-bold text-zinc-800 dark:text-zinc-200"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-transparent text-sm font-bold text-zinc-700 dark:text-zinc-300 min-h-[46px] flex items-center transition-colors group-hover:bg-white dark:group-hover:bg-zinc-800/50">
                    {field.value || <span className="text-zinc-400 italic font-normal text-xs">Not provided</span>}
                  </p>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};

export default DoctorProfileScreen;
