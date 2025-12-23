
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import { NavButton } from '../components/NavButton';
import DoctorProfileScreen from './DoctorProfileScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorSearchScreen from './DoctorSearchScreen';

interface PriorityItemData {
  id: string;
  title: string;
  detail: string;
  type: string;
  color: string;
  targetId: string;
}

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
  dailyLogs: Record<string, DailyLog>;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTab: 'profile' | 'discover' | 'patients';
  setActiveTab: (tab: 'profile' | 'discover' | 'patients') => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  doctor, 
  petData, 
  dailyLogs,
  darkMode, 
  setDarkMode,
  activeTab,
  setActiveTab
}) => {
  const [searchId, setSearchId] = useState('');
  const [viewingPet, setViewingPet] = useState<boolean>(false);
  const [doctorProfile] = useState(doctor.doctorDetails!);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');
  
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set());
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  const handleSearch = (id?: string) => {
    const targetId = (id || searchId).toUpperCase();
    
    if (targetId === petData.pet.id || targetId.startsWith('PET-')) {
      const isNewVisit = !visitedPatientIds.has(targetId);
      setVisitedPatientIds(prev => new Set([...Array.from(prev), targetId]));
      
      if (targetId === petData.pet.id) {
        const newItems: PriorityItemData[] = petData.reminders
          .filter(r => !r.completed)
          .map(r => ({
            id: `p-${r.id}-${Date.now()}`,
            title: `${petData.pet.name}'s ${r.type}`,
            detail: `Due: ${r.title}`,
            type: "Urgent",
            color: "bg-rose-100 text-rose-600 border-rose-200",
            targetId: targetId
          }))
          .filter(newItem => !priorityItems.some(existing => existing.title === newItem.title));
        
        setPriorityItems(prev => [...prev, ...newItems]);
      } else if (isNewVisit) {
        const mockItem: PriorityItemData = {
          id: `p-${targetId}-${Date.now()}`,
          title: `${targetId.split('-')[1]}'s Follow-up`,
          detail: "Check recent lab reports",
          type: "Review",
          color: "bg-amber-100 text-amber-600 border-amber-200",
          targetId: targetId
        };
        setPriorityItems(prev => [...prev, mockItem]);
      }

      setViewingPet(true);
    } else {
      alert("Pet ID not found. Try searching for: " + petData.pet.id);
    }
  };

  const removePriorityItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 overflow-hidden">
      {/* Patient Header */}
      <div className="p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-[70] shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewingPet(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all active:scale-90">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <span className="font-black uppercase tracking-widest text-[10px] block opacity-80">Patient View</span>
            <span className="font-bold text-sm tracking-tight">{petData.pet.name}</span>
          </div>
        </div>
        <div className="bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Medical Access</div>
      </div>

      <div className="flex-1 overflow-y-auto pb-60 no-scrollbar">
        {/* Context Navigation for Doctor */}
        <div className="flex bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-0 z-[60] overflow-x-auto no-scrollbar shadow-sm">
           <SubNavTab label="Pulse" active={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} icon="heart-pulse" />
           <SubNavTab label="Journal" active={activeSubTab === 'timeline'} onClick={() => setActiveSubTab('timeline')} icon="calendar-days" />
           <SubNavTab label="Files" active={activeSubTab === 'docs'} onClick={() => setActiveSubTab('docs')} icon="folder-open" />
           <SubNavTab label="Profile" active={activeSubTab === 'identity'} onClick={() => setActiveSubTab('identity')} icon="id-badge" />
        </div>

        <div className="relative z-10">
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <Dashboard 
                pet={petData.pet} 
                reminders={petData.reminders} 
                checklist={petData.checklist} 
                setChecklist={() => {}} 
                routine={petData.routine} 
                setRoutine={() => {}} 
                onCompleteReminder={() => {}}
                timeline={petData.timeline}
                dailyLogs={dailyLogs}
                onUpdateLog={() => {}}
              />
            </div>
          )}
          {activeSubTab === 'timeline' && (
            <TimelineScreen 
              timeline={petData.timeline} 
              setTimeline={() => {}} 
              documents={petData.documents} 
              reminders={petData.reminders} 
              setReminders={() => {}} 
              dailyLogs={dailyLogs}
              onUpdateLog={handleSearch as any}
              petName={petData.pet.name}
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DoctorProfileScreen doctorProfile={doctorProfile} doctorId={doctor.doctorDetails?.id || ''} />;
      case 'patients':
        return <DoctorPatientsScreen onViewRecords={(id) => handleSearch(id)} />;
      case 'discover':
      default:
        return (
          <div className="space-y-10 animate-in fade-in duration-500 pb-60">
             <div className="grid grid-cols-2 gap-5">
                <StatCard label="Total Patients" value={visitedPatientIds.size} icon="users" color="bg-emerald-500" />
                <StatCard label="Pending Care" value={priorityItems.length} icon="bell" color="bg-orange-500" />
             </div>

             <section className="space-y-4">
                <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 px-2">Priority Care</h3>
                {priorityItems.length === 0 ? (
                  <div className="bg-white/50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                    <i className="fa-solid fa-clipboard-check text-4xl text-zinc-200 dark:text-zinc-800 mb-4"></i>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No Active Priorities</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-2 font-bold">Search for a patient to stack priorities.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {priorityItems.map(item => (
                       <PriorityItem 
                         key={item.id}
                         title={item.title} 
                         detail={item.detail} 
                         type={item.type} 
                         color={item.color} 
                         onClick={() => handleSearch(item.targetId)}
                         onRemove={(e) => removePriorityItem(item.id, e)}
                       />
                     ))}
                  </div>
                )}
             </section>

             <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={() => handleSearch()} />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative no-scrollbar">
      {viewingPet ? renderPetView() : (
        <div className="flex-1 p-6 space-y-10 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">Practice Hub</h2>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.25em] mt-1">
                 Medical Command Center
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-emerald-100 dark:border-zinc-800 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-xl transition-all hover:rotate-6 active:scale-90"
            >
              <i className="fa-solid fa-user-md text-2xl"></i>
            </button>
          </div>

          {renderContent()}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: string, color: string }> = ({ label, value, icon, color }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1000;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
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

const PriorityItem: React.FC<{ 
  title: string, 
  detail: string, 
  type: string, 
  color: string, 
  onClick: () => void,
  onRemove: (e: React.MouseEvent) => void
}> = ({ title, detail, type, color, onClick, onRemove }) => (
  <button onClick={onClick} className="w-full bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border-2 border-zinc-50 dark:border-zinc-800 flex items-center gap-4 text-left hover:border-orange-100 dark:hover:border-zinc-700 shadow-sm transition-all group active:scale-[0.98] relative">
     <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${color}`}>{type}</div>
     <div className="flex-1">
        <h5 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{title}</h5>
        <p className="text-[10px] text-zinc-400 font-bold">{detail}</p>
     </div>
     <button onClick={onRemove} className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center border border-transparent hover:border-rose-100">
        <i className="fa-solid fa-xmark text-[10px]"></i>
     </button>
     <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-orange-400 group-hover:translate-x-1 transition-all ml-1"></i>
  </button>
);

const SubNavTab: React.FC<{ label: string, active: boolean, onClick: () => void, icon: string }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-2 py-4 px-6 border-b-4 transition-all ${active ? 'border-orange-500 text-orange-600' : 'border-transparent text-zinc-400'}`}>
    <i className={`fa-solid fa-${icon} text-lg`}></i>
    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

export default DoctorDashboard;
