
import React, { useState } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import { NavButton } from '../App';
import DoctorProfileScreen from './DoctorProfileScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorSearchScreen from './DoctorSearchScreen';

interface DoctorDashboardProps {
  doctor: AuthUser;
  petData: {
    pet: PetProfile;
    timeline: TimelineEntry[];
    documents: PetDocument[];
    checklist: DailyChecklist;
    routine: RoutineItem[];
    reminders: Reminder[];
  };
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor, petData, darkMode, setDarkMode }) => {
  const [searchId, setSearchId] = useState('');
  const [viewingPet, setViewingPet] = useState<boolean>(false);
  const [activeMainTab, setActiveMainTab] = useState<'profile' | 'discover' | 'patients'>('discover');
  const [doctorProfile] = useState(doctor.doctorDetails!);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');

  const handleSearch = () => {
    if (searchId.toUpperCase() === petData.pet.id) {
      setViewingPet(true);
    } else {
      alert("Pet ID not found. Try: " + petData.pet.id);
    }
  };

  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewingPet(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="font-black uppercase tracking-widest text-xs">Patient: {petData.pet.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 border border-white/30 hover:bg-white/30 transition-all"
          >
            <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
          </button>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
            Read Only
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        <div className="flex bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-0 z-40 overflow-x-auto no-scrollbar">
           <SubNavTab label="Vitality" active={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} icon="heart-pulse" />
           <SubNavTab label="Journal" active={activeSubTab === 'timeline'} onClick={() => setActiveSubTab('timeline')} icon="calendar-days" />
           <SubNavTab label="Files" active={activeSubTab === 'docs'} onClick={() => setActiveSubTab('docs')} icon="folder-open" />
           <SubNavTab label="Identity" active={activeSubTab === 'identity'} onClick={() => setActiveSubTab('identity')} icon="paw" />
        </div>

        {activeSubTab === 'profile' && (
          <Dashboard 
            pet={petData.pet} 
            reminders={petData.reminders} 
            checklist={petData.checklist} 
            setChecklist={() => {}} 
            routine={petData.routine} 
            setRoutine={() => {}} 
            onCompleteReminder={() => {}} 
          />
        )}
        {activeSubTab === 'timeline' && (
          <TimelineScreen 
            timeline={petData.timeline} 
            setTimeline={() => {}} 
            documents={petData.documents} 
            reminders={petData.reminders} 
            setReminders={() => {}} 
          />
        )}
        {activeSubTab === 'docs' && (
          <DocumentsScreen documents={petData.documents} setDocuments={() => {}} />
        )}
        {activeSubTab === 'identity' && (
          <ProfileScreen pet={petData.pet} setPet={() => {}} />
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMainTab) {
      case 'profile':
        return <DoctorProfileScreen doctorProfile={doctorProfile} doctorId={doctor.doctorDetails?.id || ''} />;
      case 'patients':
        return <DoctorPatientsScreen />;
      case 'discover':
      default:
        return <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={handleSearch} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FFFAF3] dark:bg-zinc-950 relative">
      {viewingPet ? renderPetView() : (
        <>
          <div className="flex-1 p-6 space-y-10 overflow-y-auto custom-scrollbar pb-40">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50">Medical Hub</h2>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Welcome back, Doctor</p>
              </div>
              <div className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl">
                <i className="fa-solid fa-user-doctor text-2xl"></i>
              </div>
            </div>

            {renderContent()}
          </div>

          {/* Fixed Footer Navigation - Elevated for better visibility */}
          <nav className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t-2 border-zinc-200/40 dark:border-zinc-800/40 flex justify-around p-3 pb-10 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
            <NavButton 
              active={activeMainTab === 'patients'} 
              onClick={() => setActiveMainTab('patients')} 
              icon="paw" 
              label="Patients" 
              color="indigo" 
            />
            <NavButton 
              active={activeMainTab === 'discover'} 
              onClick={() => setActiveMainTab('discover')} 
              icon="magnifying-glass" 
              label="Lookup" 
              isAction 
              color="indigo"
            />
            <NavButton 
              active={activeMainTab === 'profile'} 
              onClick={() => setActiveMainTab('profile')} 
              icon="user-md" 
              label="Profile" 
              color="emerald" 
            />
          </nav>
        </>
      )}
    </div>
  );
};

const SubNavTab: React.FC<{ label: string, active: boolean, onClick: () => void, icon: string }> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-6 border-b-4 transition-all ${
      active ? 'border-orange-500 text-orange-600' : 'border-transparent text-zinc-400'
    }`}
  >
    <i className={`fa-solid fa-${icon} text-lg`}></i>
    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

export default DoctorDashboard;
