
import React from 'react';
import { Doctor } from '../types';

interface DoctorProfileScreenProps {
  doctorProfile: Doctor;
  doctorId: string;
}

const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({ doctorProfile, doctorId }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Professional Profile</h3>
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl">
            <i className="fa-solid fa-address-card"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-lobster text-zinc-800 dark:text-zinc-100">{doctorProfile.name}</h3>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{doctorProfile.specialization}</p>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">UID: {doctorId}</p>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t dark:border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clinic</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{doctorProfile.clinic}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{doctorProfile.contact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileScreen;
