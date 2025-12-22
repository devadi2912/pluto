
import React from 'react';

const DoctorPatientsScreen: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Recent Cases</h3>
      <div className="text-center py-20 bg-white/40 dark:bg-zinc-900/40 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700 shadow-inner">
          <i className="fa-solid fa-paw text-5xl"></i>
        </div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-10">
          No previous patient records are currently active in your session
        </p>
      </div>
    </div>
  );
};

export default DoctorPatientsScreen;
