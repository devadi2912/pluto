
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
  DoctorNote,
  Doctor
} from './types';
import Dashboard from './screens/Dashboard';
import ProfileScreen from './screens/ProfileScreen';
import TimelineScreen from './screens/TimelineScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import { NavButton } from './components/NavButton';
import { api } from './lib/api';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unverifiedUser, setUnverifiedUser] = useState<FirebaseUser | null>(null); // State for unverified session
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [checklist, setChecklist] = useState<DailyChecklist>({ 
    food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() 
  });
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);
  const [consultedDoctors, setConsultedDoctors] = useState<Doctor[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Doctor Dashboard State
  const [doctorTab, setDoctorTab] = useState<'profile' | 'discover' | 'patients'>('discover');
  const [doctorViewingPatient, setDoctorViewingPatient] = useState(false);
  const [doctorPatientSubTab, setDoctorPatientSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');

  // GLOBAL THEME SYNC
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // CHECK 1: Is email verified?
        if (!firebaseUser.emailVerified) {
          // User exists but isn't verified. 
          // Set specific state so AuthScreen can show the verify prompt.
          setUnverifiedUser(firebaseUser);
          setUser(null);
          setIsAuthLoading(false);
          return;
        }

        // Verified! proceed to load app data.
        setUnverifiedUser(null);
        try {
          const profile = await api.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            // Edge case: Auth exists but no local data found (e.g. cleared browser cache)
            console.warn("Auth valid but local profile missing.");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        // User is signed out
        setUser(null);
        setUnverifiedUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch data from API for the logged-in pet
  const fetchPetRecords = async (petId: string) => {
    try {
      const data = await api.getPetRecords(petId);
      if (data.timeline) setTimeline(data.timeline);
      if (data.reminders) setReminders(data.reminders);
      if (data.documents) setDocuments(data.documents);
      if (data.doctorNotes) setDoctorNotes(data.doctorNotes);
      if (data.checklist) setChecklist(data.checklist);
      if (data.dailyLogs) setDailyLogs(data.dailyLogs);
      if (data.routines) setRoutine(data.routines);
      if (data.consultedDoctors) setConsultedDoctors(data.consultedDoctors); // Sync doctors
    } catch (err) {
      console.error("[App] Error fetching records:", err);
    }
  };

  // Sync state when user logs in
  useEffect(() => {
    if (user) {
      if (user.role === 'PET_OWNER' && user.petDetails) {
        setPet(user.petDetails);
        fetchPetRecords(user.petDetails.id || user.petDetails._id || '');
      } else if (user.role === 'DOCTOR' && user.doctorDetails) {
        setPet(null);
      }
    } else {
      setPet(null);
      setTimeline([]);
      setDocuments([]);
      setReminders([]);
      setChecklist({ food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() });
      setRoutine([]);
      setDailyLogs({});
      setDoctorNotes([]);
      setConsultedDoctors([]);
    }
  }, [user]);

  const handleUpdatePet = async (updated: PetProfile) => {
    setPet(updated);
    const petId = updated.id || updated._id;
    if (petId) {
      await api.updatePetProfile(petId, updated);
    }
  };
  
  const handleUpdateChecklist = async (newC: DailyChecklist) => {
    setChecklist(newC);
    const petId = pet?.id || pet?._id;
    if (petId) await api.updateChecklist(petId, newC);
  };

  const handleUpdateVitals = async (date: string, data: Partial<DailyLog>) => {
    const updatedLog = { ...(dailyLogs[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }), ...data };
    setDailyLogs(prev => ({ ...prev, [date]: updatedLog }));
    const petId = pet?.id || pet?._id;
    if (petId) await api.updateDailyLog(petId, date, updatedLog);
  };

  const handleCompleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id || r._id === id);
    const petId = pet?.id || pet?._id;
    if (reminder && petId) {
      setReminders(prev => prev.filter(r => r.id !== id && r._id !== id));
      await api.deleteReminder(petId, id);

      const newEntry: Partial<TimelineEntry> = {
        date: new Date().toISOString().split('T')[0],
        type: reminder.type === 'Medication' ? EntryType.Medication : 
              reminder.type === 'Vaccination' ? EntryType.Vaccination : EntryType.VetVisit,
        title: reminder.title,
        notes: `Completed from planned care schedule.`
      };
      const savedEntry = await api.addTimelineEntry(petId, newEntry);
      setTimeline(prev => [savedEntry, ...prev]);
    }
  };

  const handleDeleteDoctorNote = async (noteId: string) => {
    setDoctorNotes(prev => prev.filter(n => (n.id !== noteId && n._id !== noteId)));
    await api.deleteDoctorNote(noteId);
  };

  const handleUpdateTimeline = async (entryId: string, updates: Partial<TimelineEntry>) => {
    const petId = pet?.id || pet?._id;
    if (petId) {
      const updated = await api.updateTimelineEntry(petId, entryId, updates);
      setTimeline(prev => prev.map(e => e.id === entryId || e._id === entryId ? { ...e, ...updated } : e));
    }
  };

  const handleUpdateReminders = async (updatedReminders: Reminder[]) => {
    setReminders(updatedReminders);
  };
  
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FFFAF3] dark:bg-black">
         <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl animate-spin-slow">
            <i className="fa-solid fa-paw"></i>
         </div>
         <p className="mt-4 font-lobster text-xl text-zinc-900 dark:text-white">Loading Pluto...</p>
      </div>
    );
  }

  // If user is unverified, show AuthScreen with verification view enabled via prop
  if (!user) {
    return (
      <AuthScreen 
        onLogin={setUser} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        unverifiedUser={unverifiedUser} 
      />
    );
  }

  if (user.role === 'DOCTOR') {
    return (
      <DoctorDashboard 
        doctor={user}
        petData={{ 
          pet: pet || { id: 'PENDING', name: 'No Patient', species: Species.Other, breed: '', dateOfBirth: '', gender: Gender.Unknown }, 
          timeline, documents, checklist, routine, reminders 
        }}
        dailyLogs={dailyLogs}
        doctorNotes={doctorNotes}
        onAddNote={async (note) => {
          const saved = await api.addDoctorNote(note);
          if (saved) setDoctorNotes(prev => [saved as DoctorNote, ...prev]);
        }}
        onDeleteNote={handleDeleteDoctorNote}
        onVisitPatient={() => {}}
        consultedDoctors={consultedDoctors}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={doctorTab}
        setActiveTab={setDoctorTab}
        isViewingPatient={doctorViewingPatient}
        setIsViewingPatient={setDoctorViewingPatient}
        patientSubTab={doctorPatientSubTab}
        setPatientSubTab={setDoctorPatientSubTab}
        onLogout={handleLogout}
      />
    );
  }

  const renderContent = () => {
    if (!pet && activeTab !== 'profile') return (
       <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-orange-500 text-4xl shadow-xl animate-spring-jump"><i className="fa-solid fa-paw"></i></div>
          <h2 className="text-3xl font-lobster">Identity Required</h2>
          <button onClick={() => setActiveTab('profile')} className="px-10 py-4 bg-orange-500 text-white rounded-[2rem] font-black uppercase shadow-xl hover:scale-105 transition-all">Setup Profile</button>
       </div>
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard pet={pet!} reminders={reminders} checklist={checklist} setChecklist={handleUpdateChecklist} routine={routine} setRoutine={setRoutine} onCompleteReminder={handleCompleteReminder} timeline={timeline} dailyLogs={dailyLogs} onUpdateLog={handleUpdateVitals} doctorNotes={doctorNotes} onDeleteNote={handleDeleteDoctorNote} />;
      case 'profile': return <ProfileScreen pet={pet!} setPet={handleUpdatePet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': return (
        <TimelineScreen 
          timeline={timeline} 
          setTimeline={setTimeline} 
          documents={documents} 
          reminders={reminders} 
          setReminders={setReminders} 
          dailyLogs={dailyLogs} 
          onUpdateLog={() => {}} 
          petName={pet?.name} 
          doctorNotes={doctorNotes} 
          onDeleteNote={handleDeleteDoctorNote} 
          consultedDoctors={consultedDoctors} 
          petId={pet?.id || pet?._id}
        />
      );
      case 'documents': return <DocumentsScreen documents={documents} setDocuments={setDocuments} petName={pet?.name} petId={pet?.id || pet?._id} />;
      case 'ai': return <AIScreen pet={pet!} timeline={timeline} documents={documents} reminders={reminders} />;
      default: return null;
    }
  };

  const navItems: { id: string, icon: string, label: string, isAction?: boolean, color: 'orange' | 'emerald' | 'amber' | 'rose' | 'indigo' }[] = [
    { id: 'dashboard', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'Pluto AI', isAction: true, color: 'amber' },
    { id: 'documents', icon: 'folder-open', label: 'Files', color: 'indigo' },
    { id: 'profile', icon: 'paw', label: pet?.name || 'Pet', color: 'rose' },
  ];

  return (
    <div className={`h-screen flex flex-col md:flex-row transition-colors duration-500 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 mb-16 justify-center group w-full outline-none">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95"><i className="fa-solid fa-paw text-lg"></i></div>
          <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 transition-colors group-hover:text-orange-500">Pluto</h1>
        </button>
        <nav className="flex-1 space-y-4">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 border-[4px] relative group overflow-hidden ${activeTab === item.id ? 'bg-orange-500 text-white border-white dark:border-black shadow-[0_6px_20px_rgba(249,115,22,0.25)] scale-[1.05] z-10' : 'text-zinc-800 dark:text-zinc-300 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'}`}>
              <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90">
            <div className="relative w-8 h-8 flex items-center justify-center">
               <i className={`fa-solid fa-sun absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
               <i className={`fa-solid fa-moon absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </div>
          </button>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-110 active:scale-90"><i className="fa-solid fa-power-off text-lg"></i></button>
        </div>
      </aside>

      {/* Mobile Header - Frosted Glass */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-[100] px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs shadow-sm">
              <i className="fa-solid fa-paw"></i>
            </div>
            <h1 className="text-xl font-lobster text-zinc-900 dark:text-zinc-50">Pluto</h1>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="w-10 h-10 flex items-center justify-center relative active:scale-90 transition-transform"
            >
               <i className={`fa-solid fa-sun absolute text-xl transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
               <i className={`fa-solid fa-moon absolute text-xl transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </button>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 transition-transform"
            >
               <i className="fa-solid fa-power-off text-lg"></i>
            </button>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FFFAF3] dark:bg-zinc-950 pt-16 md:pt-0 md:pb-0">
        {renderContent()}
      </main>

      {/* Mobile Footer Navigation - Floating Frosted Glass */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2 animate-in slide-in-from-bottom-10">
         {navItems.map(item => (
            <NavButton
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id as any)}
              icon={item.icon}
              label={item.label}
              isAction={item.isAction}
              color={item.color as any}
              petAvatar={pet?.avatar}
            />
         ))}
      </nav>
    </div>
  );
};

export default App;
