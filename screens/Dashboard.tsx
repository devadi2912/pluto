
import React, { useState, useMemo } from 'react';
import { PetProfile, Reminder, DailyChecklist, RoutineItem, TimelineEntry, DailyLog, DoctorNote } from '../types';
import { HealthTrends } from '../components/HealthTrends';

interface DashboardProps {
  pet: PetProfile;
  reminders: Reminder[];
  checklist: DailyChecklist;
  setChecklist: (checklist: DailyChecklist) => void;
  routine: RoutineItem[];
  setRoutine: React.Dispatch<React.SetStateAction<RoutineItem[]>>;
  onCompleteReminder: (id: string) => void;
  timeline: TimelineEntry[];
  dailyLogs: Record<string, DailyLog>;
  onUpdateLog: (date: string, data: Partial<DailyLog>) => void;
  doctorNotes?: DoctorNote[];
  onDeleteNote?: (id: string) => void;
  readOnly?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  pet, 
  reminders, 
  checklist, 
  setChecklist, 
  routine, 
  setRoutine,
  onCompleteReminder,
  timeline,
  dailyLogs,
  onUpdateLog,
  doctorNotes = [],
  onDeleteNote,
  readOnly = false
}) => {
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  const [newRoutine, setNewRoutine] = useState<{ title: string, time: string, category: RoutineItem['category'] }>({
    title: '',
    time: '09:00',
    category: 'Food'
  });

  const currentLogData = useMemo(() => {
    return dailyLogs[today] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 };
  }, [today, dailyLogs]);

  const latestNote = useMemo(() => {
    return doctorNotes.find(note => note.petId === pet.id);
  }, [doctorNotes, pet.id]);

  const toggleCheck = (key: keyof Omit<DailyChecklist, 'lastReset'>) => {
    if (readOnly) return;
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const toggleRoutine = (id: string) => {
    if (readOnly) return;
    setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleAddRoutine = () => {
    if (!newRoutine.title || readOnly) return;
    const item: RoutineItem = {
      id: Date.now().toString(),
      ...newRoutine,
      completed: false
    };
    setRoutine(prev => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
    setShowAddRoutine(false);
    setNewRoutine({ title: '', time: '09:00', category: 'Food' });
  };

  const progressPercent = useMemo(() => {
    const totalItems = routine.length + 4;
    const completedItems = routine.filter(r => r.completed).length + Object.values(checklist).filter(v => typeof v === 'boolean' && v).length;
    return Math.round((completedItems / totalItems) * 100);
  }, [routine, checklist]);

  const upcomingEvents = useMemo(() => {
    return reminders
      .filter(r => !r.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [reminders]);

  return (
    <div className="p-5 md:p-10 space-y-10 animate-in fade-in duration-700 pb-44 no-scrollbar">
      {/* Hero Card */}
      <section className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group border border-zinc-800">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group/avatar cursor-pointer">
              <img src={pet.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] border-4 border-white/10 shadow-2xl group-hover/avatar:rotate-6 transition-transform duration-500" alt="Pet" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-lobster tracking-wide">Hi, {pet.name}'s Family!</h2>
              <p className="text-zinc-300 dark:text-zinc-400 mt-1 font-bold italic text-sm md:text-base">You've reached <span className="text-orange-400">{progressPercent}%</span> today.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 relative z-10">
          <div className="flex justify-between items-end mb-3 px-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Care Progress</span>
             <span className="text-3xl font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">{progressPercent}%</span>
          </div>
          <div className="bg-zinc-900 h-6 md:h-8 rounded-full overflow-hidden p-1 border border-zinc-800 shadow-inner">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(249,115,22,0.8)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Daily Vitals Sparkline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Recorded Trends</h3>
          {!readOnly && (
            <button 
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 active:scale-90 transition-all border-2 border-white/10"
            >
              <i className="fa-solid fa-bolt-lightning"></i> Log Today
            </button>
          )}
        </div>
        <HealthTrends petName={pet.name} dailyLogs={dailyLogs} color="orange" />
      </section>

      {/* Routine & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Daily Routine</h3>
            {!readOnly && (
              <button 
                onClick={() => setShowAddRoutine(!showAddRoutine)}
                className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:scale-110 shadow-lg active:rotate-12 transition-all"
              >
                <i className={`fa-solid ${showAddRoutine ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
              </button>
            )}
          </div>
          <div className="space-y-4">
            {routine.map((item, idx) => (
              <div key={item.id} className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div 
                  onClick={() => toggleRoutine(item.id)}
                  className={`flex items-center gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] border-2 transition-all duration-300 group ${item.completed ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent opacity-60' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-lg'} ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${item.category === 'Food' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <i className={`fa-solid ${item.category === 'Food' ? 'fa-bowl-food' : 'fa-dog'}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{item.time}</p>
                    <h4 className={`text-lg font-bold ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{item.title}</h4>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 ${item.completed ? 'bg-emerald-500 border-white text-white rotate-[360deg]' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 text-transparent'}`}>
                    <i className="fa-solid fa-check text-sm"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Quick Checks</h3>
          <div className="grid grid-cols-2 gap-4">
            <CheckTile active={checklist.food} icon="bowl-food" label="Full Tummy" onClick={() => toggleCheck('food')} color="orange" readOnly={readOnly} />
            <CheckTile active={checklist.water} icon="faucet-drip" label="Hydrated" onClick={() => toggleCheck('water')} color="blue" readOnly={readOnly} />
            <CheckTile active={checklist.walk} icon="dog" label="Adventures" onClick={() => toggleCheck('walk')} color="emerald" readOnly={readOnly} />
            <CheckTile active={checklist.medication} icon="pills" label="Healthy Meds" onClick={() => toggleCheck('medication')} color="purple" readOnly={readOnly} />
          </div>
        </section>
      </div>

      {/* Upcoming Events Section - STACKED VERTICALLY AT BOTTOM */}
      <section className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide leading-none">Upcoming Events</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Planned Care History</p>
          </div>
        </div>
        
        <div className="space-y-4 px-2">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((reminder, idx) => (
              <div 
                key={reminder.id}
                className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group relative animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform shrink-0">
                   <i className={`fa-solid ${
                     reminder.type === 'Medication' ? 'fa-pills' : 
                     reminder.type === 'Vaccination' ? 'fa-syringe' : 'fa-stethoscope'
                   }`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate">{reminder.title}</h4>
                  <p className="text-[11px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.2em] mt-1.5">
                    {new Date(reminder.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                {/* Complete & Add to Journal Button */}
                {!readOnly && (
                  <button 
                    onClick={() => onCompleteReminder(reminder.id)}
                    className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all border-2 border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 active:scale-90 shadow-sm"
                    title="Complete & Log to Journal"
                  >
                    <i className="fa-solid fa-check text-lg"></i>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-16 text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-[3rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
               <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-calendar-check text-2xl opacity-40"></i>
               </div>
               <p className="font-black text-[10px] uppercase tracking-widest">No scheduled events found</p>
            </div>
          )}
        </div>
      </section>

      {/* Activity Log - Glass Card Pattern */}
      {showLogModal && !readOnly && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-transparent pointer-events-none transition-all duration-300 animate-in fade-in">
          <div 
            className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl w-full max-w-[380px] rounded-[3.5rem] shadow-2xl border-4 border-white dark:border-zinc-950 animate-in zoom-in-95 duration-500 overflow-hidden pointer-events-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 md:p-10 space-y-8">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                  <i className="fa-solid fa-paw text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-lobster text-3xl text-zinc-900 dark:text-zinc-50 truncate leading-none">Activity Log</h4>
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mt-1.5 opacity-60">Status: {pet.name}</p>
                </div>
                <button onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {/* Status Controls */}
              <div className="space-y-8">
                
                {/* 1. Activity Strip */}
                <div className="bg-zinc-100/50 dark:bg-black/20 p-5 rounded-3xl border border-white dark:border-zinc-800 space-y-3 group">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Active Time</span>
                    <span className="text-xs font-black text-orange-600">{currentLogData?.activityMinutes || 0}m</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onUpdateLog(today, { activityMinutes: Math.max(0, (currentLogData?.activityMinutes || 0) - 15) })}
                      className="w-10 h-10 rounded-xl bg-white/80 dark:bg-zinc-800/80 border-2 border-transparent hover:border-orange-500 transition-all text-zinc-400 hover:text-orange-500 active:scale-90 shadow-sm"
                    >
                      <i className="fa-solid fa-minus text-[10px]"></i>
                    </button>
                    <div className="flex-1 h-2.5 bg-zinc-200/50 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: `${Math.min(100, ((currentLogData?.activityMinutes || 0) / 120) * 100)}%` }}></div>
                    </div>
                    <button 
                      onClick={() => onUpdateLog(today, { activityMinutes: (currentLogData?.activityMinutes || 0) + 15 })}
                      className="w-10 h-10 rounded-xl bg-white/80 dark:bg-zinc-800/80 border-2 border-transparent hover:border-orange-500 transition-all text-zinc-400 hover:text-orange-500 active:scale-90 shadow-sm"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                    </button>
                  </div>
                </div>

                {/* 2. Meals */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Meals</span>
                  <div className="flex justify-between items-center gap-3 px-1">
                    {[1, 2, 3, 4].map(v => (
                      <button 
                        key={v}
                        onClick={() => onUpdateLog(today, { feedingCount: v })}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black transition-all border-2 border-white dark:border-black hover:scale-110 active:scale-90 ${
                          currentLogData?.feedingCount === v 
                            ? 'bg-emerald-500 text-white shadow-lg animate-pulse' 
                            : 'bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Vibe Selection */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Vibe</span>
                  <div className="flex bg-zinc-200/30 dark:bg-zinc-800/20 p-2 rounded-2xl border border-white dark:border-zinc-800/40">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button 
                        key={v}
                        onClick={() => onUpdateLog(today, { moodRating: v })}
                        className={`flex-1 py-2 text-xl transition-all rounded-xl hover:scale-110 active:scale-95 ${
                          currentLogData?.moodRating === v 
                            ? 'bg-white/80 dark:bg-zinc-700/80 shadow-sm scale-110 z-10' 
                            : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                        }`}
                      >
                        {['😢', '😕', '😐', '🙂', '🤩'][v-1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Record Button */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] transition-all active:scale-[0.96] border-4 border-white dark:border-black shadow-xl hover:brightness-110"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routine Add Modal - Glass Card Pattern with High-Quality Light Blue Theme */}
      {showAddRoutine && !readOnly && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300">
          <div 
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border-4 border-white dark:border-zinc-950 w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500 space-y-8 pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-lobster text-4xl text-sky-500 drop-shadow-sm">New Task</h4>
              <button 
                onClick={() => setShowAddRoutine(false)} 
                className="w-12 h-12 bg-white/50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-all active:scale-90 border-2 border-white dark:border-zinc-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-2">Time</span>
                <input 
                  type="time" 
                  className="w-full p-5 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border-2 border-transparent focus:border-sky-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 transition-all" 
                  value={newRoutine.time} 
                  onChange={e => setNewRoutine({...newRoutine, time: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-2">Category</span>
                <select 
                  className="w-full p-5 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border-2 border-transparent focus:border-sky-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 transition-all" 
                  value={newRoutine.category} 
                  onChange={e => setNewRoutine({...newRoutine, category: e.target.value as any})}
                >
                  <option value="Food">Food 🍖</option>
                  <option value="Walk">Walk 🦮</option>
                  <option value="Medication">Meds 💊</option>
                  <option value="Play">Play 🎾</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-2">Goal Details</span>
              <input 
                type="text" 
                placeholder="Task description..." 
                className="w-full p-6 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border-2 border-transparent focus:border-sky-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 shadow-inner transition-all" 
                value={newRoutine.title} 
                onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} 
              />
            </div>

            <button 
              onClick={handleAddRoutine} 
              className="w-full bg-sky-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-95 border-4 border-white dark:border-zinc-950 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3),0_0_20px_rgba(14,165,233,0.4)]"
            >
              Add Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckTile: React.FC<{ 
  active: boolean, icon: string, label: string, onClick: () => void, color: string, readOnly?: boolean
}> = ({ active, icon, label, onClick, color, readOnly }) => {
  const intenseShadowMap: any = {
    orange: 'shadow-[0_25px_60px_rgba(249,115,22,0.6)]',
    blue: 'shadow-[0_25px_60px_rgba(59,130,246,0.6)]',
    emerald: 'shadow-[0_25px_60px_rgba(16,185,129,0.6)]',
    purple: 'shadow-[0_25px_60px_rgba(168,85,247,0.6)]',
  };

  const bgMap: any = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
  };

  return (
    <button 
      onClick={() => !readOnly && onClick()}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden group border-4 ${
        active 
          ? `${bgMap[color]} ${intenseShadowMap[color]} text-white border-white dark:border-zinc-950 scale-[0.98]` 
          : 'bg-white dark:bg-zinc-900 border-zinc-50 dark:border-zinc-800 shadow-sm'
      } hover:scale-[1.03] ${readOnly ? 'cursor-default' : 'hover:border-white'}`}
    >
      <div className={`text-4xl transition-all ${active ? 'text-white scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-zinc-300 dark:text-zinc-700'}`}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <span className={`font-black text-[10px] uppercase tracking-[0.1em] ${active ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{label}</span>
      {active && (
        <div className="absolute top-3 right-3 bg-white text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
          <i className="fa-solid fa-check text-[10px]"></i>
        </div>
      )}
    </button>
  );
};

export default Dashboard;
