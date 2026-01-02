
import React, { useState, useEffect } from 'react';
import { TimelineEntry, EntryType, PetDocument, Reminder, Doctor, DailyLog, DoctorNote } from '../types';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';

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
  onDeleteTimelineEntry?: (id: string) => Promise<void>;
  onDeleteReminder?: (id: string) => Promise<void>;
  consultedDoctors?: Doctor[];
  petId?: string;
  readOnly?: boolean;
  lastVisit?: { date: string; id: string } | null;
}

const TimelineScreen: React.FC<TimelineProps> = ({ 
  timeline, 
  setTimeline, 
  reminders, 
  setReminders,
  petName = "Luna",
  doctorNotes = [],
  onDeleteNote,
  onDeleteTimelineEntry,
  onDeleteReminder,
  consultedDoctors = [],
  petId,
  readOnly = false,
  lastVisit
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: any, mode: 'journal' | 'planned' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '', notes: '' });
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });

  useEffect(() => {
    if (editingItem) {
      setEditFormData({ ...editingItem.item });
      setIsEditingForm(false);
    }
  }, [editingItem]);

  const handleAdd = async () => {
    const uid = auth.currentUser?.uid;
    if (newEntry.title && newEntry.date && newEntry.type && !readOnly && uid) {
      const saved = await api.addTimelineEntry(uid, newEntry);
      setTimeline(prev => [saved, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowAdd(false);
      setNewEntry({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '', notes: '' });
    }
  };

  const handleAddReminder = async () => {
    const uid = auth.currentUser?.uid;
    if (newReminder.title && newReminder.date && newReminder.type && !readOnly && uid) {
      const saved = await api.addReminder(uid, newReminder);
      setReminders(prev => [...prev, saved].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowAddReminder(false);
      setNewReminder({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });
    }
  };

  const handleDeleteItem = async () => {
    if (!editingItem || readOnly || isDeleting) return;

    const itemId = editingItem.item.id;
    setIsDeleting(true);

    try {
      if (editingItem.mode === 'planned') {
        if (onDeleteReminder) await onDeleteReminder(itemId);
      } else {
        if (onDeleteTimelineEntry) await onDeleteTimelineEntry(itemId);
      }
      setEditingItem(null);
    } catch (error) {
      console.error("[UI] Delete failed:", error);
      alert("Failed to remove item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    const uid = auth.currentUser?.uid;
    if (!editingItem || !uid || isSaving) return;

    setIsSaving(true);
    try {
      if (editingItem.mode === 'planned') {
        await api.updateReminder(uid, editingItem.item.id, editFormData);
        setReminders(prev => prev.map(r => r.id === editingItem.item.id ? { ...r, ...editFormData } : r));
      } else {
        await api.updateTimelineEntry(uid, editingItem.item.id, editFormData);
        setTimeline(prev => prev.map(e => e.id === editingItem.item.id ? { ...e, ...editFormData } : e));
      }
      setEditingItem(null);
    } catch (error) {
      console.error("[UI] Update failed:", error);
      alert("Failed to update item.");
    } finally {
      setIsSaving(false);
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
            <div key={r.id} onClick={() => !readOnly && setEditingItem({ item: { ...r }, mode: 'planned' })} className="bg-orange-50/70 dark:bg-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/20 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer">
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
            <textarea placeholder="Additional notes..." className="w-full p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white h-24 resize-none" value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} />
            <button onClick={handleAdd} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Save Memory</button>
          </div>
        )}

        <div className="relative pl-12 md:pl-20 space-y-12 before:content-[''] before:absolute before:left-[23px] md:before:left-[31px] before:top-4 before:bottom-4 before:w-1.5 before:bg-zinc-100 dark:before:bg-zinc-800 before:rounded-full">
          {timeline.map((entry, idx) => (
            <div key={entry.id} onClick={() => !readOnly && setEditingItem({ item: { ...entry }, mode: 'journal' })} className="relative group animate-in slide-in-from-left-5 duration-500 cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
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

      {/* 3. Clinical Notes Section */}
      <section className="space-y-6 pt-12 border-t border-zinc-100 dark:border-zinc-800">
         <div className="px-2">
            <h2 className="text-4xl font-lobster text-indigo-600 dark:text-indigo-400">Clinical Notes</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Official Veterinary Logs</p>
         </div>

         <div className="space-y-4">
            {doctorNotes && doctorNotes.length > 0 ? doctorNotes.map(note => (
               <div key={note.id} className="bg-indigo-50/60 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 group relative transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                          <i className="fa-solid fa-user-md"></i>
                       </div>
                       <div>
                          <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{note.doctorName}</h5>
                          <p className="text-[10px] font-black uppercase text-zinc-400">{new Date(note.date).toLocaleDateString()} • {new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                    </div>
                    {!readOnly && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteNote) onDeleteNote(note.id);
                        }}
                        className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-rose-500/30 hover:-translate-y-1 active:scale-95 transition-all opacity-60 hover:opacity-100"
                        title="Delete Note"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic leading-relaxed">"{note.content}"</p>
               </div>
            )) : (
               <div className="w-full py-10 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-zinc-400">
                  <i className="fa-solid fa-file-medical text-4xl mb-3 opacity-30"></i>
                  <p className="text-xs font-bold">No clinical notes recorded.</p>
               </div>
            )}
         </div>
      </section>

      {/* 4. Doctor Visit Section */}
      <section className="space-y-6 pt-12 border-t border-zinc-100 dark:border-zinc-800">
         <div className="px-2">
            <h2 className="text-4xl font-lobster text-rose-500 dark:text-rose-400">Doctor Visit</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Professionals who accessed these records</p>
         </div>

         {/* Simplified Last Visit Insight Card */}
         {lastVisit && (
            <div className="px-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border-4 border-white dark:border-zinc-800 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-rose-200 dark:hover:border-rose-900/30 group cursor-default">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform">
                          <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-lobster leading-tight">
                              {new Date(lastVisit.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <i className="fa-regular fa-clock mr-2 opacity-60"></i>
                              {new Date(lastVisit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 px-5 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Doctor ID</p>
                        <p className="font-mono font-bold text-rose-500 text-sm tracking-wide">{lastVisit.id}</p>
                    </div>
                  </div>
              </div>
            </div>
          )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultedDoctors && consultedDoctors.length > 0 ? consultedDoctors.map(doctor => (
               <div key={doctor.id} className="bg-rose-50/50 dark:bg-rose-950/10 border-2 border-rose-100/50 dark:border-rose-900/20 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-user-doctor"></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-zinc-950 dark:text-zinc-200">{doctor.name}</h5>
                    <p className="text-[11px] font-black text-rose-700 dark:text-rose-500 uppercase tracking-widest mt-1">{doctor.clinic} • {doctor.specialization}</p>
                  </div>
               </div>
            )) : (
              !lastVisit && (
                <div className="md:col-span-2 py-10 text-center border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-zinc-400">
                    <i className="fa-solid fa-users-medical text-4xl mb-3 opacity-30"></i>
                    <p className="text-xs font-bold">No verified medical visits yet.</p>
                 </div>
              )
            )}
         </div>
      </section>

      {editingItem && !readOnly && editFormData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300" onClick={() => !isDeleting && !isSaving && setEditingItem(null)}>
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-4 border-white dark:border-zinc-950 animate-in zoom-in-95 duration-300 space-y-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50">{isEditingForm ? 'Edit Record' : `Modify ${editingItem.mode === 'journal' ? 'Entry' : 'Task'}`}</h3>
              <button onClick={() => !isDeleting && !isSaving && setEditingItem(null)} disabled={isDeleting || isSaving} className="w-10 h-10 bg-white/50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:text-rose-500 transition-colors disabled:opacity-50">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                     {isEditingForm ? (
                       <input type="date" className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} />
                     ) : (
                       <p className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent font-bold text-zinc-900 dark:text-zinc-100 text-sm">{editingItem.item.date}</p>
                     )}
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                     {isEditingForm ? (
                       <select className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editFormData.type} onChange={e => setEditFormData({...editFormData, type: e.target.value})}>
                         {editingItem.mode === 'journal' 
                            ? Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>)
                            : ['Medication', 'Vaccination', 'Vet follow-up'].map(t => <option key={t} value={t}>{t}</option>)
                         }
                       </select>
                     ) : (
                       <p className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent font-bold text-zinc-900 dark:text-zinc-100 text-sm">{editingItem.item.type}</p>
                     )}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                  {isEditingForm ? (
                    <input type="text" className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
                  ) : (
                    <p className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent font-bold text-zinc-900 dark:text-zinc-100 text-sm">{editingItem.item.title}</p>
                  )}
               </div>
               {editingItem.mode === 'journal' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Notes</label>
                    {isEditingForm ? (
                      <textarea className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm h-24 resize-none" value={editFormData.notes} onChange={e => setEditFormData({...editFormData, notes: e.target.value})} />
                    ) : (
                      <p className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-transparent font-bold text-zinc-900 dark:text-zinc-100 text-sm min-h-[4rem]">{editingItem.item.notes || 'No notes added.'}</p>
                    )}
                 </div>
               )}
            </div>

            <div className="pt-2">
              {isEditingForm ? (
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveEdit} 
                    disabled={isSaving}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setIsEditingForm(false)} 
                    disabled={isSaving}
                    className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-[0_10px_30px_rgba(161,161,170,0.2)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingForm(true)} 
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDeleteItem} 
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:brightness-110 shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_35px_rgba(244,63,94,0.5)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isDeleting ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineScreen;
