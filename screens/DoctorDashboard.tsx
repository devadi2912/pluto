
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog, DoctorNote, Doctor } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import DoctorProfileScreen from './DoctorProfileScreen';
import DoctorSearchScreen from './DoctorSearchScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import { NavButton } from '../components/NavButton';
import { api } from '../lib/api';

interface PriorityItemData {
  id: string;
  title: string;
  detail: string;
  type: string;
  color: string;
  targetId: string;
  patientName: string;
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
  doctorNotes: DoctorNote[];
  onAddNote: (note: DoctorNote) => void;
  onDeleteNote?: (noteId: string) => void;
  onVisitPatient?: (petId: string) => void;
  consultedDoctors?: Doctor[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTab: 'profile' | 'discover' | 'patients';
  setActiveTab: (tab: 'profile' | 'discover' | 'patients') => void;
  isViewingPatient: boolean;
  setIsViewingPatient: (v: boolean) => void;
  patientSubTab: 'profile' | 'timeline' | 'docs' | 'identity';
  setPatientSubTab: (tab: 'profile' | 'timeline' | 'docs' | 'identity') => void;
  onLogout: () => void;
}

const patientNavItems = [
  { id: 'profile', label: 'Dashboard', icon: 'chart-line', color: 'orange' },
  { id: 'timeline', label: 'Journal', icon: 'book-medical', color: 'emerald' },
  { id: 'docs', label: 'Files', icon: 'folder-open', color: 'indigo' },
  { id: 'identity', label: 'Identity', icon: 'paw', color: 'rose' }
];

const getGlowClass = (color: string) => {
  switch(color) {
    case 'orange': return 'shadow-[0_6px_20px_rgba(249,115,22,0.25)]';
    case 'emerald': return 'shadow-[0_6px_20px_rgba(16,185,129,0.25)]';
    case 'indigo': return 'shadow-[0_6px_20px_rgba(99,102,241,0.25)]';
    case 'rose': return 'shadow-[0_6px_20px_rgba(244,63,94,0.25)]';
    default: return '';
  }
};

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  doctor, 
  petData, 
  dailyLogs,
  doctorNotes,
  onAddNote,
  onDeleteNote,
  onVisitPatient,
  consultedDoctors,
  darkMode, 
  setDarkMode,
  activeTab,
  setActiveTab,
  isViewingPatient,
  setIsViewingPatient,
  patientSubTab,
  setPatientSubTab,
  onLogout
}) => {
  const [searchId, setSearchId] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  const [visitedPatients, setVisitedPatients] = useState<any[]>([]);
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  // State to hold the data of the patient we searched for
  const [searchedPatientData, setSearchedPatientData] = useState<any>(null);

  // Determine which dataset to use: The one passed from App (default) or the one we just searched for
  const activePatientData = searchedPatientData || petData;
  const activeDailyLogs = searchedPatientData ? searchedPatientData.dailyLogs : dailyLogs;
  const activeDoctorNotes = searchedPatientData ? searchedPatientData.doctorNotes : doctorNotes;
  const activeConsultedDoctors = searchedPatientData ? searchedPatientData.medicalNetworks : consultedDoctors;

  // Fetch visited patients and their synced alerts on mount and refresh
  const fetchDashboardData = async () => {
    if (!doctor.id) return;
    const records = await api.getDoctorVisitedPatients(doctor.id);
    setVisitedPatients(records);
    
    // Process alerts from all visited patients
    const allAlerts: PriorityItemData[] = [];
    records.forEach((record: any) => {
      if (record.alerts && Array.isArray(record.alerts)) {
        record.alerts.forEach((alert: any) => {
          allAlerts.push({
             id: alert.id,
             title: alert.title,
             detail: `For ${record.petName} • ${new Date(alert.date).toLocaleDateString()}`,
             type: alert.type,
             color: 'bg-rose-100',
             targetId: record.id,
             patientName: record.petName
          });
        });
      }
    });
    
    // Sort by most urgent (could sort by date here if needed)
    setPriorityItems(allAlerts.sort((a, b) => new Date(a.detail.split('•')[1]).getTime() - new Date(b.detail.split('•')[1]).getTime()));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [doctor.id]);

  const handleSearch = async (id?: string | any) => {
    // Preserve case for the UID part, but check prefix case-insensitively
    const rawInput = (typeof id === 'string' ? id : searchId).trim();
    
    // 1. Validate Format
    if (!rawInput.toUpperCase().startsWith('PET-')) {
      alert("Invalid ID format. Must start with PET-");
      return;
    }

    // Extract UID by removing the first 4 characters "PET-" (case insensitive length is 4)
    const uid = rawInput.substring(4);

    try {
      // 2. Search Database
      const userProfile = await api.getUserProfile(uid);
      
      if (userProfile && userProfile.petDetails) {
         // 3. Fetch Full Records
         const records = await api.getPetRecords(uid);
         
         if (records) {
            const fullData = {
              pet: userProfile.petDetails,
              timeline: records.timeline,
              documents: records.documents,
              checklist: records.checklist,
              routine: records.routines,
              reminders: records.reminders,
              dailyLogs: records.dailyLogs,
              doctorNotes: records.doctorNotes,
              medicalNetworks: records.medicalNetworks
            };

            setSearchedPatientData(fullData);
            
            // Standardize ID
            const standardId = `PET-${uid}`;
            
            // Log visit in backend and SYNC ALERTS
            if (doctor.id) {
               await api.logDoctorVisit(standardId, doctor.id);
               // Refresh dashboard data to pull in new synced alerts
               await fetchDashboardData();
            }

            setIsViewingPatient(true);
         } else {
            alert("Patient profile exists but records are unavailable.");
         }
      } else {
         alert("No patient found with this ID.");
      }
    } catch (e) {
      console.error("Search failed:", e);
      alert("An error occurred while searching.");
    }
  };

  const handleLeaveNote = async () => {
    if (!noteContent.trim() || !activePatientData.pet.id) return;
    
    const newNote: DoctorNote = {
      id: Date.now().toString(),
      doctorId: doctor.doctorDetails?.id || doctor.id,
      doctorName: doctor.doctorDetails?.name || 'Veterinarian',
      petId: activePatientData.pet.id,
      date: new Date().toISOString(),
      content: noteContent
    };

    // If we are looking at a searched patient, we must call the API directly
    if (searchedPatientData) {
        const patientUid = activePatientData.pet.id.replace('PET-', '');
        await api.addDoctorNote(patientUid, newNote);
        setSearchedPatientData((prev: any) => ({
            ...prev,
            doctorNotes: [newNote, ...prev.doctorNotes]
        }));
    } else {
        onAddNote(newNote);
    }

    setShowNoteModal(false);
    setNoteContent('');
    alert("Advice logged for pet owner!");
  };

  const handleDeleteNote = async (noteId: string) => {
    // If we are viewing a searched patient, we must handle deletion locally targeting the patient ID
    if (searchedPatientData && activePatientData.pet.id) {
      const patientUid = activePatientData.pet.id.replace('PET-', '');
      try {
        await api.deleteDoctorNote(patientUid, noteId);
        // Optimistic update
        setSearchedPatientData((prev: any) => ({
          ...prev,
          doctorNotes: prev.doctorNotes.filter((n: DoctorNote) => n.id !== noteId)
        }));
      } catch (e) {
        console.error("Failed to delete note", e);
        alert("Could not delete note.");
      }
    } else if (onDeleteNote) {
      // Fallback to prop (though prop might fail if App.tsx doesn't have correct pet ID loaded)
      onDeleteNote(noteId);
    }
  };

  const handleDismissAlert = async (e: React.MouseEvent, item: PriorityItemData) => {
    e.stopPropagation();
    if (!doctor.id) return;
    
    // Optimistic Update
    setPriorityItems(prev => prev.filter(i => i.id !== item.id));

    try {
       await api.deleteDoctorAlert(doctor.id, item.targetId, item.id);
    } catch (err) {
       console.error("Failed to dismiss alert:", err);
       fetchDashboardData();
    }
  };

  const handleHomeClick = () => {
    setActiveTab('discover');
    setIsViewingPatient(false);
    setSearchedPatientData(null); 
    // Refresh alerts when returning home
    fetchDashboardData();
  };

  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 relative overflow-hidden">
      <div className="md:hidden p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-[50] shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsViewingPatient(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="font-bold text-sm tracking-tight">{activePatientData.pet.name}</span>
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-90"
              title="Toggle Theme"
            >
               <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button onClick={() => setShowNoteModal(true)} className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 flex items-center">
               <i className="fa-solid fa-pen-fancy mr-2"></i>Note
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative h-full">
        <div className="hidden md:flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <img src={activePatientData.pet.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg" alt="avatar" />
              <div>
                 <h2 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{activePatientData.pet.name}</h2>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{activePatientData.pet.id} • Medical File</p>
              </div>
           </div>
        </div>

        <div className="relative md:p-10 pb-44 md:pb-12">
          {patientSubTab === 'profile' && (
            <Dashboard 
              pet={activePatientData.pet} 
              reminders={activePatientData.reminders} 
              checklist={activePatientData.checklist} 
              setChecklist={() => {}} 
              routine={activePatientData.routine} 
              onCompleteReminder={() => {}} 
              timeline={activePatientData.timeline} 
              dailyLogs={activeDailyLogs} 
              onUpdateLog={() => {}} 
              doctorNotes={activeDoctorNotes}
              onDeleteNote={handleDeleteNote}
              readOnly={true}
            />
          )}
          {patientSubTab === 'timeline' && (
            <TimelineScreen 
              timeline={activePatientData.timeline} 
              setTimeline={() => {}} 
              documents={activePatientData.documents} 
              reminders={activePatientData.reminders} 
              setReminders={() => {}} 
              dailyLogs={activeDailyLogs} 
              onUpdateLog={() => {}} 
              petName={activePatientData.pet.name} 
              doctorNotes={activeDoctorNotes}
              onDeleteNote={handleDeleteNote} // Use local handler
              canManageNotes={true} // Allow doctors to manage notes even in readOnly mode
              consultedDoctors={activeConsultedDoctors}
              readOnly={true}
            />
          )}
          {patientSubTab === 'docs' && (
            <DocumentsScreen 
              documents={activePatientData.documents} 
              setDocuments={() => {}} 
              petName={activePatientData.pet.name} 
              readOnly={true}
            />
          )}
          {patientSubTab === 'identity' && (
            <ProfileScreen 
              pet={activePatientData.pet} 
              setPet={() => {}} 
              reminders={activePatientData.reminders} 
              readOnly={true}
            />
          )}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2 animate-in slide-in-from-bottom-10">
        {patientNavItems.map(item => (
          <NavButton
            key={item.id}
            active={patientSubTab === item.id}
            onClick={() => setPatientSubTab(item.id as any)}
            icon={item.icon}
            label={item.label}
            color={item.color as any}
          />
        ))}
      </nav>

      {showNoteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-transparent pointer-events-none" onClick={() => setShowNoteModal(false)}>
           <div 
             className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl p-8 rounded-[3rem] border-4 border-white dark:border-zinc-950 shadow-2xl w-full max-w-md animate-in zoom-in-95 pointer-events-auto" 
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h4 className="font-lobster text-3xl text-indigo-600 dark:text-indigo-400">Clinical Advice</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Direct note to {activePatientData.pet.name}'s Family</p>
                 </div>
                 <button onClick={() => setShowNoteModal(false)} className="w-10 h-10 rounded-full bg-white/40 dark:bg-zinc-800/40 text-zinc-500 hover:text-rose-500 transition-all border border-zinc-200 dark:border-zinc-700">
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              
              <textarea 
                className="w-full h-40 p-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-zinc-900 dark:text-zinc-100 transition-all resize-none shadow-inner"
                placeholder="Share your medical observations and advice..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
              />

              <div className="mt-8">
                 <button 
                  onClick={handleLeaveNote}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all border-4 border-white dark:border-zinc-950"
                 >
                   Send Note
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`h-screen flex flex-col md:flex-row bg-[#FFFAF3] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
        {!isViewingPatient ? (
          <>
            <button 
              onClick={handleHomeClick}
              className="flex items-center gap-3 mb-16 justify-center group outline-none hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                 <i className="fa-solid fa-user-md text-lg"></i>
              </div>
              <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">Pluto <span className="text-indigo-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-50">MD</span></h1>
            </button>
            <nav className="flex-1 space-y-4">
              {[
                { id: 'discover', label: 'Discover', icon: 'magnifying-glass' },
                { id: 'patients', label: 'Patient Logs', icon: 'clipboard-list' },
                { id: 'profile', label: 'Identity', icon: 'id-card-clip' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsViewingPatient(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-[4px] relative group overflow-hidden ${
                    activeTab === item.id && !isViewingPatient
                      ? 'bg-indigo-600 text-white border-white dark:border-black shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 z-10' 
                      : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'
                  }`}
                >
                  <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
                  <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                  {activeTab === item.id && !isViewingPatient && (
                    <div className="absolute inset-0 bg-white/10 pointer-events-none opacity-30"></div>
                  )}
                </button>
              ))}
            </nav>
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90"
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                   <i className={`fa-solid fa-sun absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
                   <i className={`fa-solid fa-moon absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'rotate-180 scale-0 opacity-0'}`}></i>
                </div>
              </button>
              <button 
                onClick={onLogout} 
                className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-110 active:scale-90"
              >
                <i className="fa-solid fa-power-off text-lg"></i>
              </button>
            </div>
          </>
        ) : (
          <>
             <div className="flex flex-col items-center text-center mb-10 animate-in slide-in-from-left-4 duration-500">
                <div className="w-24 h-24 rounded-[2rem] p-1 bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-xl mb-4">
                   <img src={activePatientData.pet.avatar} className="w-full h-full object-cover rounded-[1.8rem] border-4 border-white dark:border-zinc-900" alt="pet" />
                </div>
                <h2 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{activePatientData.pet.name}</h2>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{activePatientData.pet.id}</p>
                </div>
             </div>

             <nav className="flex-1 space-y-4 animate-in slide-in-from-left-4 duration-700 delay-100 mt-6">
                {patientNavItems.map(item => {
                  const isActive = patientSubTab === item.id;
                  const glowClass = getGlowClass(item.color);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPatientSubTab(item.id as any)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-[4px] relative group overflow-hidden ${
                        isActive
                          ? `bg-${item.color}-500 text-white border-white dark:border-black ${glowClass} scale-[1.05] z-10` 
                          : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'
                      }`}
                    >
                      <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
                      <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                      
                      {isActive && (
                        <div className="absolute inset-0 bg-white/10 pointer-events-none opacity-30"></div>
                      )}
                    </button>
                  );
                })}
             </nav>

             <div className="pt-8 space-y-4 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-white/20"
                >
                  <i className="fa-solid fa-pen-fancy text-sm"></i> Leave Note
                </button>

                <div className="flex gap-4">
                   <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90"
                   >
                      <div className="relative w-8 h-8 flex items-center justify-center">
                         <i className={`fa-solid fa-sun absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
                         <i className={`fa-solid fa-moon absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'rotate-180 scale-0 opacity-0'}`}></i>
                      </div>
                   </button>
                   <button
                      onClick={() => { setIsViewingPatient(false); setSearchedPatientData(null); fetchDashboardData(); }}
                      className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-110 active:scale-90"
                      title="Exit Patient Record"
                   >
                      <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
                   </button>
                </div>
             </div>
          </>
        )}
      </aside>

      {!isViewingPatient && (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-[100] px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button 
            className="flex items-center gap-2 hover:scale-105 active:scale-95 hover:-rotate-2 transition-all group"
            onClick={handleHomeClick}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs shadow-sm group-hover:rotate-12 transition-transform"><i className="fa-solid fa-user-md"></i></div>
            <h1 className="text-xl font-lobster text-zinc-900 dark:text-zinc-50 group-active:text-indigo-600 transition-colors">Pluto <span className="text-indigo-600">MD</span></h1>
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="w-10 h-10 flex items-center justify-center relative active:scale-90 transition-transform"
            >
              <i className={`fa-solid fa-sun absolute text-xl transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
              <i className={`fa-solid fa-moon absolute text-xl transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'rotate-180 scale-0 opacity-0'}`}></i>
            </button>
            <button 
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 transition-transform"
            >
              <i className="fa-solid fa-power-off text-lg"></i>
            </button>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto no-scrollbar relative ${!isViewingPatient ? 'pt-16 md:pt-0' : ''}`}>
        {isViewingPatient ? renderPetView() : (
          <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12 pb-32">
            {activeTab === 'discover' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50">Discovery Hub</h2>
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-1">Medical search & priority alerts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-10">
                    <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={handleSearch} />
                    
                    <div className="space-y-6">
                      <h3 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Priority Alerts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {priorityItems.length > 0 ? priorityItems.map(item => (
                          <div key={item.id} className="bg-rose-100 dark:bg-rose-900/30 p-5 rounded-[1.5rem] relative group animate-in slide-in-from-bottom-2 border-none shadow-sm">
                            <button 
                                onClick={(e) => handleDismissAlert(e, item)}
                                className="absolute top-5 right-14 w-8 h-8 bg-white/60 dark:bg-zinc-800/40 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 active:scale-90"
                                title="Mark Resolved"
                            >
                                <i className="fa-solid fa-check"></i>
                            </button>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1 block">URGENT</span>
                                    <h4 className="font-lobster text-xl text-rose-600 dark:text-rose-400">{item.title}</h4>
                                    <p className="text-[11px] font-bold text-rose-800/60 dark:text-rose-200/60 mt-0.5">{item.detail}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-500 dark:text-rose-300 flex items-center justify-center">
                                     <i className={`fa-solid ${item.type === 'Medication' ? 'fa-pills' : item.type === 'Vaccination' ? 'fa-syringe' : 'fa-clock'} text-xs`}></i>
                                </div>
                            </div>
                          </div>
                        )) : (
                          <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem]">
                            <i className="fa-solid fa-check-double text-zinc-200 text-4xl mb-4"></i>
                            <p className="text-zinc-400 font-bold text-sm">No pending priority alerts</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <button onClick={() => setActiveTab('patients')} className="relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-indigo-50/80 dark:bg-indigo-950/20 w-full">
                        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform text-indigo-900 dark:text-indigo-100 pointer-events-none">
                            <i className="fa-solid fa-user-clock"></i>
                        </div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-white dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-500 text-xl shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-users-viewfinder"></i>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80 mb-2">Active Patients</p>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-lobster text-indigo-600 dark:text-indigo-300">{visitedPatients.length} Accessed</span>
                                    <span className="text-[10px] font-bold text-indigo-400/70 mt-1">Session History</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    <button className="relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-amber-50/80 dark:bg-amber-950/20 w-full">
                        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform text-amber-900 dark:text-amber-100 pointer-events-none">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-white dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-file-signature"></i>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 mb-2">Pending Care</p>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-lobster text-amber-600 dark:text-amber-300">{priorityItems.length} Alerts</span>
                                     <span className="text-[10px] font-bold text-amber-400/70 mt-1">Clear to resolve</span>
                                </div>
                            </div>
                        </div>
                    </button>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'patients' && (
              <DoctorPatientsScreen 
                patients={visitedPatients.map(p => ({ id: p.id, name: p.petName, breed: p.breed, avatar: p.petAvatar }))} 
                onSelectPatient={(id) => handleSearch(id.startsWith('PET-') ? id : `PET-${id}`)} 
              />
            )}
            {activeTab === 'profile' && (
              <DoctorProfileScreen doctorProfile={doctor.doctorDetails!} doctorId={doctor.id} />
            )}
          </div>
        )}
      </main>

      {!isViewingPatient && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2">
          {[
            { id: 'discover', icon: 'magnifying-glass', label: 'Discover', color: 'indigo' },
            { id: 'patients', icon: 'clipboard-list', label: 'History', color: 'emerald' },
            { id: 'profile', icon: 'id-card-clip', label: 'Identity', color: 'rose' },
          ].map((item) => (
            <NavButton
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id as any)}
              icon={item.icon}
              label={item.label}
              color={item.color as any}
            />
          ))}
        </nav>
      )}
    </div>
  );
};

export default DoctorDashboard;
