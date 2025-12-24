
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
  DailyLog,
  DoctorNote
} from './types';
import Dashboard from './screens/Dashboard';
import ProfileScreen from './screens/ProfileScreen';
import TimelineScreen from './screens/TimelineScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import { NavButton } from './components/NavButton';

// Define a type for navigation items to ensure type safety across different user roles
interface NavItem {
  id: string;
  icon: string;
  label: string;
  color: 'orange' | 'emerald' | 'amber' | 'rose' | 'indigo';
  isAction?: boolean;
}

const MOCK_PET: PetProfile = {
  id: 'PET-LUNA-123',
  name: 'Luna',
  species: Species.Dog,
  breed: 'Golden Retriever',
  dateOfBirth: '2021-06-15',
  gender: Gender.Female,
  avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400',
  weight: '28'
};

const MOCK_TIMELINE: TimelineEntry[] = [
  { id: '1', date: '2023-11-20', type: EntryType.VetVisit, title: 'Annual Checkup', notes: 'All clear, Luna is healthy!' },
  { id: '2', date: '2023-11-20', type: EntryType.Vaccination, title: 'Rabies Booster' },
  { id: '3', date: '2024-01-05', type: EntryType.Medication, title: 'Heartworm Prevention', notes: 'Monthly dose administered' }
];

