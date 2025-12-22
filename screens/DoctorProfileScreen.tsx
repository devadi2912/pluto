
import React, { useState } from 'react';
import { Doctor } from '../types';

interface DoctorProfileScreenProps {
  doctorProfile: Doctor;
  doctorId: string;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ doctorProfile, doctorId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Doctor>(doctorProfile);

  const handleSave = () => {
    // In a real app, we'd persist this to a backend or state manager
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Professional Identity</h3>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md active:scale-95 relative group overflow-hidden ${
            isEditing 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center gap-2 relative z-10">
            <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'} text-xs`}></i>
            {isEditing ? 'Save' : 'Edit Info'}
          </div>
          {!isEditing && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl space-y-8">
        {/* Profile Hero */}
        <div className="flex items-start gap-6 pb-6 border-b dark:border-zinc-800">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-xl border-4 border-white dark:border-zinc-800 shrink-0">
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    placeholder="e.g. Dr. Sarah Smith"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-xl font-bold text-base outline-none focus:border-indigo-400 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Specialization</label>
                  <input 
                    type="text"
                    value={formData.specialization}
                    placeholder="e.g. Cardiology Specialist"
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-xl font-black text-[10px] uppercase tracking-widest outline-none focus:border-indigo-400 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold font-lobster text-zinc-800 dark:text-zinc-100 leading-tight break-words">{formData.name}</h3>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-1 break-words">{formData.specialization}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate">{doctorId}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 gap-6">
          <ProfileField 
            icon="graduation-cap" 
            label="Qualification" 
            value={formData.qualification} 
            isEditing={isEditing}
            placeholder="e.g. DVM, PhD Cardiology"
            onChange={(v) => setFormData({...formData, qualification: v})}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField 
              icon="id-card" 
              label="Registration ID" 
              value={formData.registrationId} 
              isEditing={isEditing}
              placeholder="e.g. VET-TX-99881"
              onChange={(v) => setFormData({...formData, registrationId: v})}
            />
            <ProfileField 
              icon="briefcase-medical" 
              label="Years of Experience" 
              value={formData.experience} 
              isEditing={isEditing}
              placeholder="e.g. 12 Years"
              onChange={(v) => setFormData({...formData, experience: v})}
            />
          </div>
          <ProfileField 
            icon="phone" 
            label="Phone Number" 
            value={formData.contact} 
            isEditing={isEditing}
            placeholder="e.g. +1 555-0102"
            onChange={(v) => setFormData({...formData, contact: v})}
          />
        </div>

        {/* Clinic Info */}
        <div className="space-y-6 pt-4 border-t dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Clinic Name</label>
            {isEditing ? (
              <input 
                type="text"
                value={formData.clinic}
                placeholder="e.g. Green Valley Veterinary"
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-xl font-bold outline-none focus:border-indigo-400 dark:text-white"
              />
            ) : (
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3 break-words">
                 <i className="fa-solid fa-hospital text-indigo-400 shrink-0"></i>
                 {formData.clinic}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Full Address</label>
            {isEditing ? (
              <textarea 
                value={formData.address}
                placeholder="Enter full clinic address..."
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-400 dark:text-white resize-none"
              />
            ) : (
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 flex items-start gap-3 break-words leading-relaxed">
                 <i className="fa-solid fa-location-dot mt-1 text-rose-400 shrink-0"></i>
                 {formData.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Static Info Banner */}
      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border-2 border-dashed border-indigo-100 dark:border-indigo-900 flex items-start gap-4 mx-2">
        <i className="fa-solid fa-shield-halved text-indigo-400 mt-1"></i>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Medical Verification</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
            Your profile details are used for the official medical documents generated for your patients.
          </p>
        </div>
      </div>
    </div>
  );
};

const ProfileField: React.FC<{ 
  icon: string, 
  label: string, 
  value: string, 
  isEditing?: boolean,
  placeholder?: string,
  onChange?: (v: string) => void 
}> = ({ icon, label, value, isEditing, placeholder, onChange }) => (
  <div className="space-y-1 group min-w-0">
    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all overflow-hidden ${
      isEditing 
        ? 'bg-white dark:bg-zinc-900 border-indigo-100 dark:border-indigo-900 shadow-lg' 
        : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900'
    }`}>
      <i className={`fa-solid fa-${icon} text-indigo-400 text-sm mt-0.5 shrink-0`}></i>
      {isEditing && onChange ? (
        <input 
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-zinc-800 dark:text-zinc-200 w-full"
        />
      ) : (
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 break-words flex-1">
          {value || <span className="text-zinc-300 dark:text-zinc-700 italic">Not set</span>}
        </span>
      )}
    </div>
  </div>
);

export default DoctorProfileScreen;
