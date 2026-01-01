
import React, { useState } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog, DoctorNote, Doctor, Species, Gender } from '../types';
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
  onVisitPatient?: (petId: string) => Promise<void>;
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
  const [isSearching, setIsSearching] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set());
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  const handleSearch = async (id?: string | any) => {
    const rawInput = typeof id === 'string' ? id : searchId;
    const trimmedInput = rawInput.trim();
    
    if (!trimmedInput.toUpperCase().startsWith('PET-')) {
      alert("Invalid ID format. Patient IDs must start with 'PET-'.");
      return;
    }

    setIsSearching(true);
    try {
      const patientUid = trimmedInput.substring(4); 
      const patientProfile = await api.getUserProfile(patientUid);

      if (!patientProfile || patientProfile.role !== 'PET_OWNER') {
        console.log("id not found");
        alert("Patient not found in the database. Please verify the ID.");
        setIsSearching(false);
        return;
      }

      console.log("id exists .... ");
      
      const displayId = `PET-${patientUid}`;
      setVisitedPatientIds(prev => new Set([...Array.from(prev), displayId]));
      
      try {
        if (doctor.doctorDetails?.id) {
           await api.logDoctorVisit(displayId, doctor.doctorDetails.id);
        }
      } catch (logError) {
        console.warn("Audit log updated (medical network history)");
      }

      if (onVisitPatient) {
        setIsHydrating(true);
        await onVisitPatient(displayId);
        setIsHydrating(false);
      }

      const alertItem: PriorityItemData = {
        id: `p-${displayId}-${Date.now()}`,
        title: `${patientProfile.petDetails?.name || 'Patient'}'s Case`,
        detail: "Consultation in progress",
        type: "Active",
        color: "bg-rose-100",
        targetId: displayId
      };
      setPriorityItems(prev => [alertItem, ...prev].slice(0, 5));

      setIsViewingPatient(true);
    } catch (error) {
      console.error("Search system error:", error);
      alert("Connectivity issue. Could not reach the medical database.");
    } finally {
      setIsSearching(false);
      setIsHydrating(false);
    }
  };

  const handleLeaveNote = () => {
    if (!noteContent.trim()) return;
    const newNote: DoctorNote = {
      id: Date.now().toString(),
      doctorId: doctor.doctorDetails?.id || doctor.id,
      doctorName: doctor.doctorDetails?.name || 'Veterinarian',
      petId: petData.pet.id,
      date: new Date().toISOString(),
      content: noteContent
    };
    onAddNote(newNote);
    setShowNoteModal(false);
    setNoteContent('');
    alert("Clinical note added successfully.");
  };

  const removePriorityItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  const handleHomeClick = () => {
    setActiveTab('discover');
    setIsViewingPatient(false);
  };

  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Mobile Header with Theme Toggle */}
      <div className="md:hidden p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-[50] shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsViewingPatient(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="font-bold text-sm tracking-tight">{petData.pet.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <i className={`fa-solid ${darkMode ? 'fa-sun text-orange-200' : 'fa-moon text-indigo-100'}`}></i>
          </button>
          <button onClick={() => setShowNoteModal(true)} className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
             <i className="fa-solid fa-pen-fancy mr-2"></i>Note
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative h-full">
        {isHydrating ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
             <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-lobster text-2xl text-zinc-400">Loading Clinical Records...</p>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
                    <img src={petData.pet.avatar} className="w-full h-full object-cover" alt="avatar" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{petData.pet.name}</h2>
                     <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{petData.pet.id} • Verified Record</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowNoteModal(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all">
                    <i className="fa-solid fa-pen-fancy mr-2"></i> Add Clinical Note
                  </button>
                  <button onClick={() => setIsViewingPatient(false)} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all">
                    Close Record
                  </button>
               </div>
            </div>

            <div className="relative md:p-10 pb-44 md:pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {patientSubTab === 'profile' && (
                <Dashboard 
                  pet={petData.pet} 
                  reminders={petData.reminders} 
                  checklist={petData.checklist} 
                  setChecklist={() => {}} 
                  routine={petData.routine} 
                  onCompleteReminder={() => {}} 
                  timeline={petData.timeline} 
                  dailyLogs={dailyLogs} 
                  onUpdateLog={() => {}} 
                  doctorNotes={doctorNotes}
                  onDeleteNote={undefined}
                  readOnly={true}
                />
              )}
              {patientSubTab === 'timeline' && (
                <TimelineScreen 
                  timeline={petData.timeline} 
                  setTimeline={() => {}} 
                  documents={petData.documents} 
                  reminders={petData.reminders} 
                  setReminders={() => {}} 
                  dailyLogs={dailyLogs} 
                  onUpdateLog={() => {}} 
                  petName={petData.pet.name} 
                  doctorNotes={doctorNotes}
                  onDeleteNote={undefined}
                  consultedDoctors={consultedDoctors}
                  readOnly={true}
                />
              )}
              {patientSubTab === 'docs' && (
                <DocumentsScreen 
                  documents={petData.documents} 
                  setDocuments={() => {}} 
                  petName={petData.pet.name} 
                  readOnly={true}
                />
              )}
              {patientSubTab === 'identity' && (
                <ProfileScreen 
                  pet={petData.pet} 
                  setPet={() => {}} 
                  reminders={petData.reminders} 
                  readOnly={true}
                />
              )}
            </div>
          </>
        )}
      </div>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] flex items-center justify-around px-2">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/20 dark:bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in" onClick={() => setShowNoteModal(false)}>
           <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border-4 border-white dark:border-zinc-950 shadow-2xl w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h4 className="font-lobster text-3xl text-indigo-600 dark:text-indigo-400">Clinical Entry</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Guidance for {petData.pet.name}</p>
                 </div>
                 <button onClick={() => setShowNoteModal(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-all">
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <textarea 
                className="w-full h-40 p-5 rounded-2xl bg-zinc-50 dark:bg-black/20 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-zinc-900 dark:text-zinc-100 transition-all resize-none shadow-inner"
                placeholder="Medical observations and guidance..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
              />
              <div className="mt-8">
                 <button onClick={handleLeaveNote} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all">
                   Submit Clinical Note
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
            <button onClick={handleHomeClick} className="flex items-center gap-3 mb-16 justify-center group outline-none hover:scale-105 active:scale-95 transition-transform duration-300">
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300"><i className="fa-solid fa-user-md text-lg"></i></div>
              <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">Pluto <span className="text-indigo-600">MD</span></h1>
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
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 border-[4px] relative group overflow-hidden ${activeTab === item.id && !isViewingPatient ? 'bg-indigo-600 text-white border-white dark:border-black shadow-lg scale-105 z-10' : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'}`}
                >
                  <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
                  <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </nav>
          </>
        ) : (
          <>
             <button onClick={handleHomeClick} className="flex items-center gap-3 mb-10 justify-center group outline-none hover:scale-105 active:scale-95 transition-transform duration-300">
               <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300"><i className="fa-solid fa-arrow-left text-xs"></i></div>
               <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-orange-500 transition-colors">Main Menu</span>
             </button>
             <div className="flex flex-col items-center text-center mb-10 animate-in zoom-in-90 duration-500">
                <div className="w-24 h-24 rounded-[2rem] p-1 bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-xl mb-4 overflow-hidden hover:scale-105 transition-transform duration-300">
                   <img src={petData.pet.avatar} className="w-full h-full object-cover rounded-[1.8rem]" alt="pet" />
                </div>
                <h2 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{petData.pet.name}</h2>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{petData.pet.id}</p>
                </div>
             </div>
             <nav className="flex-1 space-y-4">
                {patientNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPatientSubTab(item.id as any)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 border-[4px] relative group overflow-hidden ${patientSubTab === item.id ? `bg-${item.color}-500 text-white border-white dark:border-black ${getGlowClass(item.color)} scale-[1.05] z-10` : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:translate-x-1'}`}
                  >
                    <i className={`fa-solid fa-${item.icon} text-sm transition-transform duration-300 group-hover:scale-125`}></i>
                    <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
             </nav>
             <div className="pt-6 space-y-4">
                <button onClick={() => setShowNoteModal(true)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all"><i className="fa-solid fa-pen-fancy mr-2"></i>Note</button>
             </div>
          </>
        )}
        {/* Persistent Bottom Controls */}
        <div className="pt-8 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110 active:scale-90 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
             <div className="relative w-8 h-8 flex items-center justify-center">
                <i className={`fa-solid fa-sun absolute transition-all duration-700 ${darkMode ? 'rotate-0 scale-110 opacity-100 text-orange-400 animate-spin-slow' : 'rotate-180 scale-0 opacity-0'}`}></i>
                <i className={`fa-solid fa-moon absolute transition-all duration-700 ${!darkMode ? 'rotate-0 scale-110 opacity-100 text-indigo-400' : 'rotate-180 scale-0 opacity-0'}`}></i>
             </div>
          </button>
          <button onClick={onLogout} className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-110 active:scale-90 border-2 border-transparent hover:border-rose-100"><i className="fa-solid fa-power-off"></i></button>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto no-scrollbar relative ${!isViewingPatient ? 'pt-16 md:pt-0' : ''}`}>
        {isViewingPatient ? renderPetView() : (
          <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12 pb-32">
            {activeTab === 'discover' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                  <div>
                    <h2 className="text-4xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Discovery Hub</h2>
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-1">Global patient lookup system</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-10">
                    <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={handleSearch} isSearching={isSearching} />
                    <div className="space-y-6">
                      <h3 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 px-2 tracking-wide">Recent Notifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {priorityItems.length > 0 ? priorityItems.map(item => (
                          <div key={item.id} className="bg-rose-100 dark:bg-rose-900/30 p-5 rounded-[1.5rem] relative group border-none shadow-sm hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1 block">{item.type}</span>
                                    <h4 className="font-lobster text-xl text-rose-600 dark:text-rose-400 tracking-wide">{item.title}</h4>
                                    <p className="text-[11px] font-bold text-rose-800/60 mt-0.5">{item.detail}</p>
                                </div>
                                <button onClick={(e) => removePriorityItem(item.id, e)} className="w-6 h-6 rounded-full bg-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-300 transition-colors"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                            </div>
                          </div>
                        )) : (
                          <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] text-zinc-300 font-bold text-sm">No recent patient activities</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-indigo-50/80 dark:bg-indigo-950/20 p-8 rounded-[3rem] border-2 border-transparent h-48 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 hover:shadow-xl group">
                       <i className="fa-solid fa-users-viewfinder text-indigo-500 text-3xl group-hover:rotate-12 transition-transform"></i>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Clinic Reach</p>
                          <span className="text-3xl font-lobster text-indigo-600 dark:text-indigo-300 tracking-wide">{visitedPatientIds.size} Patients</span>
                       </div>
                    </div>
                    <div className="bg-amber-50/80 dark:bg-amber-950/20 p-8 rounded-[3rem] border-2 border-transparent h-48 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 hover:shadow-xl group">
                       <i className="fa-solid fa-bell text-amber-500 text-3xl group-hover:scale-110 transition-transform"></i>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Queue Size</p>
                          <span className="text-3xl font-lobster text-amber-600 dark:text-amber-300 tracking-wide">{priorityItems.length} Alerts</span>
                       </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'patients' && (
              <DoctorPatientsScreen patients={Array.from(visitedPatientIds).map(id => ({ id, name: id.split('-')[1] || 'Patient', breed: 'N/A' }))} onSelectPatient={(id) => handleSearch(id)} />
            )}
            {activeTab === 'profile' && <DoctorProfileScreen doctorProfile={doctor.doctorDetails!} doctorId={doctor.id} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
