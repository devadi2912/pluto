
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
import { supabase } from './lib/supabase';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  color: 'orange' | 'emerald' | 'amber' | 'rose' | 'indigo';
  isAction?: boolean;
}

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [checklist, setChecklist] = useState<DailyChecklist>({ food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() });
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Doctor specific navigation states
  const [doctorActiveTab, setDoctorActiveTab] = useState<'profile' | 'discover' | 'patients'>('discover');
  const [doctorIsViewingPatient, setDoctorIsViewingPatient] = useState(false);
  const [patientSubTab, setPatientSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Initial Data and Listen to Auth Changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncUserProfile(session.user.id);
      } else {
        setUser(null);
        setPet(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) throw profileErr;

      let authUser: AuthUser = {
        id: profile.id,
        username: profile.username,
        role: profile.role,
      };

      // 2. Fetch Extra Details based on role
      if (profile.role === 'DOCTOR') {
        const { data: doctorDetails } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', userId)
          .single();
        if (doctorDetails) authUser.doctorDetails = doctorDetails as Doctor;
      }

      setUser(authUser);

      // 3. Fetch Pet Data if Pet Owner
      if (profile.role === 'PET_OWNER') {
        await fetchPetData(userId);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPetData = async (userId: string) => {
    // Fetch Pet associated with owner
    const { data: pets } = await supabase
      .from('pets')
      .select('*')
      .eq('ownerId', userId);

    if (pets && pets.length > 0) {
      const activePet = pets[0];
      setPet(activePet);

      // Fetch Timeline
      const { data: timelineData } = await supabase
        .from('timeline')
        .select('*')
        .eq('petId', activePet.id)
        .order('date', { ascending: false });
      if (timelineData) setTimeline(timelineData);

      // Fetch Documents
      const { data: docData } = await supabase
        .from('documents')
        .select('*')
        .eq('petId', activePet.id)
        .order('date', { ascending: false });
      if (docData) setDocuments(docData);

      // Fetch Reminders
      const { data: remData } = await supabase
        .from('reminders')
        .select('*')
        .eq('petId', activePet.id)
        .order('date', { ascending: true });
      if (remData) setReminders(remData);

      // Fetch Logs
      const { data: logData } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('petId', activePet.id);
      if (logData) {
        const logMap: Record<string, DailyLog> = {};
        logData.forEach(l => {
          logMap[l.date] = l;
        });
        setDailyLogs(logMap);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updatePet = async (updatedPet: PetProfile) => {
    setPet(updatedPet);
    await supabase.from('pets').upsert(updatedPet);
  };

  const handleUpdateDailyLog = async (date: string, data: Partial<DailyLog>) => {
    if (!pet) return;
    const updatedLog = {
      ...(dailyLogs[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }),
      ...data,
      date,
      petId: pet.id
    };
    
    setDailyLogs(prev => ({ ...prev, [date]: updatedLog }));
    await supabase.from('daily_logs').upsert(updatedLog);
  };

  const handleCompleteReminder = async (id: string) => {
    if (!pet) return;
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      let entryType = EntryType.Note;
      if (reminder.type === 'Vaccination') entryType = EntryType.Vaccination;
      else if (reminder.type === 'Medication') entryType = EntryType.Medication;
      else if (reminder.type === 'Vet follow-up') entryType = EntryType.VetVisit;

      const newEntry: TimelineEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        type: entryType,
        title: `${reminder.title}`,
        notes: `Completed scheduled ${reminder.type.toLowerCase()} task.`,
        petId: pet.id
      };

      setTimeline(prev => [newEntry, ...prev]);
      await supabase.from('timeline').insert(newEntry);
    }
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
    await supabase.from('reminders').update({ completed: true }).eq('id', id);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FFFAF3] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-lobster text-2xl text-orange-500 animate-pulse">Waking up Pluto...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={() => {}} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  // Handle case where user is logged in but has no pet yet
  if (user.role === 'PET_OWNER' && !pet) {
     return <ProfileScreen pet={{ id: '', name: 'New Pet', species: Species.Dog, breed: '', dateOfBirth: new Date().toISOString().split('T')[0], gender: Gender.Unknown }} setPet={updatePet} reminders={[]} onNavigate={() => {}} />;
  }

  // Navigation Items
  const ownerNavItems: NavItem[] = [
    { id: 'dashboard', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'ai', icon: 'wand-magic-sparkles', label: 'AI', color: 'orange', isAction: true },
    { id: 'documents', icon: 'folder-open', label: 'Files', color: 'amber' },
    { id: 'profile', icon: 'paw', label: pet?.name || 'Pet', color: 'rose' },
  ];

  const doctorPatientNavItems: NavItem[] = [
    { id: 'profile', icon: 'house', label: 'Home', color: 'orange' },
    { id: 'timeline', icon: 'calendar-days', label: 'Journal', color: 'emerald' },
    { id: 'docs', icon: 'folder-open', label: 'Files', color: 'amber' },
    { id: 'identity', icon: 'paw', label: pet?.name || 'Patient', color: 'rose' },
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
          petData={{ pet: pet!, timeline, documents, checklist, routine, reminders }}
          dailyLogs={dailyLogs}
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
        return <Dashboard pet={pet!} reminders={reminders} checklist={checklist} setChecklist={setChecklist} routine={routine} setRoutine={setRoutine} onCompleteReminder={handleCompleteReminder} timeline={timeline} dailyLogs={dailyLogs} onUpdateLog={handleUpdateDailyLog} />;
      case 'profile': 
        return <ProfileScreen pet={pet!} setPet={updatePet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': 
        return <TimelineScreen timeline={timeline} setTimeline={setTimeline} documents={documents} reminders={reminders} setReminders={setReminders} dailyLogs={dailyLogs} onUpdateLog={handleUpdateDailyLog} petName={pet!.name} petId={pet!.id} />;
      case 'documents': 
        return <DocumentsScreen documents={documents} setDocuments={setDocuments} petName={pet!.name} petId={pet!.id} />;
      case 'ai': 
        return <AIScreen pet={pet!} timeline={timeline} documents={documents} reminders={reminders} />;
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
                {(item.id === 'profile' || item.id === 'identity') && pet?.avatar ? (
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
          {user.role === 'DOCTOR' && doctorIsViewingPatient && (
            <button 
              onClick={() => setDoctorIsViewingPatient(false)}
              className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mb-2"
            >
              <i className="fa-solid fa-arrow-left-long"></i>
              Back to Practice
            </button>
          )}

          <div className="flex gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all group relative overflow-hidden border-2 border-transparent ${darkMode ? 'bg-zinc-800 text-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.15)]' : 'bg-orange-50 text-orange-600 shadow-[0_0_50px_rgba(30,64,175,0.8)]'}`}>
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
              petAvatar={(user.role === 'PET_OWNER' || doctorIsViewingPatient) ? pet?.avatar : undefined}
            />
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
