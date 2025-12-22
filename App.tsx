
import React, { useState, useEffect } from 'react';
import { 
  PetProfile, 
  Species, 
  Gender, 
  TimelineEntry, 
  PetDocument, 
  Reminder, 
  DailyChecklist,
  EntryType,
  RoutineItem,
  AuthUser,
  Doctor
} from './types';
import Dashboard from './screens/Dashboard';
import ProfileScreen from './screens/ProfileScreen';
import TimelineScreen from './screens/TimelineScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';
import DoctorDashboard from './screens/DoctorDashboard';

const MOCK_PET: PetProfile = {
  id: 'PET-LUNA-123',
  name: 'Luna',
  species: Species.Dog,
  breed: 'Golden Retriever',
  dateOfBirth: '2021-06-15',
  gender: Gender.Female,
  avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200'
};

const MOCK_TIMELINE: TimelineEntry[] = [
  { id: '1', date: '2023-11-20', type: EntryType.VetVisit, title: 'Annual Checkup', notes: 'All clear, Luna is healthy!' },
  { id: '2', date: '2023-11-20', type: EntryType.Vaccination, title: 'Rabies Booster' },
  { id: '3', date: '2024-01-05', type: EntryType.Medication, title: 'Heartworm Prevention', notes: 'Monthly dose administered' }
];

const MOCK_DOCUMENTS: PetDocument[] = [
  { id: 'doc1', name: 'Annual Report 2023', type: 'Report', date: '2023-11-20', fileUrl: '#', fileSize: '1.2 MB' },
  { id: 'doc2', name: 'Heartworm Prescription', type: 'Prescription', date: '2024-01-05', fileUrl: '#', fileSize: '450 KB' }
];

const MOCK_REMINDERS: Reminder[] = [
  { id: 'rem1', title: 'Heartworm Dose', date: '2024-02-05', type: 'Medication', repeat: 'Monthly', completed: false },
  { id: 'rem2', title: 'Dental Cleaning', date: '2024-03-15', type: 'Vet follow-up', completed: false }
];

const MOCK_CHECKLIST: DailyChecklist = {
  food: true,
  water: true,
  walk: false,
  medication: false,
  lastReset: new Date().toISOString().split('T')[0]
};

const MOCK_ROUTINE: RoutineItem[] = [
  { id: '1', title: 'Morning Kibble', time: '08:00', completed: true, category: 'Food' },
  { id: '2', title: 'Garden Play', time: '10:30', completed: false, category: 'Play' },
  { id: '3', title: 'Evening Walk', time: '18:00', completed: false, category: 'Walk' },
];