const MOCK_DOCUMENTS: PetDocument[] = [
  { id: 'doc1', name: 'Annual Report 2023', type: 'Report', date: '2023-11-20', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSize: '1.2 MB' },
  { id: 'doc2', name: 'Heartworm Prescription', type: 'Prescription', date: '2024-01-05', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSize: '450 KB' }
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
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  // Doctor specific navigation states
  const [doctorActiveTab, setDoctorActiveTab] = useState<'profile' | 'discover' | 'patients'>('discover');
  const [doctorIsViewingPatient, setDoctorIsViewingPatient] = useState(false);
  const [patientSubTab, setPatientSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (authUser: AuthUser) => setUser(authUser);
  const handleLogout = () => {
    setUser(null);
    setDoctorIsViewingPatient(false);
  };

  const handleUpdateDailyLog = (date: string, data: Partial<DailyLog>) => {
    setDailyLogs(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }),
        ...data
      }
    }));
  };

  const handleAddDoctorNote = (note: DoctorNote) => {
    setDoctorNotes(prev => [note, ...prev]);
  };

  const handleDeleteDoctorNote = (id: string) => {
    setDoctorNotes(prev => prev.filter(n => n.id !== id));
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

  // Navigation Items
  const ownerNavItems: NavItem[] = [
    { id: 'dashboard', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'AI', color: 'orange', isAction: true },
    { id: 'documents', icon: 'folder-open', label: 'Files', color: 'amber' },
    { id: 'profile', icon: 'paw', label: pet.name, color: 'rose' },
  ];

  const doctorPatientNavItems: NavItem[] = [
    { id: 'profile', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'docs', icon: 'folder-open', label: 'Files', color: 'amber' },
    { id: 'identity', icon: 'paw', label: pet.name, color: 'rose' },
  ];

  const doctorNavItems: NavItem[] = [
    { id: 'patients', icon: 'hospital-user', label: 'Patients', color: 'orange' },
    { id: 'discover', icon: 'house-medical', label: 'Hub', color: 'orange', isAction: true },
    { id: 'profile', icon: 'address-card', label: 'Identity', color: 'emerald' }
  ];

  const renderContent = () => {
    if (user.role === 'DOCTOR') {
      return (
        <DoctorDashboard 
          doctor={user} 
          petData={{ pet, timeline, documents, checklist, routine, reminders }}
          dailyLogs={dailyLogs}
          doctorNotes={doctorNotes}
          onAddNote={handleAddDoctorNote}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          activeTab={doctorActiveTab}
          setActiveTab={setDoctorActiveTab}
          isViewingPatient={doctorIsViewingPatient}
          setIsViewingPatient={setDoctorIsViewingPatient}
          patientSubTab={patientSubTab}
          setPatientSubTab={setPatientSubTab}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard pet={pet} reminders={reminders} checklist={checklist} setChecklist={setChecklist} routine={routine} setRoutine={setRoutine} onCompleteReminder={handleCompleteReminder} timeline={timeline} dailyLogs={dailyLogs} onUpdateLog={handleUpdateDailyLog} doctorNotes={doctorNotes} onDeleteNote={handleDeleteDoctorNote} />;
      case 'profile': 
        return <ProfileScreen pet={pet} setPet={setPet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': 
        return <TimelineScreen timeline={timeline} setTimeline={setTimeline} documents={documents} reminders={reminders} setReminders={setReminders} dailyLogs={dailyLogs} onUpdateLog={handleUpdateDailyLog} petName={pet.name} />;
      case 'documents': 
        return <DocumentsScreen documents={documents} setDocuments={setDocuments} petName={pet.name} />;
      case 'ai': 
        return <AIScreen pet={pet} timeline={timeline} documents={documents} reminders={reminders} />;
      default: 
        return null;
    }
  };

  const currentNavItems = user.role === 'DOCTOR' 
    ? (doctorIsViewingPatient ? doctorPatientNavItems : doctorNavItems) 
    : ownerNavItems;
    
  const currentActiveTab = user.role === 'DOCTOR' 
    ? (doctorIsViewingPatient ? patientSubTab : doctorActiveTab) 
    : activeTab;

  return (
    <div className="h-screen bg-[#FFFAF3] dark:bg-zinc-950 flex flex-col md:flex-row transition-colors duration-500 overflow-hidden no-scrollbar">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-r border-white/40 dark:border-zinc-800/40 shadow-xl p-8 no-scrollbar overflow-y-auto shrink-0 relative z-[100]">
        <div className="flex items-center gap-3 mb-16 group cursor-pointer justify-center">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <i className="fa-solid fa-paw text-lg"></i>
          </div>
          <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 group-hover:scale-105 transition-transform">Pluto</h1>
        </div>

        <nav className="flex-1 space-y-3">
          {currentNavItems.map(item => {
            const isActive = currentActiveTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (user.role === 'DOCTOR') {
                    if (doctorIsViewingPatient) setPatientSubTab(item.id as any);
                    else setDoctorActiveTab(item.id as any);
                  } else {
                    setActiveTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-[1.25rem] transition-all duration-500 group relative border-[3px] ${
                  isActive
                    ? 'bg-orange-500 text-white border-white dark:border-zinc-950 shadow-[0_20px_50px_rgba(249,115,22,0.5)] scale-[1.1]' 
                    : 'text-zinc-800 dark:text-zinc-300 border-transparent hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {(item.id === 'profile' || item.id === 'identity') && pet.avatar ? (
                  <img src={pet.avatar} className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-white' : 'border-zinc-300 dark:border-zinc-700'}`} alt="avatar" />
                ) : (
                  <i className={`fa-solid fa-${item.icon} text-sm group-hover:scale-110 transition-transform ${isActive ? 'animate-pulse' : ''}`}></i>
                )}
                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                {isActive && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-white dark:bg-zinc-950 rounded-r-full animate-in fade-in"></div>}
              </button>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 mt-8">
          {/* Back to Practice Button for Doctors in Patient View */}
          {user.role === 'DOCTOR' && doctorIsViewingPatient && (
            <button 
              onClick={() => setDoctorIsViewingPatient(false)}
              className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mb-2 border-4 border-white dark:border-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(0,0,0,0.4)]"
            >
              <i className="fa-solid fa-arrow-left-long"></i>
              Back to Practice
            </button>
          )}

          <div className="flex gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                darkMode 
                  ? 'bg-zinc-800 text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.3)]' 
                  : 'bg-white text-orange-600 shadow-[0_0_35px_rgba(30,58,138,0.2)]'
              }`}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-yellow-500 animate-spin-slow' : 'fa-moon text-indigo-400 animate-bounce'} text-base`}></i>
              <span className="font-black text-[9px] uppercase tracking-widest">Theme</span>
            </button>
            <button onClick={handleLogout} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-rose-500 bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-all group border border-transparent">
              <i className="fa-solid fa-power-off text-base group-hover:rotate-12 transition-transform"></i>
              <span className="font-black text-[9px] uppercase tracking-widest">Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden relative border-l border-white/20 dark:border-zinc-800/50 no-scrollbar">
        {/* Mobile Header */}
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

        <div className="flex-1 overflow-y-auto no-scrollbar relative h-full">
          <div className="max-w-5xl mx-auto min-h-full">
            {renderContent()}
          </div>
        </div>

        {/* Floating Mobile Footer Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[88%] bg-white/10 dark:bg-zinc-900/10 backdrop-blur-3xl backdrop-saturate-[1.8] border border-white/30 dark:border-zinc-800/30 rounded-full flex justify-around items-center py-1.5 px-2 z-[150] shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
          {currentNavItems.map(item => (
            <NavButton 
              key={item.id} 
              active={currentActiveTab === item.id} 
              onClick={() => {
                if (user.role === 'DOCTOR') {
                  if (doctorIsViewingPatient) setPatientSubTab(item.id as any);
                  else setDoctorActiveTab(item.id as any);
                } else {
                  setActiveTab(item.id as any);
                }
              }} 
              icon={item.icon} 
              label={item.label} 
              color={item.color} 
              isAction={item.isAction}
              petAvatar={(user.role === 'PET_OWNER' || doctorIsViewingPatient) ? pet.avatar : undefined}
            />
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
