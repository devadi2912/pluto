
import React, { useState } from 'react';
import { TimelineEntry, EntryType, PetDocument, Reminder, Doctor, DailyLog } from '../types';

interface TimelineProps {
  timeline: TimelineEntry[];
  setTimeline: (t: TimelineEntry[] | ((prev: TimelineEntry[]) => TimelineEntry[])) => void;
  documents: PetDocument[];
  reminders: Reminder[];
  setReminders: (r: Reminder[] | ((prev: Reminder[]) => Reminder[])) => void;
  dailyLogs: Record<string, DailyLog>;
  onUpdateLog: (date: string, data: Partial<DailyLog>) => void;
  petName?: string;
  readOnly?: boolean;
}

const MOCK_CONSULTED_DOCTORS: Doctor[] = [
  { 
    id: 'DOC-SMITH-45', 
    name: 'Dr. Sarah Smith', 
    specialization: 'Cardiology Specialist', 
    qualification: 'DVM, PhD Cardiology',
    registrationId: 'VET-TX-99881',
    experience: '12 Years',
    clinic: 'Green Valley Clinic', 
    address: '123 Pawsome Way, Austin, TX',
    contact: '555-0102',
    // Added missing required properties
    emergencyContact: '555-0191',
    consultationHours: '08:00 - 18:00',
    medicalFocus: 'Cardiac surgery and heart murmurs'
  },
  { 
    id: 'DOC-WONG-99', 
    name: 'Dr. Mike Wong', 
    specialization: 'Dental Vet', 
    qualification: 'DVM, DDSV',
    registrationId: 'VET-TX-11223',
    experience: '8 Years',
    clinic: 'Smile Pet Center', 
    address: '88 Bark Blvd, Austin, TX',
    contact: '555-0199',
    // Added missing required properties
    emergencyContact: '555-0192',
    consultationHours: '09:00 - 17:00',
    medicalFocus: 'Canine orthodontics and periodontics'
  }
];

