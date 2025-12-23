
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
  DailyLog
} from './types';
import Dashboard from './screens/Dashboard';
import ProfileScreen from './screens/ProfileScreen';
import TimelineScreen from './screens/TimelineScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import { NavButton } from './components/NavButton';

const MOCK_PET: PetProfile = {
  id: 'PET-LUNA-123',
  name: 'Luna',
  species: Species.Dog,
  breed: 'Golden Retriever',
  dateOfBirth: '2021-06-15',
  gender: Gender.Female,
  avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
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
  { id: 'rem1', title: 'Heartworm Dose', date: '2024-02-05', type: 'Medication', completed: false },
  { id: 'rem2', title: 'Rabies Booster', date: '2024-11-20', type: 'Vaccination', completed: false }
];

const MOCK_CHECKLIST: DailyChecklist = {
  food: false,
  water: true,
  walk: false,
  medication: false,
  lastReset: new Date().toISOString()
};

const MOCK_ROUTINE: RoutineItem[] = [
  { id: 'r1', title: 'Morning Walk', time: '07:30', completed: false, category: 'Walk' },
  { id: 'r2', title: 'Breakfast', time: '08:30', completed: true, category: 'Food' },
  { id: 'r3', title: 'Play Time', time: '17:30', completed: false, category: 'Play' }
];