const MOCK_CONSULTED_DOCTORS: Doctor[] = [
  { id: 'DOC-SMITH-45', name: 'Dr. Sarah Smith', specialization: 'Cardiology Specialist', clinic: 'Green Valley Clinic', contact: '555-0102' },
  { id: 'DOC-WONG-99', name: 'Dr. Mike Wong', specialization: 'Dental Vet', clinic: 'Smile Pet Center', contact: '555-0199' }
];

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [pet, setPet] = useState<PetProfile>(MOCK_PET);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(MOCK_TIMELINE);
  const [documents, setDocuments] = useState<PetDocument[]>(MOCK_DOCUMENTS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [checklist, setChecklist] = useState<DailyChecklist>(MOCK_CHECKLIST);
  const [routine, setRoutine] = useState<RoutineItem[]>(MOCK_ROUTINE);
  const [consultedDoctors] = useState<Doctor[]>(MOCK_CONSULTED_DOCTORS);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (checklist.lastReset !== today) {
      setChecklist({
        food: false,
        water: false,
        walk: false,
        medication: false,
        lastReset: today
      });
      setRoutine(prev => prev.map(item => ({ ...item, completed: false })));
    }
  }, [checklist.lastReset]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCompleteReminder = (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: reminder.type === 'Vaccination' ? EntryType.Vaccination : 
            reminder.type === 'Medication' ? EntryType.Medication : EntryType.VetVisit,
      title: `Completed: ${reminder.title}`,
      notes: `Event completed and logged from home reminders.`
    };

    setTimeline(prev => [newEntry, ...prev]);
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            pet={pet} 
            reminders={reminders} 
            checklist={checklist} 
            setChecklist={setChecklist}
            routine={routine}
            setRoutine={setRoutine}
            onCompleteReminder={handleCompleteReminder}
          />
        );
      case 'profile':
        return <ProfileScreen pet={pet} setPet={setPet} />;
      case 'timeline':
        return (
          <TimelineScreen 
            timeline={timeline} 
            setTimeline={setTimeline} 
            documents={documents} 
            reminders={reminders}
            setReminders={setReminders}
            consultedDoctors={consultedDoctors}
          />
        );
      case 'documents':
        return <DocumentsScreen documents={documents} setDocuments={setDocuments} />;
      case 'ai':
        return <AIScreen pet={pet} timeline={timeline} documents={documents} reminders={reminders} />;
      default:
        return <Dashboard pet={pet} reminders={reminders} checklist={checklist} setChecklist={setChecklist} routine={routine} setRoutine={setRoutine} onCompleteReminder={handleCompleteReminder} />;
    }
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (user.role === 'DOCTOR') {
    return (
      <div className="flex flex-col h-screen max-w-lg mx-auto bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden relative font-comic transition-colors">
        <header className="p-4 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl sticky top-0 z-40 transition-all shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-full flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-user-doctor text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-lobster tracking-tight">Pluto Doctor</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm border-2 ${
                darkMode 
                  ? 'bg-zinc-900/50 text-amber-300 border-zinc-800/50' 
                  : 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50'
              }`}
            >
              <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>
            <button 
              onClick={() => setUser(null)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors shadow-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </header>
        <DoctorDashboard 
          doctor={user} 
          petData={{ pet, timeline, documents, checklist, routine, reminders }} 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden relative font-comic transition-colors">
      <header className="p-4 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl sticky top-0 z-40 transition-all shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center text-black shadow-md hover:rotate-12 transition-transform cursor-pointer">
            <i className="fa-solid fa-paw text-lg"></i>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-lobster tracking-tight">Pluto</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm border-2 ${
              darkMode 
                ? 'bg-zinc-900/50 text-amber-300 border-zinc-800/50' 
                : 'bg-orange-50/50 text-orange-600 border-orange-100/50'
            }`}
          >
            <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
          <button 
            onClick={() => setUser(null)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar pb-32 text-zinc-900 dark:text-zinc-100">
        {renderScreen()}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t-2 border-zinc-200/40 dark:border-zinc-800/40 flex justify-around p-3 pb-10 z-50 transition-all shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="house" label="Home" color="orange" />
        <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon="calendar-days" label="Journal" color="emerald" />
        <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon="sparkles" label="Pluto AI" isAction petAvatar={pet.avatar} />
        <NavButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon="folder-open" label="Files" color="amber" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="paw" label={pet.name} color="rose" />
      </nav>
    </div>
  );
};

export const NavButton: React.FC<{ 
  active: boolean, 
  onClick: () => void, 
  icon: string, 
  label: string,
  isAction?: boolean,
  color?: 'orange' | 'emerald' | 'amber' | 'rose' | 'indigo',
  petAvatar?: string
}> = ({ active, onClick, icon, label, isAction, color = 'orange', petAvatar }) => {
  const colorMap = {
    orange: 'text-orange-600 dark:text-orange-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  if (isAction) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all relative -top-6 group z-50">
        <div className="absolute inset-0 bg-white dark:bg-zinc-950 rounded-2xl scale-[1.05] shadow-sm pointer-events-none"></div>
        
        <div className={`
          w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-xl border-2 relative overflow-hidden
          ${active 
            ? `${color === 'indigo' ? 'bg-indigo-600' : 'bg-orange-500'} text-white shadow-xl scale-110 border-white/40` 
            : 'bg-zinc-100/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-500 dark:text-zinc-400 shadow-sm hover:scale-110 border-zinc-200/50 dark:border-zinc-800/50'
          }
        `}>
          {petAvatar && !active ? (
            <div className="flex flex-col items-center justify-center gap-0.5">
               <img src={petAvatar} className="w-8 h-8 rounded-full border border-white/50" alt="pet" />
               <i className="fa-solid fa-sparkles text-[10px] text-orange-400 opacity-60"></i>
            </div>
          ) : (
            <i className={`fa-solid fa-${icon} text-2xl`}></i>
          )}
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-500'} truncate max-w-[64px] transition-colors`}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95">
      <div className={`
        w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-md border-2
        ${active 
          ? `bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 ${colorMap[color]}` 
          : 'bg-transparent border-transparent text-zinc-500 dark:text-zinc-600'
        }
      `}>
        <i className={`fa-solid fa-${icon} text-xl`}></i>
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-500'} truncate max-w-[64px] transition-colors`}>
        {label}
      </span>
    </button>
  );
};

export default App;
