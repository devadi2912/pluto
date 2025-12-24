
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog, DoctorNote } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import DoctorProfileScreen from './DoctorProfileScreen';

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
  const [doctorProfile] = useState(doctor.doctorDetails!);
  
  const [visitedPatientIds, setVisitedPatientIds] = useState<Set<string>>(new Set());
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  const handleSearch = (id?: string) => {
    const targetId = (id || searchId).toUpperCase();
    
    if (targetId === petData.pet.id || targetId.startsWith('PET-')) {
      const isNewVisit = !visitedPatientIds.has(targetId);
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
      } else if (isNewVisit) {
        const mockItem: PriorityItemData = {
          id: `p-${targetId}-${Date.now()}`,
          title: `${targetId.split('-')[1]}'s Follow-up`,
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
                className="px-6 py-3 rounded-2xl bg-indigo-600/90 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] dark:shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <i className="fa-solid fa-pen-fancy"></i> Leave Clinical Note
              </button>
              <button 
                onClick={() => setIsViewingPatient(false)}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95"
              >
                Exit Record
              </button>
           </div>
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

      {/* Note Modal for Doctor - REDESIGNED WITH TRANSPARENT BACKDROP AND LOCALIZED BLUR */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-transparent" onClick={() => setShowNoteModal(false)}>
           <div 
             className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[60px] p-8 rounded-[3.5rem] border-4 border-white dark:border-zinc-950 shadow-[0_0_80px_rgba(255,255,255,0.2)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] w-full max-w-md animate-in zoom-in-95" 
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h4 className="font-lobster text-4xl text-indigo-600 dark:text-indigo-400 leading-none">Clinical Advice</h4>
                    <p className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em] mt-2 opacity-60">Direct note to {petData.pet.name}'s Owner</p>
                 </div>
                 <button onClick={() => setShowNoteModal(false)} className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-zinc-800/40 text-zinc-900 dark:text-white flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border-4 border-white dark:border-zinc-950">
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              
              <div className="relative group">
                <textarea 
                  className="w-full h-48 p-6 rounded-[2rem] bg-white/40 dark:bg-black/20 border-4 border-white/40 dark:border-zinc-800/60 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none font-bold text-zinc-900 dark:text-zinc-100 transition-all resize-none shadow-inner text-sm leading-relaxed"
                  placeholder="e.g., Luna's heart rate is stable. Ensure she finishes her current course of antibiotics and limit intense activity for 48 hours."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                />
              </div>

              <div className="mt-10">
                 <button 
                  onClick={handleLeaveNote}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:brightness-110 active:scale-95 transition-all border-4 border-white dark:border-zinc-950"
                 >
                   Sync Advice to Owner
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DoctorProfileScreen doctorProfile={doctorProfile} doctorId={doctor.id} />;
      case 'patients':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-60">
             <div 
               onClick={() => handleSearch(petData.pet.id)}
               className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border-4 border-white dark:border-zinc-800 flex items-center gap-6 shadow-xl cursor-pointer hover:border-orange-500/30 transition-all group"
             >
                <img src={petData.pet.avatar} className="w-20 h-20 rounded-2xl border-4 border-zinc-50 dark:border-zinc-800 shadow-md group-hover:rotate-6 transition-transform" alt="pet" />
                <div className="flex-1">
                   <h4 className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">{petData.pet.name}</h4>
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{petData.pet.id}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-orange-500 transition-transform group-hover:translate-x-1"></i>
             </div>
          </div>
        );
      case 'discover':
      default:
        return (
          <div className="space-y-12 animate-in fade-in duration-500 pb-60 max-w-5xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StatCard 
                  label="Active Patients" 
                  value={visitedPatientIds.size} 
                  icon="users-medical" 
                  color="bg-emerald-500" 
                  glowColor="rgba(16,185,129,0.3)" 
                />
                <StatCard 
                  label="Urgent Medical Alerts" 
                  value={priorityItems.length} 
                  icon="bolt-lightning" 
                  color="bg-orange-500" 
                  glowColor="rgba(249,115,22,0.3)" 
                />
             </div>

             <section className="space-y-6">
                <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide px-2">Practice Queue</h3>
                {priorityItems.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 p-16 rounded-[3rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800 text-center flex flex-col items-center shadow-xl">
                    <div className="w-20 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-200 dark:text-emerald-900 text-4xl mb-6 shadow-inner">
                      <i className="fa-solid fa-clipboard-check"></i>
                    </div>
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Medical Slate Clear</p>
                    <p className="text-sm text-zinc-300 dark:text-zinc-600 mt-2 font-bold max-w-xs leading-relaxed">Scan a Patient ID to begin high-priority care tracking.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {priorityItems.map(item => (
                       <PriorityItem key={item.id} title={item.title} detail={item.detail} type={item.type} color={item.color} onClick={() => handleSearch(item.targetId)} onRemove={(e) => removePriorityItem(item.id, e)} />
                     ))}
                  </div>
                )}
             </section>

             <div className="max-w-4xl mx-auto w-full pt-6">
                <section className="space-y-6">
                  <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Patient Lookup</h3>
                  <div className="bg-zinc-900 dark:bg-zinc-800 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-zinc-800 dark:border-zinc-700">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="PET-LUNA-123"
                          className="flex-1 p-5 rounded-2xl bg-white/5 border-2 border-white/10 outline-none font-bold text-white placeholder:text-zinc-600 focus:border-emerald-500/50 transition-all uppercase tracking-wider"
                          value={searchId}
                          onChange={e => setSearchId(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                          onClick={() => handleSearch()}
                          className="w-16 h-16 bg-white text-zinc-900 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <i className="fa-solid fa-magnifying-glass text-xl"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative no-scrollbar">
      {isViewingPatient ? renderPetView() : (
        <div className="flex-1 p-6 md:p-12 space-y-12 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight tracking-wide">Command Center</h2>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1">
                 Practice Management Terminal
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-20 h-20 bg-white dark:bg-zinc-900 border-4 border-orange-50 dark:border-zinc-800 rounded-[2.5rem] flex items-center justify-center text-orange-600 shadow-2xl transition-all hover:scale-105 active:rotate-6 group"
            >
              <i className="fa-solid fa-user-md text-3xl group-hover:animate-pulse"></i>
            </button>
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: string, color: string, glowColor: string }> = ({ label, value, icon, color, glowColor }) => (
  <div 
    className={`${color} p-10 rounded-[3.5rem] text-white relative overflow-hidden group transition-all duration-700 hover:scale-[1.03] border-4 border-white dark:border-zinc-800 shadow-xl`}
    style={{ boxShadow: `0 20px 40px -10px ${glowColor}` }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
    <i className={`fa-solid fa-${icon} text-3xl mb-4 opacity-50`}></i>
    <p className="text-5xl font-black drop-shadow-md tracking-tighter">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">{label}</p>
  </div>
);

const PriorityItem: React.FC<{ 
  title: string, 
  detail: string, 
  type: string, 
  color: string, 
  onClick: () => void,
  onRemove: (e: React.MouseEvent) => void
}> = ({ title, detail, type, color, onClick, onRemove }) => (
  <button onClick={onClick} className="w-full bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border-4 border-zinc-50 dark:border-zinc-800 flex items-center gap-5 text-left hover:border-orange-500/20 shadow-xl transition-all group active:scale-[0.98] relative overflow-hidden">
     <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-md ${color}`}>{type}</div>
     <div className="flex-1">
        <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{title}</h5>
        <p className="text-[11px] text-zinc-400 font-bold">{detail}</p>
     </div>
     <div className="flex items-center gap-2">
        <button onClick={onRemove} className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">
           <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
        <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-orange-500 transition-transform"></i>
     </div>
  </button>
);

export default DoctorDashboard;
