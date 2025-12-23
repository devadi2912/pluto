
import React, { useState } from 'react';
import { PetProfile, Reminder, DailyChecklist, RoutineItem } from '../types';

interface DashboardProps {
  pet: PetProfile;
  reminders: Reminder[];
  checklist: DailyChecklist;
  setChecklist: (checklist: DailyChecklist) => void;
  routine: RoutineItem[];
  setRoutine: React.Dispatch<React.SetStateAction<RoutineItem[]>>;
  onCompleteReminder: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  pet, 
  reminders, 
  checklist, 
  setChecklist, 
  routine, 
  setRoutine,
  onCompleteReminder
}) => {
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState<{ title: string, time: string, category: RoutineItem['category'] }>({
    title: '',
    time: '09:00',
    category: 'Food'
  });

  const toggleCheck = (key: keyof Omit<DailyChecklist, 'lastReset'>) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const toggleRoutine = (id: string) => {
    setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleAddRoutine = () => {
    if (!newRoutine.title) return;
    const item: RoutineItem = {
      id: Date.now().toString(),
      ...newRoutine,
      completed: false
    };
    setRoutine(prev => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
    setShowAddRoutine(false);
    setNewRoutine({ title: '', time: '09:00', category: 'Food' });
  };

  const progressPercent = Math.round(((routine.filter(r => r.completed).length + Object.values(checklist).filter(v => typeof v === 'boolean' && v).length) / (routine.length + 4)) * 100);

  return (
    <div className="p-5 md:p-10 space-y-10 animate-in fade-in duration-700 pb-32">
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
              <p className="text-zinc-400 mt-1 font-bold italic text-sm md:text-base">You've reached <span className="text-orange-400">{progressPercent}%</span> of your goals today.</p>
            </div>
          </div>
          <div className="bg-zinc-900/80 p-3 md:p-4 rounded-2xl backdrop-blur-xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform hidden md:block">
             <i className="fa-solid fa-sparkles text-orange-500 text-3xl animate-pulse"></i>
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 relative z-10">
          <div className="flex justify-between items-end mb-3 px-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Daily Milestone</span>
             <span className="text-3xl font-black text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">{progressPercent}%</span>
          </div>
          <div className="bg-zinc-900 h-6 md:h-8 rounded-full overflow-hidden p-1 border border-zinc-800">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(249,115,22,0.8)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Routine & Stickers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Daily Routine</h3>
            <button 
              onClick={() => setShowAddRoutine(!showAddRoutine)}
              className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:scale-110 shadow-[0_8px_20px_rgba(249,115,22,0.4)] active:rotate-12 transition-all"
            >
              <i className={`fa-solid ${showAddRoutine ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
            </button>
          </div>

          <div className="space-y-4">
            {routine.map((item, idx) => (
              <div key={item.id} className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`flex items-center gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] border-2 transition-all duration-300 ${item.completed ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent opacity-60' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-lg hover:scale-[1.01]'}`}>
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-sm ${item.category === 'Food' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <i className={`fa-solid ${item.category === 'Food' ? 'fa-bowl-food' : 'fa-dog'}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{item.time}</p>
                    <h4 className={`text-lg md:text-xl font-bold mt-1 ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{item.title}</h4>
                  </div>
                  <button onClick={() => toggleRoutine(item.id)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border-4 ${item.completed ? 'bg-emerald-500 border-white dark:border-zinc-800 text-white shadow-xl rotate-[360deg]' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent'}`}>
                    <i className="fa-solid fa-check text-sm md:text-base"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Daily Stickers</h3>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <CheckTile active={checklist.food} icon="bowl-food" label="Full Tummy" onClick={() => toggleCheck('food')} color="orange" />
            <CheckTile active={checklist.water} icon="faucet-drip" label="Hydrated" onClick={() => toggleCheck('water')} color="blue" />
            <CheckTile active={checklist.walk} icon="dog" label="Adventures" onClick={() => toggleCheck('walk')} color="emerald" />
            <CheckTile active={checklist.medication} icon="pills" label="Healthy Meds" onClick={() => toggleCheck('medication')} color="purple" />
          </div>
        </section>
      </div>

      {/* Routine Modal - Frosted */}
      {showAddRoutine && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-800/50 w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-lobster text-2xl text-orange-600 dark:text-orange-400">Add Step</h4>
              <button onClick={() => setShowAddRoutine(false)} className="w-9 h-9 bg-white/50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="time" className="w-full p-3.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border-none outline-none font-bold dark:text-white" value={newRoutine.time} onChange={e => setNewRoutine({...newRoutine, time: e.target.value})} />
              <select className="w-full p-3.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border-none outline-none font-bold dark:text-white" value={newRoutine.category} onChange={e => setNewRoutine({...newRoutine, category: e.target.value as any})}>
                <option value="Food">Food 🍖</option>
                <option value="Walk">Walk 🦮</option>
                <option value="Medication">Meds 💊</option>
                <option value="Play">Play 🎾</option>
              </select>
            </div>
            <input type="text" placeholder="Task description..." className="w-full p-3.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border-none outline-none font-bold dark:text-white shadow-inner" value={newRoutine.title} onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} />
            <button onClick={handleAddRoutine} className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:brightness-110 active:scale-95 transition-all">Create Goal</button>
          </div>
        </div>
      )}

      {/* Next Up Reminders */}
      <section className="space-y-6 pb-12">
        <h3 className="text-2xl md:text-3xl font-lobster text-zinc-900 dark:text-zinc-50 px-2">Next Up</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reminders.filter(r => !r.completed).slice(0, 4).map(reminder => (
            <div key={reminder.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[2rem] shadow-lg flex items-center gap-4 hover:border-orange-200 dark:hover:border-zinc-700 transition-all group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${reminder.type === 'Vaccination' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                <i className={`fa-solid ${reminder.type === 'Vaccination' ? 'fa-syringe' : 'fa-pills'}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base truncate group-hover:text-orange-500 transition-colors">{reminder.title}</h4>
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-1">{new Date(reminder.date).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => onCompleteReminder(reminder.id)}
                className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-zinc-100 dark:border-zinc-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95"
              >
                Mark Done
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CheckTile: React.FC<{ 
  active: boolean, icon: string, label: string, onClick: () => void, color: string
}> = ({ active, icon, label, onClick, color }) => {
  const colorMap: any = {
    orange: 'bg-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.4)]',
    blue: 'bg-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.4)]',
    emerald: 'bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.4)]',
    purple: 'bg-purple-500 shadow-[0_10px_30px_rgba(168,85,247,0.4)]',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-4 p-8 md:p-10 rounded-[2.5rem] border-4 transition-all duration-500 relative overflow-hidden group ${
        active 
          ? `${colorMap[color]} text-white border-white dark:border-zinc-800 scale-[0.98]` 
          : 'bg-white dark:bg-zinc-900 border-zinc-50 dark:border-zinc-800 shadow-lg hover:scale-[1.05]'
      }`}
    >
      <div className={`text-4xl md:text-5xl transition-all duration-500 ${active ? 'text-white scale-125 drop-shadow-lg' : 'text-zinc-200 dark:text-zinc-800'}`}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <span className={`font-black text-[9px] md:text-[10px] uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{label}</span>
      {active && (
        <div className="absolute top-4 right-4 bg-white text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
          <i className="fa-solid fa-check font-black text-xs"></i>
        </div>
      )}
    </button>
  );
};

export default Dashboard;
