
import React, { useState, useEffect } from 'react';
import { 
  PetProfile, 
  TimelineEntry, 
  PetDocument, 
  Reminder, 
  DailyChecklist, 
  EntryType,
  RoutineItem,
  AuthUser,
  DailyLog,
  DoctorNote,
  Doctor,
  Species,
  Gender
} from './types';
import Dashboard from './screens/Dashboard';
import ProfileScreen from './screens/ProfileScreen';
import TimelineScreen from './screens/TimelineScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import { PetOwnerShell } from './components/PetOwnerShell';
import { api } from './lib/api';
import { auth } from './lib/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
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
  const [clinicalNotes, setClinicalNotes] = useState<DoctorNote[]>([]);
  const [medicalNetworks, setMedicalNetworks] = useState<Doctor[]>([]);
  const [lastVisitInfo, setLastVisitInfo] = useState<{ date: string; id: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'timeline' | 'documents' | 'ai'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Doctor-specific UI state
  const [isViewingPatient, setIsViewingPatient] = useState(false);
  const [doctorActiveTab, setDoctorActiveTab] = useState<'profile' | 'discover' | 'patients'>('discover');
  const [patientSubTab, setPatientSubTab] = useState<'profile' | 'timeline' | 'docs' | 'identity'>('profile');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setUnverifiedUser(firebaseUser);
          setUser(null);
        } else {
          setUnverifiedUser(null);
          const profile = await api.getUserProfile(firebaseUser.uid);
          if (profile) setUser(profile);
        }
      } else {
        setUser(null);
        setUnverifiedUser(null);
        setPet(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hydrateData = async (uid: string) => {
    const data = await api.getPetRecords(uid);
    if (!data) return;

    // Daily Reset Logic
    if (data.checklist?.lastReset) {
      // FIX: Use consistent format (YYYY-MM-DD) for comparison
      const lastResetDate = data.checklist.lastReset.split('T')[0];
      const todayDate = new Date().toISOString().split('T')[0];

      if (lastResetDate !== todayDate) {
        console.log(`[Hydration] New day detected (${todayDate} vs ${lastResetDate}). Resetting tasks...`);
        const resetChecklist = { 
          food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() 
        };
        const resetRoutines = (data.routines || []).map((r: RoutineItem) => ({ ...r, completed: false }));
        
        await api.resetDailyTasks(uid, resetRoutines);

        data.checklist = resetChecklist;
        data.routines = resetRoutines;
      } else {
        console.log(`[Hydration] Today's progress is already synced (${todayDate}). Persistence maintained.`);
      }
    }

    setTimeline(data.timeline);
    setReminders(data.reminders);
    setDocuments(data.documents);
    setChecklist(data.checklist);
    setDailyLogs(data.dailyLogs);
    setRoutine(data.routines);
    setDoctorNotes(data.doctorNotes);
    setClinicalNotes(data.clinicalNotes || []);
    setMedicalNetworks(data.medicalNetworks || []);
    setLastVisitInfo(data.lastDoctorVisit ? { date: data.lastDoctorVisit, id: data.lastDoctorId || '' } : null);

    if (user?.role === 'DOCTOR') {
       const patientProfile = await api.getUserProfile(uid);
       if (patientProfile?.petDetails) {
         setPet(patientProfile.petDetails);
       }
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'PET_OWNER') {
      setPet(user.petDetails || null);
      hydrateData(user.id);
    }
  }, [user]);

  const handleUpdatePet = async (updated: PetProfile) => {
    if (!user?.id) return;
    try {
      setPet(updated);
      await api.updatePetProfile(user.id, updated);
      setUser(prev => prev ? { ...prev, petDetails: updated } : null);
    } catch (e) {
      console.error("Pet Profile update failed:", e);
      throw e;
    }
  };

  const handleUpdateChecklist = async (newC: DailyChecklist) => {
    if (!user?.id) return;
    setChecklist(newC);
    await api.updateChecklist(user.id, newC);
  };

  const handleUpdateLog = async (date: string, data: Partial<DailyLog>) => {
    const targetUid = user?.role === 'PET_OWNER' ? user.id : pet?.id?.replace('PET-', '');
    if (!targetUid) return;
    setDailyLogs(prev => ({
      ...prev,
      [date]: { ...(prev[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }), ...data }
    }));
    await api.updateDailyLog(targetUid, date, data);
  };

  const handleAddRoutine = async (item: Partial<RoutineItem>) => {
    if (!user?.id) return;
    const saved = await api.addRoutine(user.id, item);
    setRoutine(prev => [...prev, saved].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleUpdateRoutine = async (id: string, updates: Partial<RoutineItem>) => {
    if (!user?.id) return;
    await api.updateRoutine(user.id, id, updates);
    setRoutine(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!user?.id) return;
    await api.deleteRoutine(user.id, id);
    setRoutine(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteTimelineEntry = async (id: string) => {
    const targetUid = user?.role === 'PET_OWNER' ? user.id : pet?.id?.replace('PET-', '');
    if (!targetUid) return;
    if (await api.deleteTimelineEntry(targetUid, id)) {
      setTimeline(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const targetUid = user?.role === 'PET_OWNER' ? user.id : pet?.id?.replace('PET-', '');
    if (!targetUid) return;
    if (await api.deleteReminder(targetUid, id)) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    console.log(`[App] handleDeleteDocument: Triggered for ID ${id}`);
    
    if (user?.role !== 'PET_OWNER' || !user?.id) {
      console.warn("[App] handleDeleteDocument: Permission denied or User ID missing.");
      alert("Permission Denied: Only pet owners can manage the Document Safe.");
      return;
    }

    console.log("[App] handleDeleteDocument: Calling API.deleteDocument...");
    const success = await api.deleteDocument(user.id, id);
    
    if (success) {
      console.log("[App] handleDeleteDocument: API reported success. Updating local state...");
      setDocuments(prev => {
        const filtered = prev.filter(d => d.id !== id);
        console.log(`[App] handleDeleteDocument: UI State updated. Removed 1 item. New count: ${filtered.length}`);
        return filtered;
      });
    } else {
      console.error("[App] handleDeleteDocument: API reported failure.");
    }
  };

  const handleCompleteReminder = async (id: string) => {
    if (!user?.id) return;
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    setReminders(prev => prev.filter(r => r.id !== id));
    await api.deleteReminder(user.id, id);
    const newEntry: Partial<TimelineEntry> = {
      date: new Date().toISOString().split('T')[0],
      type: reminder.type === 'Medication' ? EntryType.Medication : EntryType.VetVisit,
      title: `Completed: ${reminder.title}`,
      notes: `Actioned from schedule.`
    };
    const saved = await api.addTimelineEntry(user.id, newEntry);
    setTimeline(prev => [saved, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAddDoctorNote = async (note: DoctorNote) => {
    if (!pet?.id) return;
    const patientUid = pet.id.replace('PET-', '');
    const saved = await api.addDoctorNote(patientUid, note);
    setDoctorNotes(prev => [saved, ...prev]);
    setClinicalNotes(prev => [saved, ...prev]);
  };

  const handleDeleteClinicalNote = async (id: string) => {
    const targetUid = user?.role === 'PET_OWNER' ? user.id : pet?.id?.replace('PET-', '');
    if (!targetUid) return;
    
    setDoctorNotes(prev => prev.filter(n => n.id !== id));
    setClinicalNotes(prev => prev.filter(n => n.id !== id));

    try {
      await api.deleteDoctorNote(targetUid, id);
    } catch (e) {
      console.error("Failed to delete note from DB", e);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FFFAF3] dark:bg-black">
         <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl animate-spin-slow"><i className="fa-solid fa-paw"></i></div>
         <p className="mt-4 font-lobster text-xl text-zinc-900 dark:text-white">Loading Pluto...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen onLogin={setUser} darkMode={darkMode} setDarkMode={setDarkMode} unverifiedUser={unverifiedUser} />;

  const renderPetOwnerContent = () => {
    if (!pet && activeTab !== 'profile') return (
       <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-orange-500 text-4xl shadow-xl animate-spring-jump"><i className="fa-solid fa-paw"></i></div>
          <h2 className="text-3xl font-lobster">Identity Required</h2>
          <button onClick={() => setActiveTab('profile')} className="px-10 py-4 bg-orange-500 text-white rounded-[2rem] font-black uppercase shadow-xl hover:scale-105 transition-all">Setup Profile</button>
       </div>
    );

    switch (activeTab) {
      case 'dashboard': return (
        <Dashboard 
          pet={pet!} reminders={reminders} checklist={checklist} setChecklist={handleUpdateChecklist} 
          routine={routine} onAddRoutine={handleAddRoutine} onUpdateRoutine={handleUpdateRoutine}
          onDeleteRoutine={handleDeleteRoutine} onCompleteReminder={handleCompleteReminder} 
          timeline={timeline} dailyLogs={dailyLogs} onUpdateLog={handleUpdateLog} 
          doctorNotes={doctorNotes} onDeleteNote={handleDeleteClinicalNote}
        />
      );
      case 'profile': return <ProfileScreen pet={pet!} setPet={handleUpdatePet} reminders={reminders} onNavigate={setActiveTab} />;
      case 'timeline': return (
        <TimelineScreen 
          timeline={timeline} setTimeline={setTimeline} documents={documents} 
          reminders={reminders} setReminders={setReminders} dailyLogs={dailyLogs} 
          onUpdateLog={handleUpdateLog} petName={pet?.name} doctorNotes={doctorNotes} 
          onDeleteNote={handleDeleteClinicalNote} onDeleteTimelineEntry={handleDeleteTimelineEntry}
          onDeleteReminder={handleDeleteReminder} petId={user.id} consultedDoctors={medicalNetworks}
          lastVisit={lastVisitInfo}
        />
      );
      case 'documents': return <DocumentsScreen documents={documents} setDocuments={setDocuments} onDeleteDocument={handleDeleteDocument} petName={pet?.name} petId={user.id} />;
      case 'ai': return <AIScreen pet={pet!} timeline={timeline} documents={documents} reminders={reminders} />;
      default: return null;
    }
  };

  if (user.role === 'DOCTOR') {
    return (
      <DoctorDashboard 
        doctor={user}
        petData={{
          pet: pet || { id: '', name: 'No Patient', species: Species.Dog, breed: '', dateOfBirth: '', gender: Gender.Unknown, avatar: '' },
          timeline,
          documents,
          checklist,
          routine,
          reminders
        }}
        dailyLogs={dailyLogs}
        doctorNotes={doctorNotes}
        onAddNote={handleAddDoctorNote}
        onDeleteNote={handleDeleteClinicalNote}
        onVisitPatient={(id) => { if (id) hydrateData(id.replace('PET-', '')); }}
        consultedDoctors={medicalNetworks}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={doctorActiveTab}
        setActiveTab={setDoctorActiveTab}
        isViewingPatient={isViewingPatient}
        setIsViewingPatient={setIsViewingPatient}
        patientSubTab={patientSubTab}
        setPatientSubTab={setPatientSubTab}
        onLogout={() => api.logout()}
      />
    );
  }

  return (
    <PetOwnerShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      pet={pet}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderPetOwnerContent()}
    </PetOwnerShell>
  );
};

export default App;
