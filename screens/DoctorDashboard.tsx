
import React, { useState, useEffect } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import { NavButton } from '../components/NavButton';
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
  
  // Track visited patients for the session
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set(['PET-LUNA-123']));

  const handleSearch = (id?: string) => {
    const targetId = (id || searchId).toUpperCase();
    if (targetId === petData.pet.id || targetId.startsWith('PET-')) {
      setVisitedPatientIds(prev => new Set([...Array.from(prev), targetId]));
      setViewingPet(true);
    } else {
      alert("Pet ID not found. Try searching for: " + petData.pet.id);
    }
  };

  // Logic for Priority Care: Filter items only if they belong to a pet that has something due 
  // and is in our "visited/recent" scope.
  const getPriorityItems = () => {
    const items = [];
    if (visitedPatientIds.has('PET-LUNA-123')) {
      const dueMeds = petData.reminders.filter(r => !r.completed);
      if (dueMeds.length > 0) {
        items.push({
          id: 'p1',
          title: `${petData.pet.name}'s ${dueMeds[0].type}`,
          detail: `Due: ${dueMeds[0].title}`,
          type: "Urgent",
          color: "bg-rose-100 text-rose-600 border-rose-200",
          targetId: 'PET-LUNA-123'
        });
      }
    }
    
    // Mocking an entry for another "recent" patient if they were visited
    const others = Array.from(visitedPatientIds).filter(id => id !== 'PET-LUNA-123');
    if (others.length > 0) {
      items.push({
        id: 'p2',
        title: `${others[0].split('-')[1]}'s Lab Results`,
        detail: "Awaiting clinical review",
        type: "Review",
        color: "bg-amber-100 text-amber-600 border-amber-200",
        targetId: others[0]
      });
    }

    return items;
  };

  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewingPet(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all active:scale-90">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <span className="font-black uppercase tracking-widest text-[10px] block opacity-80">Patient View</span>
            <span className="font-bold text-sm tracking-tight">{petData.pet.name}</span>
          </div>
        </div>
        <div className="bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/30 backdrop-blur-md">
          Medical Access
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        <div className="flex bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-0 z-40 overflow-x-auto no-scrollbar shadow-sm">
           <SubNavTab label="Pulse" active={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} icon="heart-pulse" />
           <SubNavTab label="Journal" active={activeSubTab === 'timeline'} onClick={() => setActiveSubTab('timeline')} icon="calendar-days" />
           <SubNavTab label="Files" active={activeSubTab === 'docs'} onClick={() => setActiveSubTab('docs')} icon="folder-open" />
           <SubNavTab label="Profile" active={activeSubTab === 'identity'} onClick={() => setActiveSubTab('identity')} icon="id-badge" />
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
          <ProfileScreen 
            pet={petData.pet} 
            setPet={() => {}} 
            reminders={petData.reminders} 
          />
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMainTab) {
      case 'profile':
        return <DoctorProfileScreen doctorProfile={doctorProfile} doctorId={doctor.doctorDetails?.id || ''} />;
      case 'patients':
        return <DoctorPatientsScreen onViewRecords={(id) => handleSearch(id)} />;
      case 'discover':
      default:
        const priorityItems = getPriorityItems();
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
             {/* Quick Stats Grid */}
             <div className="grid grid-cols-2 gap-5">
                <StatCard label="Patients Visited" value={visitedPatientIds.size} icon="users" color="bg-indigo-500" />
                <StatCard label="Pending Care" value={priorityItems.length} icon="bell" color="bg-amber-500" />
             </div>

             {/* Dynamic Priority Section */}
             {priorityItems.length > 0 && (
               <section className="space-y-4">
                  <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 px-2">Priority Care</h3>
                  <div className="space-y-4">
                     {priorityItems.map(item => (
                       <PriorityItem 
                         key={item.id}
                         title={item.title} 
                         detail={item.detail} 
                         type={item.type} 
                         color={item.color} 
                         onClick={() => handleSearch(item.targetId)}
                       />
                     ))}
                  </div>
               </section>
             )}

             <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={() => handleSearch()} />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FFFAF3] dark:bg-zinc-950 relative">
      {viewingPet ? renderPetView() : (
        <>
          <div className="flex-1 p-6 space-y-10 overflow-y-auto custom-scrollbar pb-40">
            {/* Professional Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">Practice Hub</h2>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mt-1">
                   Medical Command Center
                </p>
              </div>
              <div className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-indigo-100 dark:border-zinc-800 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-xl transition-transform hover:rotate-6">
                <i className="fa-solid fa-user-md text-2xl"></i>
              </div>
            </div>

            {renderContent()}
          </div>

          <nav className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t-2 border-zinc-200/40 dark:border-zinc-800/40 flex justify-around p-3 pb-10 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
            <NavButton 
              active={activeMainTab === 'patients'} 
              onClick={() => setActiveMainTab('patients')} 
              icon="hospital-user" 
              label="Patients" 
              color="indigo" 
            />
            <NavButton 
              active={activeMainTab === 'discover'} 
              onClick={() => setActiveMainTab('discover')} 
              icon="house-medical" 
              label="Hub" 
              isAction 
              color="indigo"
            />
            <NavButton 
              active={activeMainTab === 'profile'} 
              onClick={() => setActiveMainTab('profile')} 
              icon="address-card" 
              label="Identity" 
              color="emerald" 
            />
          </nav>
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: string, color: string }> = ({ label, value, icon, color }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < value) {
        setDisplayValue(Math.floor(start));
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animate();
  }, [value]);

  return (
    <div className={`${color} p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl cursor-default`}>
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <i className={`fa-solid fa-${icon} text-xl mb-3 opacity-60 transition-transform duration-300 group-hover:-translate-y-1`}></i>
      <p className="text-3xl font-black group-hover:scale-110 origin-left transition-transform duration-300">{displayValue}</p>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-1">{label}</p>
    </div>
  );
};

const PriorityItem: React.FC<{ title: string, detail: string, type: string, color: string, onClick: () => void }> = ({ title, detail, type, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border-2 border-zinc-50 dark:border-zinc-800 flex items-center gap-4 text-left hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm transition-all group active:scale-[0.98]"
  >
     <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${color}`}>
        {type}
     </div>
     <div className="flex-1">
        <h5 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{title}</h5>
        <p className="text-[10px] text-zinc-400 font-bold">{detail}</p>
     </div>
     <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
  </button>
);

const SubNavTab: React.FC<{ label: string, active: boolean, onClick: () => void, icon: string }> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-6 border-b-4 transition-all ${
      active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-zinc-400'
    }`}
  >
    <i className={`fa-solid fa-${icon} text-lg`}></i>
    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

export default DoctorDashboard;
