
import React, { useState, useMemo } from 'react';
import { PetProfile, Reminder, DailyChecklist, RoutineItem, TimelineEntry, DailyLog } from '../types';
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

  return (
    <div className="p-5 md:p-10 space-y-10 animate-in fade-in duration-700 pb-44 no-scrollbar">
      {/* Hero Card */}
      <section className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group border border-zinc-800">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group/avatar cursor-pointer">
              <img src={pet.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] border-4 border-white/10 shadow-2xl group-hover/avatar:rotate-6 transition-transform duration-500" alt="Pet" />
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-bounce">
                <i className="fa-solid fa-bolt text-[10px]"></i>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-lobster tracking-wide">Hi, {pet.name}'s Family!</h2>
              <p className="text-zinc-300 dark:text-zinc-400 mt-1 font-bold italic text-sm md:text-base">You've reached <span className="text-orange-400">{progressPercent}%</span> today.</p>
            </div>
          </div>
          {!readOnly && (
            <button 
              onClick={() => setShowLogModal(true)}
              className="bg-white/10 hover:bg-orange-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-2 border border-white/20 backdrop-blur-md"
            >
              <i className="fa-solid fa-notes-medical"></i> Log Update
            </button>
          )}
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 border border-orange-500/20"
            >
              <i className="fa-solid fa-plus-circle"></i> Log Today
            </button>
          )}
        </div>
        <HealthTrends petName={pet.name} dailyLogs={dailyLogs} color="orange" />
      </section>

      {/* Daily Update Modal - Improved Text Visibility */}
      {showLogModal && !readOnly && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/30 animate-in fade-in" onClick={() => setShowLogModal(false)}>
           <div className="bg-white/95 dark:bg-zinc-900/90 backdrop-blur-3xl backdrop-saturate-150 w-full max-w-sm rounded-t-[3rem] md:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 border border-white dark:border-zinc-800/40" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h4 className="font-lobster text-3xl text-zinc-900 dark:text-zinc-50">Daily Log</h4>
                    <p className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest mt-1">Status for today</p>
                 </div>
                 <button onClick={() => setShowLogModal(false)} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"><i className="fa-solid fa-xmark"></i></button>
              </div>
              
              <div className="space-y-8 pb-4">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-[0.15em] ml-1">Daily Activity (Min)</label>
                    <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-orange-200 transition-all">
                       <button onClick={() => onUpdateLog(today, { activityMinutes: Math.max(0, (currentLogData?.activityMinutes || 0) - 10) })} className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-500 hover:text-orange-500"><i className="fa-solid fa-minus"></i></button>
                       <span className="flex-1 text-center text-3xl font-black text-zinc-900 dark:text-zinc-50">{currentLogData?.activityMinutes || 0}</span>
                       <button onClick={() => onUpdateLog(today, { activityMinutes: (currentLogData?.activityMinutes || 0) + 10 })} className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-500 hover:text-orange-500"><i className="fa-solid fa-plus"></i></button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-[0.15em] ml-1">Owner-Observed Mood</label>
                    <div className="flex justify-between gap-2">
                       {[1,2,3,4,5].map(v => (
                         <button 
                           key={v}
                           onClick={() => onUpdateLog(today, { moodRating: v })}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border-2 ${
                             currentLogData?.moodRating === v 
                               ? 'bg-orange-500 border-white text-white shadow-lg scale-110' 
                               : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-400'
                           }`}
                         >
                           {['😢', '😕', '😐', '🙂', '🤩'][v-1]}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-400 tracking-[0.15em] ml-1">Feeding Count</label>
                    <div className="flex justify-between gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-2xl">
                       {[1, 2, 3, 4].map(v => (
                         <button 
                           key={v}
                           onClick={() => onUpdateLog(today, { feedingCount: v })}
                           className={`flex-1 py-3 rounded-xl font-black text-xs transition-all border-2 ${
                             currentLogData?.feedingCount === v 
                               ? 'bg-emerald-500 border-white text-white shadow-md' 
                               : 'bg-transparent border-transparent text-zinc-500 dark:text-zinc-400'
                           }`}
                         >
                           {v}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button 
                  onClick={() => setShowLogModal(false)} 
                  className="w-full py-5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-[2.2rem] font-black uppercase tracking-[0.25em] text-[11px] shadow-xl hover:brightness-110 active:scale-95 transition-all border border-white/10"
                 >
                   Save Update
                 </button>
              </div>
           </div>
        </div>
      )}

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

      {/* Routine Creation Modal - Improved Contrast */}
      {showAddRoutine && !readOnly && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/30 animate-in fade-in">
          <div className="bg-white/95 dark:bg-zinc-900/90 backdrop-blur-3xl border border-white dark:border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-lobster text-3xl text-orange-600">New Task</h4>
              <button onClick={() => setShowAddRoutine(false)} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="time" className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-zinc-100" value={newRoutine.time} onChange={e => setNewRoutine({...newRoutine, time: e.target.value})} />
              <select className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-zinc-100" value={newRoutine.category} onChange={e => setNewRoutine({...newRoutine, category: e.target.value as any})}>
                <option value="Food">Food 🍖</option>
                <option value="Walk">Walk 🦮</option>
                <option value="Medication">Meds 💊</option>
                <option value="Play">Play 🎾</option>
              </select>
            </div>
            <input type="text" placeholder="Task description..." className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-zinc-100 shadow-inner" value={newRoutine.title} onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} />
            <button onClick={handleAddRoutine} className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:brightness-110 active:scale-95 transition-all">Create Goal</button>
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      <section className="space-y-6 pb-20">
        <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Coming Up</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reminders.filter(r => !r.completed).slice(0, 4).map((reminder, idx) => (
            <div 
              key={reminder.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)] transition-all group animate-in slide-in-from-bottom-5"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${reminder.type === 'Vaccination' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40' : 'bg-purple-50 text-purple-600 dark:bg-purple-950/40'}`}>
                <i className={`fa-solid ${reminder.type === 'Vaccination' ? 'fa-syringe' : 'fa-pills'}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{reminder.title}</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">{new Date(reminder.date).toLocaleDateString()}</p>
              </div>
              {!readOnly && (
                <button 
                  onClick={() => onCompleteReminder(reminder.id)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 hover:bg-orange-500 hover:text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all active:scale-90"
                >
                  Done
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
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

  const activeLabelMap: any = {
    orange: 'text-white',
    blue: 'text-white',
    emerald: 'text-white',
    purple: 'text-white',
  };

  return (
    <button 
      onClick={() => !readOnly && onClick()}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] transition-all duration-500 relative overflow-hidden group border-4 ${
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
