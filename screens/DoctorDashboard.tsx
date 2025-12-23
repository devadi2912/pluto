
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, PetProfile, TimelineEntry, PetDocument, DailyChecklist, RoutineItem, Reminder, DailyLog } from '../types';
import Dashboard from './Dashboard';
import TimelineScreen from './TimelineScreen';
import DocumentsScreen from './DocumentsScreen';
import ProfileScreen from './ProfileScreen';
import DoctorProfileScreen from './DoctorProfileScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorSearchScreen from './DoctorSearchScreen';
import { supabase } from '../lib/supabase';

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
  dailyLogs,
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
  const [activePatient, setActivePatient] = useState<any>(null);
  const [priorityItems, setPriorityItems] = useState<PriorityItemData[]>([]);

  const handleSearch = async (id?: string) => {
    const targetId = (id || searchId).toUpperCase();
    
    // Fetch real patient data
    const { data: pet, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error || !pet) {
      alert("Pet ID not found.");
      return;
    }

    // Log Access
    await supabase.from('medical_access_logs').insert({
      doctorId: doctor.id,
      petId: pet.id,
      action: 'VIEW_RECORDS'
    });

    // Save to Doctor's Patients list
    await supabase.from('doctor_patients').upsert({
      doctorId: doctor.id,
      petId: pet.id,
      lastAccessed: new Date().toISOString()
    });

    // Fetch full patient records for the view
    const [timelineRes, docsRes, remsRes] = await Promise.all([
      supabase.from('timeline').select('*').eq('petId', pet.id).order('date', { ascending: false }),
      supabase.from('documents').select('*').eq('petId', pet.id).order('date', { ascending: false }),
      supabase.from('reminders').select('*').eq('petId', pet.id).order('date', { ascending: true })
    ]);

    setActivePatient({
      pet,
      timeline: timelineRes.data || [],
      documents: docsRes.data || [],
      reminders: remsRes.data || [],
      checklist: { food: false, water: false, walk: false, medication: false, lastReset: '' },
      routine: []
    });

    setIsViewingPatient(true);
  };

  const removePriorityItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  const renderPetView = () => {
    if (!activePatient) return null;

    return (
      <div className="flex flex-col h-full bg-[#FFFAF3] dark:bg-zinc-950 animate-in fade-in duration-500 relative overflow-hidden">
        <div className="md:hidden p-4 bg-orange-500 text-white flex items-center justify-between sticky top-0 z-[50] shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsViewingPatient(false)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-2xl transition-all">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-bold text-sm tracking-tight">{activePatient.pet.name}</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Medical Access</div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative h-full">
          <div className="hidden md:flex items-center justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
             <div className="flex items-center gap-4">
                <img src={activePatient.pet.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg" alt="avatar" />
                <div>
                   <h2 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">{activePatient.pet.name}</h2>
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{activePatient.pet.id} • Medical File</p>
                </div>
             </div>
             <button 
               onClick={() => setIsViewingPatient(false)}
               className="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
             >
               Exit Record
             </button>
          </div>

          <div className="relative md:p-10 pb-44 md:pb-12">
            {patientSubTab === 'profile' && (
              <Dashboard 
                pet={activePatient.pet} 
                reminders={activePatient.reminders} 
                checklist={activePatient.checklist} 
                setChecklist={() => {}} 
                routine={activePatient.routine} 
                setRoutine={() => {}} 
                onCompleteReminder={() => {}} 
                timeline={activePatient.timeline} 
                dailyLogs={dailyLogs} 
                onUpdateLog={() => {}} 
                readOnly={true}
              />
            )}
            {patientSubTab === 'timeline' && (
              <TimelineScreen 
                timeline={activePatient.timeline} 
                setTimeline={() => {}} 
                documents={activePatient.documents} 
                reminders={activePatient.reminders} 
                setReminders={() => {}} 
                dailyLogs={dailyLogs} 
                onUpdateLog={() => {}} 
                petName={activePatient.pet.name} 
                readOnly={true}
              />
            )}
            {patientSubTab === 'docs' && (
              <DocumentsScreen 
                documents={activePatient.documents} 
                setDocuments={() => {}} 
                petName={activePatient.pet.name} 
                readOnly={true}
              />
            )}
            {patientSubTab === 'identity' && (
              <ProfileScreen 
                pet={activePatient.pet} 
                setPet={() => {}} 
                reminders={activePatient.reminders} 
                readOnly={true}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DoctorProfileScreen doctorProfile={doctor.doctorDetails!} doctorId={doctor.id} />;
      case 'patients':
        return <DoctorPatientsScreen onViewRecords={(id) => handleSearch(id)} />;
      case 'discover':
      default:
        return (
          <div className="space-y-12 animate-in fade-in duration-500 pb-60 max-w-5xl mx-auto">
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
                <DoctorSearchScreen searchId={searchId} setSearchId={setSearchId} handleSearch={(id) => handleSearch(id)} />
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
                 Practice Management Terminal • V.3.2
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

const PriorityItem: React.FC<{ 
  title: string, 
  detail: string, 
  type: string, 
  color: string, 
  onClick: () => void,
  onRemove: (e: React.MouseEvent) => void
}> = ({ title, detail, type, color, onClick, onRemove }) => (
  <button onClick={onClick} className="w-full bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border-4 border-zinc-50 dark:border-zinc-800 flex items-center gap-5 text-left hover:border-orange-500/20 shadow-xl transition-all group active:scale-[0.98] relative overflow-hidden">
     <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-md ${color} group-hover:animate-pulse`}>{type}</div>
     <div className="flex-1">
        <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{title}</h5>
        <p className="text-[11px] text-zinc-400 font-bold">{detail}</p>
     </div>
     <div className="flex items-center gap-2">
        <button onClick={onRemove} className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-transparent">
           <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
        <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-orange-500 transition-transform group-hover:translate-x-1"></i>
     </div>
  </button>
);

export default DoctorDashboard;
