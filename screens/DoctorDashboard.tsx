
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog, DoctorNote } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import DoctorProfileScreen from './DoctorProfileScreen';
import DoctorSearchScreen from './DoctorSearchScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';

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
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTab: 'profile' | 'discover' | 'patients';
  setActiveTab: (tab: 'profile' | 'discover' | 'patients') => void;
  isViewingPatient: boolean;
  setIsViewingPatient: (v: boolean) => void;
  patientSubTab: 'profile' | 'timeline' | 'docs' | 'identity';
  setPatientSubTab: (tab: 'profile' | 'timeline' | 'docs' | 'identity') => void;
}

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
  darkMode, 
  setDarkMode,
  activeTab,
  setActiveTab,
  isViewingPatient,
  setIsViewingPatient,
  patientSubTab,
  setPatientSubTab
}) => {
  const [searchId, setSearchId] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set());
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  // Function to handle patient record search
  const handleSearch = (id?: string) => {
    const targetId = (id || searchId).toUpperCase();
    
    if (targetId === petData.pet.id || targetId.startsWith('PET-')) {
      setVisitedPatientIds(prev => new Set([...Array.from(prev), targetId]));
      
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
      {/* Mobile-Only Header */}
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
        {/* Desktop Title Bar for Patient View */}
        <div className="hidden md:flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <img src={petData.pet.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg" alt="avatar" />
              <div>
                 <h2 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{petData.pet.name}</h2>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{petData.pet.id} • Medical File</p>
              </div>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => setShowNoteModal(true)}
                className="px-6 py-3 rounded-2xl bg-indigo-600/90 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <i className="fa-solid fa-pen-fancy"></i> Leave Clinical Note
              </button>
              <button 
                onClick={() => setIsViewingPatient(false)}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-md hover:scale-105 active:scale-95"
              >
                Exit Record
              </button>
           </div>
        </div>

        {/* Patient View Sub-Navigation */}
        <div className="flex gap-4 p-8 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800">
           {[
             { id: 'profile', label: 'Dashboard', icon: 'chart-line' },
             { id: 'timeline', label: 'Journal', icon: 'book-medical' },
             { id: 'docs', label: 'Files', icon: 'folder-open' },
             { id: 'identity', label: 'Identity', icon: 'paw' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setPatientSubTab(tab.id as any)}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-xs ${
                 patientSubTab === tab.id 
                   ? 'bg-orange-500 text-white shadow-lg' 
                   : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-zinc-800'
               }`}
             >
               <i className={`fa-solid fa-${tab.icon}`}></i>
               {tab.label}
             </button>
           ))}
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
      {/* Desktop Sidebar for Doctor */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 shadow-xl p-8 shrink-0 z-[100]">
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
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:text-indigo-600 transition-colors">
            <i className={`fa-solid fa-${darkMode ? 'sun' : 'moon'} text-sm`}></i>
            <span className="font-black text-[10px] uppercase tracking-widest">Theme</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {isViewingPatient ? renderPetView() : (
          <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-12">
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

                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <h4 className="text-2xl font-lobster mb-4">Daily Focus</h4>
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">4</div>
                              <p className="text-xs font-bold">Planned Consults</p>
                           </div>
                           <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">12</div>
                              <p className="text-xs font-bold">Files to Review</p>
                           </div>
                        </div>
                     </div>
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

      {/* Mobile Footer Navigation for Doctor */}
      {!isViewingPatient && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-zinc-800/20 shadow-2xl z-[100] flex items-center justify-around px-4">
          {[
            { id: 'discover', icon: 'magnifying-glass', label: 'Search' },
            { id: 'patients', icon: 'clipboard-list', label: 'History' },
            { id: 'profile', icon: 'id-card-clip', label: 'Profile' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400'}`}>
                <i className={`fa-solid fa-${item.icon} text-lg`}></i>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === item.id ? 'text-indigo-600' : 'text-zinc-500'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default DoctorDashboard;
