
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

const MOCK_PET: PetProfile = {
  id: 'PET-LUNA-123',
  name: 'Luna',
  species: Species.Dog,
  breed: 'Golden Retriever',
  dateOfBirth: '2021-06-15',
  gender: Gender.Female,
  weight: '28',
  avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [checklist, setChecklist] = useState<DailyChecklist>({ 
    food: false, water: true, walk: false, medication: false, lastReset: new Date().toISOString() 
  });
  const [routine, setRoutine] = useState<RoutineItem[]>([
    { id: '1', title: 'Morning Kibble', time: '08:00', completed: true, category: 'Food' },
    { id: '2', title: 'Park Adventure', time: '17:30', completed: false, category: 'Walk' }
  ]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // GLOBAL THEME SYNC
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize with rich demo data
  useEffect(() => {
    if (user && !pet) {
      setPet(MOCK_PET);
      setTimeline([
        { id: '1', date: '2024-03-10', type: EntryType.VetVisit, title: 'Annual Checkup', notes: 'Heart rate perfect. Recommended dental cleaning next month.' },
        { id: '2', date: '2024-02-15', type: EntryType.Vaccination, title: 'Rabies Booster', notes: 'Given at Green Valley Clinic.' }
      ]);
      setDocuments([
        { id: 'D1', name: 'Bloodwork_Report', type: 'Report', date: '2024-03-10', fileUrl: '#', fileSize: '1.2 MB' },
        { id: 'D2', name: 'Vet_Invoice_March', type: 'Bill', date: '2024-03-10', fileUrl: '#', fileSize: '450 KB' }
      ]);
      setReminders([
        { id: 'R1', title: 'Heartworm Pill', date: '2024-04-01', type: 'Medication', completed: false },
        { id: 'R2', title: 'Dental Clean', date: '2024-04-15', type: 'Vet follow-up', completed: false }
      ]);

      // Generate 7 days of health trends data
      const logs: Record<string, DailyLog> = {};
      const activities = [45, 60, 30, 85, 40, 55, 70];
      const moods = [4, 5, 3, 5, 4, 4, 5];
      const feedings = [2, 2, 2, 3, 2, 2, 3];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        logs[dateStr] = {
          activityMinutes: activities[i],
          moodRating: moods[i],
          feedingCount: feedings[i]
        };
      }
      setDailyLogs(logs);
    }
  }, [user]);

  const handleUpdatePet = (updated: PetProfile) => setPet(updated);
  const handleUpdateChecklist = (newC: DailyChecklist) => setChecklist(newC);
  const handleUpdateVitals = (date: string, data: Partial<DailyLog>) => {
    setDailyLogs(prev => ({
      ...prev,
      [date]: { ...(prev[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }), ...data }
    }));
  };

  const handleCompleteReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // 1. Remove from reminders
      setReminders(prev => prev.filter(r => r.id !== id));
      // 2. Automatically add to Timeline/Journal
      const newEntry: TimelineEntry = {
        id: `TL-AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: reminder.type === 'Medication' ? EntryType.Medication : 
              reminder.type === 'Vaccination' ? EntryType.Vaccination : EntryType.VetVisit,
        title: reminder.title,
        notes: `Completed from planned care schedule.`
      };
      setTimeline(prev => [newEntry, ...prev]);
    }
  };

  if (!user) return <AuthScreen onLogin={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />;

  const renderContent = () => {
    if (!pet && activeTab !== 'profile') return (
       <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-orange-500 text-4xl shadow-xl animate-spring-jump"><i className="fa-solid fa-paw"></i></div>
          <h2 className="text-3xl font-lobster">Identity Required</h2>
          <button onClick={() => setActiveTab('profile')} className="px-10 py-4 bg-orange-500 text-white rounded-[2rem] font-black uppercase shadow-xl hover:scale-105 transition-all">Setup Profile</button>
       </div>
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard pet={pet!} reminders={reminders} checklist={checklist} setChecklist={handleUpdateChecklist} routine={routine} setRoutine={setRoutine} onCompleteReminder={handleCompleteReminder} timeline={timeline} dailyLogs={dailyLogs} onUpdateLog={handleUpdateVitals} doctorNotes={doctorNotes} onDeleteNote={(id) => setDoctorNotes(prev => prev.filter(n => n.id !== id))} />;
      case 'profile': return <ProfileScreen pet={pet!} setPet={handleUpdatePet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': return <TimelineScreen timeline={timeline} setTimeline={setTimeline} documents={documents} reminders={reminders} setReminders={setReminders} dailyLogs={dailyLogs} onUpdateLog={() => {}} petName={pet?.name} />;
      case 'documents': return <DocumentsScreen documents={documents} setDocuments={setDocuments} petName={pet?.name} />;
      case 'ai': return <AIScreen pet={pet!} timeline={timeline} documents={documents} reminders={reminders} />;
      default: return null;
    }
  };

  // Mobile navigation configuration
  const navItems = [
    { id: 'dashboard', icon: 'house', label: 'Home' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal' },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'Pluto AI', isAction: true },
    { id: 'documents', icon: 'folder-open', label: 'Files' },
    { id: 'profile', icon: 'paw', label: pet?.name || 'Pet' },
  ];

  return (
    <div className={`h-screen flex flex-col md:flex-row transition-colors duration-500 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
        <div className="flex items-center gap-3 mb-16 justify-center">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-spring-jump"><i className="fa-solid fa-paw text-lg"></i></div>
          <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Pluto</h1>
        </div>
        <nav className="flex-1 space-y-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[1.25rem] transition-all border-[3px] ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white border-white dark:border-zinc-900 shadow-xl scale-[1.05]' 
                  : 'text-zinc-800 dark:text-zinc-300 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <i className={`fa-solid fa-${item.icon} text-sm`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-4 px-4 py-3 rounded-[1.25rem] text-zinc-500 hover:text-orange-500 transition-colors">
            <div className="w-6 h-6 relative flex items-center justify-center">
               <i className={`fa-solid fa-moon absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-100 opacity-100 text-amber-300' : 'rotate-180 scale-0 opacity-0'}`}></i>
               <i className={`fa-solid fa-sun absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-100 opacity-100 text-orange-500' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">Theme</span>
          </button>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-4 px-4 py-3 rounded-[1.25rem] text-rose-500 hover:bg-rose-50 transition-all">
            <i className="fa-solid fa-power-off text-sm"></i>
            <span className="font-black text-[10px] uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-[100] px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <button 
          className="flex items-center gap-2 hover:scale-105 active:scale-95 hover:-rotate-2 transition-all group"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs shadow-sm group-hover:rotate-12 transition-transform"><i className="fa-solid fa-paw"></i></div>
          <h1 className="text-xl font-lobster text-zinc-900 dark:text-zinc-50 group-active:text-orange-500 transition-colors">Pluto</h1>
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="w-10 h-10 flex items-center justify-center relative active:scale-90 transition-transform"
          >
            <i className={`fa-solid fa-moon absolute text-xl transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'rotate-[180deg] scale-0 opacity-0'}`}></i>
            <i className={`fa-solid fa-sun absolute text-xl transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : '-rotate-[180deg] scale-0 opacity-0'}`}></i>
          </button>
          {pet && (
            <button onClick={() => setActiveTab('profile')}>
              <img 
                src={pet.avatar} 
                className="w-8 h-8 rounded-full border-2 border-orange-100 dark:border-orange-900 shadow-sm active:scale-90 transition-transform" 
                alt="Pet" 
              />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FFFAF3] dark:bg-zinc-950 pt-16 pb-28 md:pt-0 md:pb-0">
        {renderContent()}
      </main>

      {/* Mobile Floating Frosted Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id as any)}
            icon={item.icon}
            label={item.label}
            isAction={item.isAction}
            petAvatar={item.icon === 'paw' ? pet?.avatar : undefined}
          />
        ))}
      </nav>
    </div>
  );
};

export default App;
