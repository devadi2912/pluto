
import React, { useState } from 'react';
import { TimelineEntry, EntryType, PetDocument, Reminder, Doctor, DailyLog, DoctorNote } from '../types';
import { api } from '../lib/api';

interface TimelineProps {
  timeline: TimelineEntry[];
  setTimeline: (t: TimelineEntry[] | ((prev: TimelineEntry[]) => TimelineEntry[])) => void;
  documents: PetDocument[];
  reminders: Reminder[];
  setReminders: (r: Reminder[] | ((prev: Reminder[]) => Reminder[])) => void;
  dailyLogs: Record<string, DailyLog>;
  onUpdateLog: (date: string, data: Partial<DailyLog>) => void;
  petName?: string;
  doctorNotes?: DoctorNote[];
  onDeleteNote?: (id: string) => void;
  consultedDoctors?: Doctor[];
  petId?: string;
  readOnly?: boolean;
}

const TimelineScreen: React.FC<TimelineProps> = ({ 
  timeline, 
  setTimeline, 
  documents, 
  reminders, 
  setReminders,
  petName = "Luna",
  doctorNotes = [],
  onDeleteNote,
  consultedDoctors = [],
  petId,
  readOnly = false
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: any, mode: 'journal' | 'planned' } | null>(null);

  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '' });
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });

  const handleAdd = async () => {
    if (newEntry.title && newEntry.date && newEntry.type && !readOnly && petId) {
      const saved = await api.addTimelineEntry(petId, newEntry);
      setTimeline(prev => [saved, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowAdd(false);
      setNewEntry({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '' });
    }
  };

  const handleAddReminder = async () => {
    if (newReminder.title && newReminder.date && newReminder.type && !readOnly && petId) {
      const saved = await api.addReminder(petId, newReminder);
      setReminders(prev => [...prev, saved].sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime()));
      setShowAddReminder(false);
      setNewReminder({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || readOnly || !petId) return;
    const { item, mode } = editingItem;
    const itemId = item.id || item._id;
    if (mode === 'journal') {
      const updated = await api.updateTimelineEntry(petId, itemId, item);
      setTimeline(prev => prev.map(e => e.id === itemId || e._id === itemId ? updated : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
       const updated = await api.updateReminder(petId, itemId, item);
       setReminders(prev => prev.map(r => r.id === itemId || r._id === itemId ? updated : r).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingItem || readOnly || !petId) return;
    const { item, mode } = editingItem;
    const itemId = item.id || item._id;
    
    if (window.confirm(`Delete this ${mode === 'journal' ? 'entry' : 'reminder'}?`)) {
      try {
        if (mode === 'journal') {
          await api.deleteTimelineEntry(petId, itemId);
          setTimeline(prev => prev.filter(e => e.id !== itemId && e._id !== itemId));
        } else {
          await api.deleteReminder(petId, itemId);
          setReminders(prev => prev.filter(r => r.id !== itemId && r._id !== itemId));
        }
        setEditingItem(null);
      } catch (err) {
        console.error("Failed to delete item:", err);
        alert("Could not delete item. Please try again.");
      }
    }
  };

  const getIcon = (type: EntryType) => {
    switch (type) {
      case EntryType.VetVisit: return 'fa-stethoscope';
      case EntryType.Vaccination: return 'fa-syringe';
      case EntryType.Medication: return 'fa-pills';
      default: return 'fa-note-sticky';
    }
  };

  const getColor = (type: EntryType) => {
    switch (type) {
      case EntryType.VetVisit: return 'bg-emerald-500';
      case EntryType.Vaccination: return 'bg-amber-400';
      case EntryType.Medication: return 'bg-rose-500';
      default: return 'bg-orange-500';
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-16 animate-in slide-in-from-right-10 duration-700 pb-60 no-scrollbar">
      {/* 1. Planned Care Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-lobster text-orange-600 dark:text-orange-400">Planned Care</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Scheduled reminders</p>
          </div>
          {!readOnly && (
            <button onClick={() => setShowAddReminder(!showAddReminder)} className="w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:rotate-45">
              <i className={`fa-solid ${showAddReminder ? 'fa-xmark' : 'fa-calendar-plus'} text-2xl`}></i>
            </button>
          )}
        </div>

        {showAddReminder && !readOnly && (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border-4 border-orange-50 dark:border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <h4 className="font-lobster text-3xl text-orange-600 dark:text-orange-400">Schedule Task</h4>
            <div className="grid grid-cols-2 gap-6">
              <input type="date" className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" value={newReminder.date} onChange={e => setNewReminder({...newReminder, date: e.target.value})} />
              <select className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" value={newReminder.type} onChange={e => setNewReminder({...newReminder, type: e.target.value as any})}>
                <option value="Medication">Medication</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Vet follow-up">Vet follow-up</option>
              </select>
            </div>
            <input type="text" placeholder="Task description..." className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white shadow-inner" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} />
            <button onClick={handleAddReminder} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Schedule</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminders.filter(r => !r.completed).map(r => (
            <div key={r.id || r._id} onClick={() => !readOnly && setEditingItem({ item: { ...r }, mode: 'planned' })} className="bg-orange-50/70 dark:bg-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/20 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                <i className={`fa-solid ${r.type === 'Medication' ? 'fa-pills' : r.type === 'Vaccination' ? 'fa-syringe' : 'fa-user-doctor'}`}></i>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-zinc-950 dark:text-zinc-200">{r.title}</h5>
                <p className="text-[11px] font-black text-orange-700 dark:text-orange-500 uppercase tracking-widest mt-1">{new Date(r.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Care Journal Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-12 px-2">
          <div>
            <h2 className="text-4xl font-lobster text-emerald-500 dark:text-emerald-400">Care Journal</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Health history & milestones</p>
          </div>
          {!readOnly && (
            <button onClick={() => setShowAdd(!showAdd)} className="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:rotate-45">
              <i className={`fa-solid ${showAdd ? 'fa-xmark' : 'fa-plus'} text-2xl`}></i>
            </button>
          )}
        </div>

        {showAdd && !readOnly && (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border-4 border-emerald-50 dark:border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <h4 className="font-lobster text-3xl text-emerald-600 dark:text-emerald-400">Add History</h4>
            <div className="grid grid-cols-2 gap-6">
              <input type="date" className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
              <select className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.type} onChange={e => setNewEntry({...newEntry, type: e.target.value as EntryType})}>
                {Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Title for this record..." className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
            <button onClick={handleAdd} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Save Memory</button>
          </div>
        )}

        <div className="relative pl-12 md:pl-20 space-y-12 before:content-[''] before:absolute before:left-[23px] md:before:left-[31px] before:top-4 before:bottom-4 before:w-1.5 before:bg-zinc-100 dark:before:bg-zinc-800 before:rounded-full">
          {timeline.map((entry, idx) => (
            <div key={entry.id || entry._id} onClick={() => !readOnly && setEditingItem({ item: { ...entry }, mode: 'journal' })} className="relative group animate-in slide-in-from-left-5 duration-500 cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`absolute -left-[45px] md:-left-[53px] top-4 w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 shadow-2xl flex items-center justify-center z-10 transition-all group-hover:scale-110 ${getColor(entry.type)} text-white`}>
                <i className={`fa-solid ${getIcon(entry.type)} text-base`}></i>
              </div>
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-50/50 dark:border-zinc-800/50 p-8 rounded-[2.5rem] shadow-xl group-hover:shadow-2xl group-hover:border-emerald-500/30 transition-all max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-white px-5 py-2 rounded-full ${getColor(entry.type)} shadow-sm`}>{entry.type}</span>
                  <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-600 tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-100 mb-2">{entry.title}</h4>
                {entry.notes && <p className="text-sm text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed">{entry.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Clinical Notes Section (New) */}
      <section className="space-y-6 pt-12 border-t border-zinc-100 dark:border-zinc-800">
         <div className="px-2">
            <h2 className="text-4xl font-lobster text-indigo-600 dark:text-indigo-400">Clinical Notes</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Official Veterinary Logs</p>
         </div>

         <div className="space-y-4">
            {doctorNotes && doctorNotes.length > 0 ? doctorNotes.map(note => (
               <div key={note.id || note._id} className="bg-indigo-50/60 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <i className="fa-solid fa-user-md"></i>
                     </div>
                     <div>
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{note.doctorName}</h5>
                        <p className="text-[10px] font-black uppercase text-zinc-400">{new Date(note.date).toLocaleDateString()} • {new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                  </div>
                  <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                     "{note.content}"
                  </p>
                  {onDeleteNote && !readOnly && (
                    <button onClick={() => onDeleteNote(note.id || note._id!)} className="mt-4 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600">Remove Note</button>
                  )}
               </div>
            )) : (
               <div className="w-full py-10 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-zinc-400">
                  <i className="fa-solid fa-file-medical text-4xl mb-3 opacity-30"></i>
                  <p className="text-xs font-bold">No clinical notes recorded.</p>
               </div>
            )}
         </div>
      </section>

      {/* 4. Care Team Section (Moved to Bottom) */}
      <section className="space-y-6 pt-12 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between px-2">
           <div>
              <h2 className="text-4xl font-lobster text-indigo-600 dark:text-indigo-400">Care Team</h2>
              <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Visited Professionals</p>
           </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 px-2">
           {consultedDoctors.length > 0 ? consultedDoctors.map(doc => (
             <div key={doc.id || doc._id} className="min-w-[280px] bg-white dark:bg-zinc-900 border-2 border-indigo-50 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center text-center group transition-all hover:scale-105 hover:shadow-xl hover:border-indigo-100">
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center text-3xl mb-4 shadow-inner">
                   <i className="fa-solid fa-user-doctor"></i>
                </div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">{doc.name}</h4>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mt-1">{doc.clinic}</p>
                <div className="mt-4 flex gap-2">
                   <button className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <i className="fa-solid fa-phone text-xs"></i>
                   </button>
                   <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 hover:border-indigo-200 transition-all flex items-center justify-center">
                      <i className="fa-solid fa-calendar-check text-xs"></i>
                   </button>
                </div>
             </div>
           )) : (
             <div className="w-full py-10 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-zinc-400">
               <i className="fa-solid fa-user-doctor text-4xl mb-3 opacity-30"></i>
               <p className="text-xs font-bold">No doctors visited yet.</p>
             </div>
           )}
        </div>
      </section>

      {editingItem && !readOnly && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300" onClick={() => setEditingItem(null)}>
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-4 border-white dark:border-zinc-950 animate-in zoom-in-95 duration-300 space-y-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">Modify {editingItem.mode === 'journal' ? 'Entry' : 'Task'}</h3>
              <button onClick={() => setEditingItem(null)} className="w-10 h-10 bg-white/50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                     <input type="date" className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-transparent focus:border-indigo-400 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editingItem.item.date} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, date: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                     <select className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-transparent focus:border-indigo-400 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editingItem.item.type} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, type: e.target.value } })}>
                        {editingItem.mode === 'journal' ? Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>) : ['Medication', 'Vaccination', 'Vet follow-up'].map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                  <input type="text" className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-transparent focus:border-indigo-400 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editingItem.item.title} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, title: e.target.value } })} />
               </div>
               {editingItem.mode === 'journal' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Notes</label>
                    <textarea className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-transparent focus:border-indigo-400 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm h-24 resize-none" value={editingItem.item.notes || ''} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, notes: e.target.value } })} />
                 </div>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={handleDeleteItem} type="button" className="w-full py-4 bg-rose-50/80 text-rose-600 dark:bg-rose-900/20 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 border-rose-100 hover:bg-rose-100 transition-colors">Delete</button>
              <button onClick={handleUpdateItem} type="button" className="w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-transform">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineScreen;
