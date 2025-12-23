
import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';

interface DoctorProfileScreenProps {
  doctorProfile: Doctor;
  doctorId: string;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ doctorProfile, doctorId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Doctor>(doctorProfile);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-44">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Professional Identity</h3>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md active:scale-95 relative group overflow-hidden ${
            isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center gap-2 relative z-10">
            <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'} text-xs`}></i>
            {isEditing ? 'Save' : 'Edit Info'}
          </div>
        </button>
      </div>

      {/* --- Professional Stats Section --- */}
      <div className="grid grid-cols-2 gap-5 px-1">
        <AnimatedStatButton 
          label="Patients Visited" 
          value={1240} 
          icon="users-viewfinder" 
          color="bg-gradient-to-br from-blue-600 to-indigo-800"
          suffix="+"
          isBlurred
        />
        <AnimatedStatButton 
          label="Years Dedicated" 
          value={parseInt(formData.experience) || 12} 
          icon="award" 
          color="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500"
          suffix=" Years"
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl space-y-8">
        {/* Profile Hero Section */}
        <div className="flex items-start gap-6 pb-6 border-b dark:border-zinc-800">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-xl border-4 border-white dark:border-zinc-800 shrink-0">
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-sky-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    placeholder="e.g. Dr. Sarah Smith"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-sky-100 dark:border-zinc-700 rounded-xl font-bold text-base outline-none focus:border-sky-400 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-sky-500 uppercase tracking-widest ml-1">Specialization</label>
                  <input 
                    type="text"
                    value={formData.specialization}
                    placeholder="e.g. Cardiology Specialist"
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-sky-100 dark:border-zinc-700 rounded-xl font-black text-[10px] uppercase tracking-widest outline-none focus:border-sky-400 dark:text-white truncate"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold font-lobster text-zinc-800 dark:text-zinc-100 leading-tight break-words">{formData.name}</h3>
                <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.15em] mt-1 break-words">{formData.specialization}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate">{doctorId}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Professional Fields */}
        <div className="grid grid-cols-1 gap-6">
          <ProfileField 
            icon="graduation-cap" 
            label="Qualification" 
            value={formData.qualification} 
            isEditing={isEditing}
            color="emerald"
            placeholder="e.g. DVM, PhD Cardiology"
            onChange={(v) => setFormData({...formData, qualification: v})}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField 
              icon="id-card" 
              label="Registration ID" 
              value={formData.registrationId} 
              isEditing={isEditing}
              color="sky"
              placeholder="e.g. VET-TX-99881"
              onChange={(v) => setFormData({...formData, registrationId: v})}
            />
            <ProfileField 
              icon="briefcase-medical" 
              label="Experience Years" 
              value={formData.experience} 
              isEditing={isEditing}
              color="emerald"
              placeholder="e.g. 12 Years"
              onChange={(v) => setFormData({...formData, experience: v})}
            />
          </div>
          <ProfileField 
            icon="phone" 
            label="Phone Number" 
            value={formData.contact} 
            isEditing={isEditing}
            color="sky"
            placeholder="e.g. +1 555-0102"
            onChange={(v) => setFormData({...formData, contact: v})}
          />
        </div>

        {/* Clinic Info */}
        <div className="space-y-6 pt-4 border-t dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Clinic Name</label>
            {isEditing ? (
              <input 
                type="text"
                value={formData.clinic}
                placeholder="e.g. Green Valley Veterinary"
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-sky-100 dark:border-zinc-700 rounded-xl font-bold outline-none focus:border-sky-400 dark:text-white"
              />
            ) : (
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3 break-words">
                 <i className="fa-solid fa-hospital text-sky-400 shrink-0"></i>
                 {formData.clinic}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimatedStatButton: React.FC<{ 
  label: string, 
  value: number, 
  icon: string, 
  color: string, 
  suffix?: string,
  isBlurred?: boolean
}> = ({ label, value, icon, color, suffix = "", isBlurred }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const end = value;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`relative overflow-hidden p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] group transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] text-left border-4 border-white dark:border-zinc-950 ${color} flex-1 ${isBlurred ? 'backdrop-blur-md shadow-indigo-500/30' : 'shadow-amber-500/30'}`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex flex-col gap-2 relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-md transition-transform duration-300 group-hover:rotate-6">
          <i className={`fa-solid fa-${icon} text-white`}></i>
        </div>
        <div>
          <p className="text-2xl font-black text-white tracking-tighter drop-shadow-md">{displayValue}{suffix}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/90 mt-0.5">{label}</p>
        </div>
      </div>
      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000"></div>
    </div>
  );
};

const ProfileField: React.FC<{ 
  icon: string, 
  label: string, 
  value: string, 
  isEditing?: boolean,
  color?: 'emerald' | 'sky' | 'rose' | 'pink',
  placeholder?: string,
  onChange?: (v: string) => void 
}> = ({ icon, label, value, isEditing, color = 'emerald', placeholder, onChange }) => {
  const colorMap = {
    emerald: 'text-emerald-500',
    sky: 'text-sky-400',
    rose: 'text-rose-500',
    pink: 'text-pink-500',
  };

  const labelColorMap = {
    emerald: 'text-zinc-400',
    sky: 'text-sky-500 dark:text-sky-400',
    rose: 'text-rose-500',
    pink: 'text-pink-500',
  };

  return (
    <div className="space-y-1 group min-w-0">
      <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${labelColorMap[color]}`}>{label}</label>
      <div className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all overflow-hidden ${
        isEditing ? 'bg-white dark:bg-zinc-900 border-sky-50 dark:border-zinc-800 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent group-hover:border-sky-100 dark:group-hover:border-zinc-800'
      }`}>
        <i className={`fa-solid fa-${icon} ${colorMap[color]} text-sm mt-0.5 shrink-0 transition-transform group-hover:scale-110`}></i>
        {isEditing && onChange ? (
          <input 
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none font-bold text-sm text-zinc-800 dark:text-zinc-200 w-full min-w-0`}
          />
        ) : (
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 break-words flex-1 min-w-0">
            {value || <span className="text-zinc-300 italic">Not set</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileScreen;