const INITIAL_LOGS: Record<string, DailyLog> = {
  [new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 45, moodRating: 4, feedingCount: 2 },
  [new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 60, moodRating: 5, feedingCount: 2 },
  [new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 30, moodRating: 3, feedingCount: 1 },
  [new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 90, moodRating: 5, feedingCount: 3 },
  [new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 70, moodRating: 4, feedingCount: 2 },
  [new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0]]: { activityMinutes: 85, moodRating: 5, feedingCount: 2 },
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pet, setPet] = useState<PetProfile>(MOCK_PET);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(MOCK_TIMELINE);
  const [documents, setDocuments] = useState<PetDocument[]>(MOCK_DOCUMENTS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [checklist, setChecklist] = useState<DailyChecklist>(MOCK_CHECKLIST);
  const [routine, setRoutine] = useState<RoutineItem[]>(MOCK_ROUTINE);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [doctorActiveTab, setDoctorActiveTab] = useState<'profile' | 'discover' | 'patients'>('discover');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (authUser: AuthUser) => setUser(authUser);
  const handleLogout = () => setUser(null);

  const handleUpdateDailyLog = (date: string, data: Partial<DailyLog>) => {
    setDailyLogs(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }),
        ...data
      }
    }));
  };

  const handleCompleteReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      let entryType = EntryType.Note;
      if (reminder.type === 'Vaccination') entryType = EntryType.Vaccination;
      else if (reminder.type === 'Medication') entryType = EntryType.Medication;
      else if (reminder.type === 'Vet follow-up') entryType = EntryType.VetVisit;

      const newEntry: TimelineEntry = {
        id: `auto-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: entryType,
        title: `${reminder.title}`,
        notes: `Completed scheduled ${reminder.type.toLowerCase()} task.`
      };

      setTimeline(prev => [newEntry, ...prev]);
    }
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  const navigationItems = [
    { id: 'dashboard', icon: 'house', label: 'Home', color: 'orange' as const },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' as const },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'AI', color: 'orange' as const, isAction: true },
    { id: 'documents', icon: 'folder-open', label: 'Files', color: 'amber' as const },
    { id: 'profile', icon: 'paw', label: pet.name, color: 'rose' as const },
  ];

  const renderContent = () => {
    if (user.role === 'DOCTOR') {
      return (
        <DoctorDashboard 
          doctor={user} 
          petData={{ pet, timeline, documents, checklist, routine, reminders }}
          dailyLogs={dailyLogs}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          activeTab={doctorActiveTab}
          setActiveTab={setDoctorActiveTab}
        />
      );
    }

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
            timeline={timeline} 
            dailyLogs={dailyLogs}
            onUpdateLog={handleUpdateDailyLog}
          />
        );
      case 'profile': 
        return <ProfileScreen pet={pet} setPet={setPet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': 
        return <TimelineScreen timeline={timeline} setTimeline={setTimeline} documents={documents} reminders={reminders} setReminders={setReminders} dailyLogs={dailyLogs} onUpdateLog={handleUpdateDailyLog} petName={pet.name} />;
      case 'documents': 
        return <DocumentsScreen documents={documents} setDocuments={setDocuments} />;
      case 'ai': 
        return <AIScreen pet={pet} timeline={timeline} documents={documents} reminders={reminders} />;
      default: 
        return null;
    }
  };

  return (
    <div className="h-screen bg-[#FFFAF3] dark:bg-zinc-950 flex flex-col md:flex-row max-w-7xl mx-auto md:p-6 transition-colors duration-500 overflow-hidden no-scrollbar">
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full sticky top-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/40 dark:border-zinc-800/40 shadow-2xl p-8 mr-8 no-scrollbar overflow-y-auto">
        <div className="flex items-center gap-3 mb-12 group cursor-pointer">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <i className="fa-solid fa-paw text-xl"></i>
          </div>
          <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 group-hover:scale-105 transition-transform">Pluto</h1>
        </div>

        <nav className="flex-1 space-y-4">
          {(user.role === 'DOCTOR' ? [
            { id: 'patients', icon: 'hospital-user', label: 'Patients', color: 'orange' as const },
            { id: 'discover', icon: 'house-medical', label: 'Hub', color: 'orange' as const },
            { id: 'profile', icon: 'address-card', label: 'Identity', color: 'emerald' as const }
          ] : navigationItems).map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (user.role === 'DOCTOR') setDoctorActiveTab(item.id as any);
                else setActiveTab(item.id as any);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                (user.role === 'DOCTOR' ? doctorActiveTab === item.id : activeTab === item.id)
                  ? 'bg-orange-500 text-white shadow-xl translate-x-2' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <i className={`fa-solid fa-${item.icon} text-lg group-hover:scale-110 transition-transform`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-all group">
            <i className={`fa-solid ${darkMode ? 'fa-sun text-yellow-500 animate-spin-slow' : 'fa-moon text-indigo-400'} text-lg group-hover:scale-125 transition-transform`}></i>
            <span className="font-black text-[10px] uppercase tracking-widest">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all group">
            <i className="fa-solid fa-power-off text-lg group-hover:scale-125 transition-transform"></i>
            <span className="font-black text-[10px] uppercase tracking-widest">Sign Out</span>
          </button>
          <div className="flex items-center gap-3 px-2">
            <img src={pet.avatar} className="w-10 h-10 rounded-full border-2 border-orange-500 shadow-md" alt="Pet" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate dark:text-zinc-50">{user.username}</p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-900 md:rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/20 dark:border-zinc-800/50 no-scrollbar">
        <div className="md:hidden p-2 px-3 flex items-center justify-between border-b border-white/20 dark:border-zinc-800/40 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-3xl sticky top-0 z-[60] shadow-sm">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:rotate-12">
              <i className="fa-solid fa-paw text-[12px]"></i>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-lobster tracking-tight">Pluto</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setDarkMode(!darkMode)} className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-amber-300 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-90">
              <i className={`fa-solid ${darkMode ? 'fa-sun animate-spin-slow' : 'fa-moon'} text-sm`}></i>
            </button>
            <button onClick={handleLogout} className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100/50 dark:border-rose-900/30 active:scale-90">
              <i className="fa-solid fa-power-off text-xs"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative pb-32 md:pb-0">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>

        <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-zinc-800/40 rounded-[2rem] flex justify-around items-center p-1.5 pb-2.5 z-[80] shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all">
          {(user.role === 'DOCTOR' ? [
            { id: 'patients', icon: 'hospital-user', label: 'Patients', color: 'orange' as const },
            { id: 'discover', icon: 'house-medical', label: 'Hub', color: 'orange' as const, isAction: true },
            { id: 'profile', icon: 'address-card', label: 'Identity', color: 'emerald' as const }
          ] : navigationItems).map(item => (
            <NavButton 
              key={item.id} 
              active={user.role === 'DOCTOR' ? doctorActiveTab === item.id : activeTab === item.id} 
              onClick={() => {
                if (user.role === 'DOCTOR') setDoctorActiveTab(item.id as any);
                else setActiveTab(item.id as any);
              }} 
              icon={item.icon} 
              label={item.label} 
              color={item.color} 
              isAction={item.isAction}
              petAvatar={user.role === 'PET_OWNER' ? pet.avatar : undefined}
            />
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
