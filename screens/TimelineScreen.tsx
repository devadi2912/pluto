
import React, { useState } from 'react';
import { TimelineEntry, EntryType, PetDocument, Reminder, Doctor } from '../types';

interface TimelineProps {
  timeline: TimelineEntry[];
  setTimeline: (t: TimelineEntry[]) => void;
  documents: PetDocument[];
  reminders: Reminder[];
  setReminders: (r: Reminder[]) => void;
  consultedDoctors?: Doctor[];
}

const TimelineScreen: React.FC<TimelineProps> = ({ timeline, setTimeline, documents, reminders, setReminders, consultedDoctors = [] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({
    type: EntryType.Note,
    date: new Date().toISOString().split('T')[0],
  });

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'Medication',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = () => {
    if (newEntry.title && newEntry.date && newEntry.type) {
      const entry: TimelineEntry = {
        id: Date.now().toString(),
        date: newEntry.date as string,
        type: newEntry.type as EntryType,
        title: newEntry.title as string,
        notes: newEntry.notes,
        documentId: newEntry.documentId
      };
      setTimeline([entry, ...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowAdd(false);
      setNewEntry({ type: EntryType.Note, date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.date && newReminder.type) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title as string,
        date: newReminder.date as string,
        type: newReminder.type as any,
        completed: false
      };
      setReminders([...reminders, reminder].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowAddReminder(false);
      setNewReminder({ type: 'Medication', date: new Date().toISOString().split('T')[0] });
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
      case EntryType.VetVisit: return 'bg-emerald-500 text-white';
      case EntryType.Vaccination: return 'bg-amber-400 text-white';
      case EntryType.Medication: return 'bg-rose-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="p-6 space-y-12 animate-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* --- Upcoming Events Section --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold font-lobster text-orange-600 dark:text-orange-400 tracking-wide">Planned Care</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Scheduled reminders</p>
          </div>
          <button 
            onClick={() => setShowAddReminder(!showAddReminder)}
            className={`w-12 h-12 bg-gradient-to-tr from-orange-400 to-rose-500 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all ${showAddReminder ? 'rotate-45' : 'hover:scale-110 active:scale-90'}`}
          >
            <i className="fa-solid fa-calendar-plus text-xl"></i>
          </button>
        </div>

        {showAddReminder && (
          <div className="bg-white dark:bg-zinc-800 rounded-[2.5rem] border-4 border-orange-50 dark:border-zinc-700 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-lobster text-orange-600 dark:text-orange-400">Schedule Task</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                    value={newReminder.type}
                    onChange={e => setNewReminder({...newReminder, type: e.target.value as any})}
                  >
                    <option value="Medication">Medication</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Vet follow-up">Vet follow-up</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1">Target Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                    value={newReminder.date}
                    onChange={e => setNewReminder({...newReminder, date: e.target.value})}
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1">Reminder Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tick & Flea Pills"
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                  value={newReminder.title || ''}
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                />
            </div>
            <button 
              onClick={handleAddReminder}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase"
            >
              Add Reminder
            </button>
          </div>
        )}

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <p className="text-center py-6 text-zinc-400 text-xs italic">No upcoming tasks scheduled.</p>
          ) : (
            reminders.filter(r => !r.completed).map(r => (
              <div key={r.id} className="flex items-center gap-4 bg-orange-50/50 dark:bg-orange-950/10 border-2 border-orange-100/50 dark:border-orange-900/20 p-4 rounded-3xl animate-in slide-in-from-left duration-300">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <i className={`fa-solid ${r.type === 'Medication' ? 'fa-pills' : r.type === 'Vaccination' ? 'fa-syringe' : 'fa-user-doctor'} text-xs`}></i>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{r.title}</h5>
                  <p className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest">{new Date(r.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- Care History Section --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-t-2 border-zinc-100 dark:border-zinc-900 pt-8">
          <div>
            <h2 className="text-3xl font-bold font-lobster text-emerald-600 dark:text-emerald-400 tracking-wide">Care Journal</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Past events & history</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className={`w-12 h-12 bg-gradient-to-tr from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all ${showAdd ? 'rotate-45' : 'hover:scale-110 active:scale-90'}`}
          >
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
        </div>

        {showAdd && (
          <div className="bg-white dark:bg-zinc-800 rounded-[2.5rem] border-4 border-emerald-50 dark:border-zinc-700 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-lobster text-gray-800 dark:text-white">New Memory</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">What happened?</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                    value={newEntry.type}
                    onChange={e => setNewEntry({...newEntry, type: e.target.value as EntryType})}
                  >
                    {Object.values(EntryType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">When?</label>
                  <input 
                    type="date" 
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                    value={newEntry.date}
                    onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vaccination time!"
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-700 border-none outline-none font-bold text-sm dark:text-white"
                  value={newEntry.title || ''}
                  onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                />
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase"
            >
              Log Event
            </button>
          </div>
        )}

        <div className="relative pl-10 space-y-10 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[4px] before:bg-emerald-50 dark:before:bg-zinc-800 before:rounded-full">
          {timeline.length === 0 ? (
            <p className="text-center py-6 text-zinc-400 text-xs italic pl-4">Your care history will appear here.</p>
          ) : (
            timeline.map((entry, idx) => {
              const doc = documents.find(d => d.id === entry.documentId);
              return (
                <div key={entry.id} className="relative group">
                  <div className={`absolute -left-[32px] top-1 w-11 h-11 rounded-full border-[6px] border-white dark:border-zinc-900 shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${getColor(entry.type)}`}>
                    <i className={`fa-solid ${getIcon(entry.type)} text-sm`}></i>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border-2 border-gray-50 dark:border-zinc-700 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-900 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest text-white px-3 py-1 rounded-full ${getColor(entry.type).split(' ')[0]}`}>
                        {entry.type}
                      </span>
                      <span className="text-xs font-black text-gray-300 dark:text-zinc-600">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-bold font-lobster text-gray-800 dark:text-gray-100 mb-2">{entry.title}</h4>
                    {entry.notes && <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">{entry.notes}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* --- Doctors Consulted Section --- */}
      <section className="space-y-6 pt-8 border-t-2 border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-3xl font-bold font-lobster text-indigo-600 dark:text-indigo-400 tracking-wide">Doctors Consulted</h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Medical access history</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {consultedDoctors.length === 0 ? (
            <p className="text-center py-6 text-zinc-400 text-xs italic">No doctors have accessed this pet yet.</p>
          ) : (
            consultedDoctors.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 p-5 rounded-[2rem] flex items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-900 cursor-pointer transition-all shadow-sm group active:scale-95"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl">
                  <i className="fa-solid fa-user-md"></i>
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-zinc-800 dark:text-zinc-200">{doc.name}</h5>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{doc.specialization}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-zinc-200 group-hover:text-indigo-400 transition-colors"></i>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Doctor Profile Modal - Enhanced with New Fields */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border-4 border-indigo-100 dark:border-zinc-800">
            <div className="p-8 text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto border-4 border-white dark:border-zinc-800 shadow-xl">
                <i className="fa-solid fa-stethoscope"></i>
              </div>
              <div>
                <h3 className="text-3xl font-lobster text-zinc-900 dark:text-zinc-50 leading-tight">{selectedDoctor.name}</h3>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em]">{selectedDoctor.specialization}</p>
              </div>
              <div className="pt-6 space-y-4 text-left border-t dark:border-zinc-800 overflow-y-auto max-h-[300px] no-scrollbar">
                <ModalInfo label="Qualification" value={selectedDoctor.qualification} />
                <ModalInfo label="Reg. ID" value={selectedDoctor.registrationId} />
                <ModalInfo label="Experience" value={selectedDoctor.experience} />
                <ModalInfo label="Clinic" value={selectedDoctor.clinic} />
                <ModalInfo label="Address" value={selectedDoctor.address} />
                <ModalInfo label="Contact" value={selectedDoctor.contact} />
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-full mt-8 bg-zinc-900 dark:bg-zinc-800 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
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

const ModalInfo: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex flex-col py-1">
    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{value}</span>
  </div>
);

export default TimelineScreen;