const TimelineScreen: React.FC<TimelineProps> = ({ 
  timeline, 
  setTimeline, 
  documents, 
  reminders, 
  setReminders,
  petName = "Luna",
  readOnly = false
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // States for editing
  const [editingItem, setEditingItem] = useState<{ item: any, mode: 'journal' | 'planned' } | null>(null);

  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '' });
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });

  const handleAdd = () => {
    if (newEntry.title && newEntry.date && newEntry.type && !readOnly) {
      const entry: TimelineEntry = {
        id: Date.now().toString(),
        date: newEntry.date as string,
        type: newEntry.type as EntryType,
        title: newEntry.title as string,
        notes: newEntry.notes,
        documentId: newEntry.documentId
      };
      setTimeline(prev => [entry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowAdd(false);
      setNewEntry({ type: EntryType.Note, date: new Date().toISOString().split('T')[0], title: '' });
    }
  };

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.date && newReminder.type && !readOnly) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title as string,
        date: newReminder.date as string,
        type: newReminder.type as any,
        completed: false
      };
      setReminders(prev => [...prev, reminder].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowAddReminder(false);
      setNewReminder({ type: 'Medication', date: new Date().toISOString().split('T')[0], title: '' });
    }
  };

  const handleUpdateItem = () => {
    if (!editingItem || readOnly) return;
    const { item, mode } = editingItem;

    if (mode === 'journal') {
      setTimeline(prev => 
        prev.map(e => e.id === item.id ? item : e)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } else {
      setReminders(prev => 
        prev.map(r => r.id === item.id ? item : r)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
    }
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    if (!editingItem || readOnly) return;
    const { item, mode } = editingItem;

    if (window.confirm(`Are you sure you want to delete this ${mode === 'journal' ? 'entry' : 'reminder'}?`)) {
      if (mode === 'journal') {
        setTimeline(prev => prev.filter(e => e.id !== item.id));
      } else {
        setReminders(prev => prev.filter(r => r.id !== item.id));
      }
      setEditingItem(null);
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
    <div className="p-8 md:p-12 space-y-16 animate-in slide-in-from-right-10 duration-700 pb-32 no-scrollbar overflow-y-auto h-full">
      
      {/* Planned Care */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-lobster text-orange-600 dark:text-orange-400">Planned Care</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Scheduled reminders</p>
          </div>
          {!readOnly && (
            <button 
              onClick={() => setShowAddReminder(!showAddReminder)}
              className="w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:rotate-45"
            >
              <i className={`fa-solid ${showAddReminder ? 'fa-xmark' : 'fa-calendar-plus'} text-2xl`}></i>
            </button>
          )}
        </div>

        {showAddReminder && !readOnly && (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-4 border-orange-50 dark:border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <h4 className="font-lobster text-3xl text-orange-600 dark:text-orange-400">Schedule Task</h4>
            <div className="grid grid-cols-2 gap-6">
              <input type="date" className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" value={newReminder.date} onChange={e => setNewReminder({...newReminder, date: e.target.value})} />
              <select className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" value={newReminder.type} onChange={e => setNewReminder({...newReminder, type: e.target.value as any})}>
                <option value="Medication">Medication</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Vet follow-up">Vet follow-up</option>
              </select>
            </div>
            <input type="text" placeholder="Task description..." className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white shadow-inner" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} />
            <button onClick={handleAddReminder} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Schedule</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminders.filter(r => !r.completed).map(r => (
            <div 
              key={r.id} 
              onClick={() => !readOnly && setEditingItem({ item: { ...r }, mode: 'planned' })}
              className="bg-orange-50/70 dark:bg-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/20 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer"
            >
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

      {/* Care Journal */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-12 px-2">
          <div>
            <h2 className="text-4xl font-lobster text-emerald-600 dark:text-emerald-400">Care Journal</h2>
            <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Health history & milestones</p>
          </div>
          {!readOnly && (
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:rotate-45"
            >
              <i className={`fa-solid ${showAdd ? 'fa-xmark' : 'fa-plus'} text-2xl`}></i>
            </button>
          )}
        </div>

        {showAdd && !readOnly && (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-4 border-emerald-50 dark:border-zinc-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <h4 className="font-lobster text-3xl text-emerald-600 dark:text-emerald-400">Add History</h4>
            <div className="grid grid-cols-2 gap-6">
              <input type="date" className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
              <select className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.type} onChange={e => setNewEntry({...newEntry, type: e.target.value as EntryType})}>
                {Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Title for this record..." className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
            <button onClick={handleAdd} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">Save Memory</button>
          </div>
        )}

        <div className="relative pl-12 md:pl-20 space-y-12 before:content-[''] before:absolute before:left-[23px] md:before:left-[31px] before:top-4 before:bottom-4 before:w-1.5 before:bg-zinc-100 dark:before:bg-zinc-800 before:rounded-full">
          {timeline.map((entry, idx) => (
            <div 
              key={entry.id} 
              onClick={() => !readOnly && setEditingItem({ item: { ...entry }, mode: 'journal' })}
              className="relative group animate-in slide-in-from-left-5 duration-500 cursor-pointer" 
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute -left-[45px] md:-left-[53px] top-4 w-14 h-14 rounded-3xl border-[8px] border-white dark:border-zinc-950 shadow-2xl flex items-center justify-center z-10 transition-all group-hover:scale-110 ${getColor(entry.type)} text-white`}>
                <i className={`fa-solid ${getIcon(entry.type)} text-xl`}></i>
              </div>
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 p-8 rounded-[3rem] shadow-xl group-hover:shadow-2xl group-hover:border-emerald-100 transition-all max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest text-white px-4 py-1.5 rounded-full ${getColor(entry.type)} shadow-sm`}>
                    {entry.type}
                  </span>
                  <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-600">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-2xl font-bold font-lobster text-zinc-900 dark:text-zinc-100 mb-2">{entry.title}</h4>
                {entry.notes && <p className="text-base text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed">{entry.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Popup Modal */}
      {editingItem && !readOnly && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setEditingItem(null)}
        >
          <div 
            className="bg-white/95 dark:bg-zinc-950/90 backdrop-blur-[40px] w-full max-w-md rounded-[3rem] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-white dark:border-zinc-800 animate-in zoom-in-95 duration-300 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-lobster text-zinc-950 dark:text-zinc-50">Modify {editingItem.mode === 'journal' ? 'Entry' : 'Task'}</h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" 
                    value={editingItem.item.date} 
                    onChange={e => setEditingItem({ ...editingItem, item: { ...editingItem.item, date: e.target.value } })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                  {editingItem.mode === 'journal' ? (
                    <select 
                      className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white" 
                      value={editingItem.item.type} 
                      onChange={e => setEditingItem({ ...editingItem, item: { ...editingItem.item, type: e.target.value } })}
                    >
                      {Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <select 
                      className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" 
                      value={editingItem.item.type} 
                      onChange={e => setEditingItem({ ...editingItem, item: { ...editingItem.item, type: e.target.value } })}
                    >
                      <option value="Medication">Medication</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Vet follow-up">Vet follow-up</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="What happened?" 
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-200 outline-none font-bold text-zinc-900 dark:text-white" 
                  value={editingItem.item.title} 
                  onChange={e => setEditingItem({ ...editingItem, item: { ...editingItem.item, title: e.target.value } })} 
                />
              </div>

              {editingItem.mode === 'journal' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Notes</label>
                  <textarea 
                    placeholder="Add more details..." 
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-200 outline-none font-bold text-zinc-900 dark:text-white h-24" 
                    value={editingItem.item.notes || ''} 
                    onChange={e => setEditingItem({ ...editingItem, item: { ...editingItem.item, notes: e.target.value } })} 
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleDeleteItem}
                className="w-full py-4 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-600 hover:text-white transition-all active:scale-95"
              >
                Delete
              </button>
              <button 
                onClick={handleUpdateItem}
                className="w-full py-4 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Consulted Section */}
      <section className="space-y-8 pt-12 border-t border-zinc-100 dark:border-zinc-800 pb-20">
        <div className="px-2">
          <h2 className="text-4xl font-lobster text-indigo-600 dark:text-indigo-400 tracking-wide">Doctors Consulted</h2>
          <p className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mt-1">Medical professional access history</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CONSULTED_DOCTORS.map(doc => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoctor(doc)}
              className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-6 hover:border-indigo-200 dark:hover:border-indigo-900 cursor-pointer transition-all shadow-sm group active:scale-[0.98] animate-in fade-in"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform shadow-sm">
                <i className="fa-solid fa-user-md"></i>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-zinc-900 dark:text-zinc-200">{doc.name}</h5>
                <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">{doc.specialization}</p>
              </div>
              <i className="fa-solid fa-chevron-right text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-400 transition-colors"></i>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Modal - Frosted effect with High Contrast Text */}
      {selectedDoctor && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/30 animate-in fade-in duration-500"
          onClick={() => setSelectedDoctor(null)}
        >
          <div 
            className="bg-white/95 dark:bg-zinc-950/90 backdrop-blur-[40px] backdrop-saturate-150 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.4)] border border-white dark:border-zinc-800 animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle light leak for glass effect */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
            
            <div className="p-10 text-center space-y-6 relative z-10">
              <div className="w-24 h-24 bg-indigo-500 text-white rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl rotate-3 border-4 border-white/20">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <div>
                <h3 className="text-4xl font-lobster text-zinc-950 dark:text-zinc-50 leading-tight">{selectedDoctor.name}</h3>
                <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.25em] mt-1">{selectedDoctor.specialization}</p>
              </div>
              
              <div className="space-y-4 text-left border-t border-zinc-200 dark:border-zinc-800 pt-6">
                 <div className="flex justify-between items-center">
                   <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Clinic</span>
                   <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedDoctor.clinic}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Experience</span>
                   <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedDoctor.experience}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Contact</span>
                   <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedDoctor.contact}</span>
                 </div>
              </div>
              
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black py-6 rounded-3xl shadow-2xl backdrop-blur-md uppercase tracking-[0.3em] hover:scale-[1.02] transition-all active:scale-95 border border-white/10"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineScreen;
