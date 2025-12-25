
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
  onVisitPatient?: () => void;
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

/**
 * DoctorDashboard component provides the main interface for veterinarians.
 * It handles patient searches, clinical notes, and medical record viewing.
 */
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
  
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set());
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  // Function to handle patient record search
  const handleSearch = (id?: string | any) => {
    // Ensure we are working with a string, as this might be called with an event object
    const query = typeof id === 'string' ? id : searchId;
    const targetId = query.toUpperCase();
    
    if (targetId === petData.pet.id || targetId.startsWith('PET-')) {
      setVisitedPatientIds(prev => new Set([...Array.from(prev), targetId]));
      
      if (onVisitPatient) {
        onVisitPatient();
      }

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
      } else {
        const mockItem: PriorityItemData = {
          id: `p-${targetId}-${Date.now()}`,
          title: `${targetId.split('-')[1] || 'Patient'}'s Follow-up`,
          detail: "Check recent lab reports",
          type: "Review",
          color: "bg-amber-100 text-amber-600 border-amber-200",
          targetId: targetId
        };
        setPriorityItems(prev => [...prev, mockItem]);
      }

      setIsViewingPatient(true);
    } else {
      alert("Pet ID not found. Try searching for: " + petData.pet.id);
    }
  };

  // Function to save a clinical note for a patient
  const handleLeaveNote = () => {
    if (!noteContent.trim()) return;
    const newNote: DoctorNote = {
      id: Date.now().toString(),
      doctorId: doctor.id,
      doctorName: doctor.doctorDetails?.name || 'Veterinarian',
      petId: petData.pet.id,
      date: new Date().toISOString(),
      content: noteContent
    };
    onAddNote(newNote);
    setShowNoteModal(false);
    setNoteContent('');
    alert("Advice logged for pet owner!");
  };

  const removePriorityItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  // Render the specific view for an opened patient record
  const renderPetView = () => (
    <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Mobile-Only Header for Patient View */}
      <div className="md:hidden p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-[50] shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsViewingPatient(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="font-bold text-sm tracking-tight">{petData.pet.name}</span>
        </div>
        <button onClick={() => setShowNoteModal(true)} className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
           <i className="fa-solid fa-pen-fancy mr-2"></i>Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative h-full">
        {/* Desktop Title Bar for Patient View - Simplified since actions are in sidebar */}
        <div className="hidden md:flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <img src={petData.pet.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg" alt="avatar" />
              <div>
                 <h2 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{petData.pet.name}</h2>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{petData.pet.id} • Medical File</p>
              </div>
           </div>
           {/* Actions moved to Sidebar */}
        </div>

        <div className="relative md:p-10 pb-44 md:pb-12">
          {patientSubTab === 'profile' && (
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
              doctorNotes={doctorNotes}
              onDeleteNote={onDeleteNote}
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
              onDeleteNote={onDeleteNote}
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
      </div>

      {/* Mobile Floating Footer for Patient View */}
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

      {/* Note Modal - Glass Card Pattern */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-transparent pointer-events-none" onClick={() => setShowNoteModal(false)}>
           <div 
             className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl p-8 rounded-[3rem] border-4 border-white dark:border-zinc-950 shadow-2xl w-full max-w-md animate-in zoom-in-95 pointer-events-auto" 
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h4 className="font-lobster text-3xl text-indigo-600 dark:text-indigo-400">Clinical Advice</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Direct note to {petData.pet.name}'s Family</p>
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
      {/* Desktop Sidebar - Context Aware */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
        {!isViewingPatient ? (
          // MAIN DOCTOR SIDEBAR
          <>
            <div className="flex items-center gap-3 mb-16 justify-center">
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><i className="fa-solid fa-user-md text-lg"></i></div>
              <h1 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Pluto <span className="text-indigo-600">MD</span></h1>
            </div>
            <nav className="flex-1 space-y-3">
              {[
                { id: 'discover', label: 'Discover', icon: 'magnifying-glass' },
                { id: 'patients', label: 'Patient Logs', icon: 'clipboard-list' },
                { id: 'profile', label: 'Identity', icon: 'id-card-clip' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsViewingPatient(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === item.id && !isViewingPatient
                      ? 'bg-indigo-600 text-white shadow-xl' 
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <i className={`fa-solid fa-${item.icon} text-sm`}></i>
                  <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
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
          // PATIENT CONTEXT SIDEBAR
          <>
             <div className="flex flex-col items-center text-center mb-10 animate-in slide-in-from-left-4 duration-500">
                <div className="w-24 h-24 rounded-[2rem] p-1 bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-xl mb-4">
                   <img src={petData.pet.avatar} className="w-full h-full object-cover rounded-[1.8rem] border-4 border-white dark:border-zinc-900" alt="pet" />
                </div>
                <h2 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{petData.pet.name}</h2>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{petData.pet.id}</p>
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

                {/* Footer Buttons Side-by-Side with Animations */}
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
                      onClick={() => setIsViewingPatient(false)}
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

      {/* Mobile Header (Main View) - Matches Pet Dashboard Aesthetics */}
      {!isViewingPatient && (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md z-[100] px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button 
            className="flex items-center gap-2 hover:scale-105 active:scale-95 hover:-rotate-2 transition-all group"
            onClick={() => { setActiveTab('discover'); setIsViewingPatient(false); }}
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

      {/* Main Content Area */}
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
                          <div key={item.id} className={`${item.color} p-5 rounded-3xl border-2 flex items-start justify-between group animate-in slide-in-from-bottom-2`}>
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-70">{item.type}</p>
                              <h4 className="font-bold text-sm">{item.title}</h4>
                              <p className="text-[10px] mt-1 font-medium">{item.detail}</p>
                            </div>
                            <button onClick={(e) => removePriorityItem(item.id, e)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                              <i className="fa-solid fa-circle-xmark"></i>
                            </button>
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
                    {/* Consults Card - Matching Vitality Style */}
                    <button className="relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-indigo-50/80 dark:bg-indigo-950/20 w-full">
                        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform text-indigo-900 dark:text-indigo-100 pointer-events-none">
                            <i className="fa-solid fa-calendar-check"></i>
                        </div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-white dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-500 text-xl shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-user-doctor"></i>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80 mb-2">Today's Schedule</p>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-lobster text-indigo-600 dark:text-indigo-300">4 Consults</span>
                                    <span className="text-[10px] font-bold text-indigo-400/70 mt-1">2 Urgent • 2 Follow-up</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Files Card - Matching Birthday Style */}
                    <button className="relative h-48 rounded-[3rem] p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden group border-2 border-transparent hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-amber-50/80 dark:bg-amber-950/20 w-full">
                        <div className="absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 group-hover:rotate-[20deg] transition-transform text-amber-900 dark:text-amber-100 pointer-events-none">
                            <i className="fa-solid fa-folder-open"></i>
                        </div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="w-12 h-12 bg-white dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-file-medical"></i>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 mb-2">Inbox</p>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-lobster text-amber-600 dark:text-amber-300">12 Files</span>
                                     <span className="text-[10px] font-bold text-amber-400/70 mt-1">New Labs & Reports</span>
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
                patients={Array.from(visitedPatientIds).map(id => ({ id, name: id.split('-')[1] || 'Patient', breed: 'N/A' }))} 
                onSelectPatient={(id) => handleSearch(id)} 
              />
            )}
            {activeTab === 'profile' && (
              <DoctorProfileScreen doctorProfile={doctor.doctorDetails!} doctorId={doctor.id} />
            )}
          </div>
        )}
      </main>

      {/* Mobile Floating Frosted Nav - Standardized */}
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
