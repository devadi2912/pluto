
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

  const routineTotal = routine.length;
  const routineDone = routine.filter(r => r.completed).length;
  const stickerTotal = 4;
  const stickerDone = Object.values(checklist).filter(v => typeof v === 'boolean' && v).length;
  
  const totalPossible = routineTotal + stickerTotal;
  const totalDone = routineDone + stickerDone;
  const progressPercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = new Date().getDay();

  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 1. Hero Card - Rich but Simple Colors */}
      <section className="bg-gradient-to-br from-orange-500 to-rose-500 dark:from-zinc-900 dark:to-zinc-950 rounded-[2.5rem] p-8 text-white dark:text-zinc-50 shadow-xl relative overflow-hidden group border dark:border-zinc-800">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 dark:bg-orange-500/5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-3xl font-bold font-lobster tracking-wide">Hi, {pet.name}'s Family!</h2>
            <p className="text-white/90 dark:text-zinc-400 mt-1 font-bold italic text-sm">Target: 100% Care Today!</p>
          </div>
          <div className="bg-white/20 dark:bg-zinc-800 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/20 dark:border-zinc-700">
             <i className="fa-solid fa-sparkles text-yellow-300 dark:text-orange-400 text-2xl animate-pulse"></i>
          </div>
        </div>
        
        <div className="mt-10 relative z-10">
          <div className="flex justify-between items-end mb-3 px-1">
             <span className="text-[11px] font-black uppercase tracking-widest text-white/90 dark:text-zinc-400">Daily Milestone</span>
             <span className="text-3xl font-black">{progressPercent}%</span>
          </div>
          <div className="bg-black/20 dark:bg-zinc-800 h-6 rounded-full overflow-hidden p-1 backdrop-blur-sm border border-white/10 dark:border-zinc-700">
            <div 
              className="h-full bg-white dark:bg-orange-500 rounded-full transition-all duration-1000 ease-out shadow-lg" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* 2. Daily Routine Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50">Daily Routine</h3>
          <button 
            onClick={() => setShowAddRoutine(!showAddRoutine)}
            className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:rotate-12"
          >
            <i className={`fa-solid ${showAddRoutine ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
          </button>
        </div>

        {showAddRoutine && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border-4 border-orange-50 dark:border-zinc-800 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <h4 className="font-lobster text-2xl text-orange-600 dark:text-orange-400">New Routine</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Time</label>
                <input 
                  type="time" 
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-sm dark:text-white"
                  value={newRoutine.time}
                  onChange={e => setNewRoutine({...newRoutine, time: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Type</label>
                <select 
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-sm dark:text-white"
                  value={newRoutine.category}
                  onChange={e => setNewRoutine({...newRoutine, category: e.target.value as any})}
                >
                  <option value="Food">Food 🍖</option>
                  <option value="Walk">Walk 🦮</option>
                  <option value="Play">Play 🎾</option>
                  <option value="Medication">Meds 💊</option>
                  <option value="Sleep">Sleep 😴</option>
                  <option value="Other">Other ✨</option>
                </select>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Description..."
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-sm dark:text-white shadow-inner"
              value={newRoutine.title}
              onChange={e => setNewRoutine({...newRoutine, title: e.target.value})}
            />
            <button 
              onClick={handleAddRoutine}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:brightness-110"
            >
              Add Routine
            </button>
          </div>
        )}

        <div className="space-y-3">
          {routine.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center gap-5 p-5 rounded-[2rem] border-2 transition-all ${
                item.completed 
                  ? 'bg-zinc-50 dark:bg-zinc-900 border-transparent opacity-50' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-md hover:border-orange-200 dark:hover:border-zinc-700'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                item.category === 'Food' ? 'bg-orange-50 text-orange-600' :
                item.category === 'Walk' ? 'bg-emerald-50 text-emerald-600' :
                item.category === 'Medication' ? 'bg-rose-50 text-rose-600' :
                item.category === 'Play' ? 'bg-purple-50 text-purple-600' :
                item.category === 'Sleep' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-600'
              }`}>
                <i className={`fa-solid ${
                  item.category === 'Food' ? 'fa-bowl-food' :
                  item.category === 'Walk' ? 'fa-dog' :
                  item.category === 'Medication' ? 'fa-pills' :
                  item.category === 'Play' ? 'fa-basketball' :
                  item.category === 'Sleep' ? 'fa-moon' : 'fa-star'
                }`}></i>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.time}</p>
                <h4 className={`text-lg font-bold mt-0.5 ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {item.title}
                </h4>
              </div>
              <button 
                onClick={() => toggleRoutine(item.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-4 ${
                  item.completed 
                    ? 'bg-emerald-500 border-white dark:border-zinc-800 text-white scale-110 shadow-lg' 
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent hover:border-orange-500 active:scale-90'
                }`}
              >
                <i className="fa-solid fa-check text-lg"></i>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Daily Sticker Chart */}
      <section>
        <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 mb-4 px-2">Daily Stickers</h3>
        <div className="grid grid-cols-2 gap-5">
          <CheckTile active={checklist.food} icon="bowl-food" label="Full Tummy" onClick={() => toggleCheck('food')} color="orange" />
          <CheckTile active={checklist.water} icon="faucet-drip" label="Hydrated" onClick={() => toggleCheck('water')} color="blue" />
          <CheckTile active={checklist.walk} icon="dog" label="Adventures" onClick={() => toggleCheck('walk')} color="emerald" />
          <CheckTile active={checklist.medication} icon="pills" label="Healthy Meds" onClick={() => toggleCheck('medication')} color="purple" />
        </div>
      </section>

      {/* 4. Weekly Tracker */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50">Pulse Tracker</h3>
          <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-full uppercase tracking-widest border border-zinc-200 dark:border-zinc-800">February</span>
        </div>
        <div className="flex justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-lg">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <span className={`text-[10px] font-black tracking-widest uppercase ${idx === todayIndex ? 'text-orange-500' : 'text-zinc-400'}`}>{day}</span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                idx === todayIndex 
                  ? 'bg-orange-500 text-white shadow-lg rotate-3 scale-110' 
                  : (idx < todayIndex ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-900' : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-300 dark:text-zinc-700')
              }`}>
                {idx < todayIndex ? <i className="fa-solid fa-circle-check text-base"></i> : 12 + idx}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Upcoming Reminders - Prominent Hover Animation */}
      <section>
        <h3 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 mb-4 px-2">Coming Up Next</h3>
        <div className="space-y-4">
          {reminders.filter(r => !r.completed).slice(0, 2).map(reminder => (
            <div key={reminder.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-md flex items-center gap-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-orange-100 dark:hover:border-orange-500/50 dark:hover:bg-zinc-800 animate-in slide-in-from-right">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:rotate-6 ${
                reminder.type === 'Vaccination' ? 'bg-orange-50 text-orange-600' :
                reminder.type === 'Medication' ? 'bg-purple-50 text-purple-600' : 
                'bg-emerald-50 text-emerald-600'
              }`}>
                <i className={`fa-solid ${
                  reminder.type === 'Vaccination' ? 'fa-syringe' :
                  reminder.type === 'Medication' ? 'fa-pills' : 'fa-calendar-check'
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg leading-tight truncate transition-colors group-hover:text-orange-500 dark:group-hover:text-orange-400">{reminder.title}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">
                  {new Date(reminder.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => onCompleteReminder(reminder.id)}
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-600 active:scale-95 uppercase tracking-widest"
              >
                MARK DONE
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CheckTile: React.FC<{ 
  active: boolean, 
  icon: string, 
  label: string, 
  onClick: () => void,
  color: 'orange' | 'blue' | 'emerald' | 'purple'
}> = ({ active, icon, label, onClick, color }) => {
  const colorMap = {
    orange: 'bg-orange-500 shadow-orange-500/30',
    blue: 'bg-blue-500 shadow-blue-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    purple: 'bg-purple-500 shadow-purple-500/30',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all duration-500 relative overflow-hidden group ${
        active 
          ? `${colorMap[color]} text-white border-white dark:border-zinc-800 shadow-xl scale-[0.96]` 
          : 'bg-white dark:bg-zinc-900 border-zinc-50 dark:border-zinc-800 shadow-md hover:scale-[1.05]'
      }`}
    >
      <div className={`text-4xl transition-all duration-500 ${active ? 'text-white scale-125' : 'text-zinc-200 dark:text-zinc-800'}`}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <span className={`font-black text-[11px] uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>{label}</span>
      {active && (
        <div className="absolute top-4 right-4 bg-white text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
          <i className="fa-solid fa-check text-sm font-black"></i>
        </div>
      )}
    </button>
  );
};

export default Dashboard;
