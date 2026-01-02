
import React, { useState, useMemo } from 'react';
import { PetDocument } from '../types';
import { api } from '../lib/api';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<PetDocument[]>>;
  onDeleteDocument?: (id: string) => Promise<void>;
  petName?: string;
  petId?: string;
  readOnly?: boolean;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ 
  documents, 
  setDocuments, 
  onDeleteDocument,
  petName, 
  petId, 
  readOnly = false 
}) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report' | 'Note'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom Delete Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Derived data for the header stats
  const stats = useMemo(() => {
    return {
      prescriptions: documents.filter(d => d.type === 'Prescription').length,
      reports: documents.filter(d => d.type === 'Report').length,
      bills: documents.filter(d => d.type === 'Bill').length,
      total: documents.length
    };
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesFilter = filter === 'All' || d.type === filter;
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [documents, filter, searchQuery]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !petId) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const { url, fileId } = await api.uploadFile(file);
        
        const newDoc: Partial<PetDocument> = {
          name: file.name.split('.')[0],
          type: 'Report',
          date: new Date().toISOString().split('T')[0],
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          fileUrl: url,
          fileId: fileId,
          mimeType: file.type
        };

        const saved = await api.addDocument(petId, newDoc);
        setDocuments(prev => [saved, ...prev]);
      } catch (error) {
        alert("Failed to upload file. Please try again.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedDoc.name, text: selectedDoc.type, url: selectedDoc.fileUrl });
        setShareStatus('Sent');
      } catch {
        await navigator.clipboard.writeText(selectedDoc.fileUrl);
        setShareStatus('Copied');
      }
    } else {
      await navigator.clipboard.writeText(selectedDoc.fileUrl);
      setShareStatus('Copied');
    }
    setTimeout(() => setShareStatus(null), 2000);
  };

  const saveRename = async () => {
    if (!selectedDoc || !newName.trim() || !petId) return;
    const docId = selectedDoc.id;
    await api.renameDocument(petId, docId, newName);
    setDocuments(prev => prev.map(d => (d.id === docId) ? { ...d, name: newName } : d));
    setSelectedDoc(prev => prev ? { ...prev, name: newName } : null);
    setIsRenaming(false);
  };

  /**
   * Triggers the custom confirmation modal
   */
  const handleInitiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDeleteId(id);
  };

  /**
   * Executes the actual purge after user confirms in the custom popup
   */
  const executePurge = async () => {
    if (!confirmDeleteId) return;
    const targetId = confirmDeleteId;
    
    if (readOnly || !petId || !onDeleteDocument) {
      setConfirmDeleteId(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDeleteDocument(targetId);
      if (selectedDoc?.id === targetId) {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error("Shred process failed:", err);
      alert("System failure: Failed to purge record.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const getDocTypeConfig = (type: PetDocument['type']) => {
    switch (type) {
      case 'Prescription': return { icon: 'fa-prescription', color: 'rose', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', glow: 'bg-rose-500/10 dark:bg-rose-500/20' };
      case 'Bill': return { icon: 'fa-file-invoice-dollar', color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', glow: 'bg-emerald-500/10 dark:bg-emerald-500/20' };
      case 'Note': return { icon: 'fa-note-sticky', color: 'amber', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', glow: 'bg-amber-500/10 dark:bg-amber-500/20' };
      default: return { icon: 'fa-clipboard-check', color: 'indigo', gradient: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', glow: 'bg-indigo-500/10 dark:bg-indigo-500/20' };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 pb-44 overflow-x-hidden">
      
      {/* 1. Header & Stats Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-1">
             <h2 className="text-4xl md:text-5xl font-lobster text-zinc-900 dark:text-zinc-50 tracking-tight">Identity Safe</h2>
             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] ml-1">Archive {petName ? `• ${petName}` : ''}</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
             <StatMini label="Prescripts" count={stats.prescriptions} color="rose" />
             <StatMini label="Reports" count={stats.reports} color="indigo" />
             <StatMini label="Bills" count={stats.bills} color="emerald" />
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 px-2">
          <div className="flex-1 relative group">
             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                <i className="fa-solid fa-magnifying-glass"></i>
             </div>
             <input 
               type="text" 
               placeholder="Search records by name..." 
               className="w-full pl-14 pr-6 py-4 rounded-[1.75rem] bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 shadow-sm focus:border-orange-200 dark:focus:border-orange-900/40 outline-none font-bold text-sm text-zinc-800 dark:text-zinc-100 transition-all"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          {!readOnly && (
            <label className={`h-16 px-8 rounded-[1.75rem] bg-gradient-to-tr from-orange-500 to-rose-600 text-white flex items-center justify-center gap-3 cursor-pointer shadow-xl hover:scale-[1.03] active:scale-95 transition-all border-4 border-white dark:border-zinc-950 group shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <i className="fa-solid fa-cloud-arrow-up group-hover:-translate-y-1 transition-transform"></i>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">Deposit File</span>
              <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          )}
        </div>
      </section>

      {/* 2. Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
        {['All', 'Prescription', 'Report', 'Bill', 'Note'].map((f) => (
          <button 
            key={f} 
            onClick={() => setFilter(f as any)} 
            className={`
              px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2
              ${filter === f 
                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-xl scale-105 z-10' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-orange-200'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 3. The Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {filteredDocs.map((doc, idx) => {
          const config = getDocTypeConfig(doc.type);
          return (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoc(doc)} 
              className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-50 dark:border-zinc-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden animate-in zoom-in-95"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Type Accent Glow - Enhanced Background Glow */}
              <div className={`absolute -inset-2 ${config.glow} opacity-30 blur-3xl pointer-events-none transition-all duration-700 group-hover:opacity-60 group-hover:scale-125`}></div>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${config.color}-500 opacity-5 blur-3xl pointer-events-none group-hover:opacity-10`}></div>
              
              <div className="flex flex-col h-full space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                    <i className={`fa-solid ${config.icon}`}></i>
                  </div>
                  {!readOnly && (
                    <button 
                      onClick={(e) => handleInitiateDelete(e, doc.id)}
                      className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all md:opacity-0 md:group-hover:opacity-100 z-10"
                      title="Shred Record"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">{doc.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${config.bg} ${config.text}`}>
                      {doc.type}
                    </span>
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                      {new Date(doc.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-bold">{doc.fileSize}</span>
                  <div className="flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                     <span className="text-[9px] font-black uppercase tracking-widest">Inspect</span>
                     <i className="fa-solid fa-arrow-right-long text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <p className="font-lobster text-2xl">Vault Empty</p>
            <p className="text-xs font-bold uppercase tracking-widest">Try adjusting your filters or search</p>
          </div>
        )}
      </div>

      {/* 4. Document Preview Modal (Updated: Heavy Frosted Glass & Scrollable Background) */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300"
          aria-modal="true"
          role="dialog"
        >
          {/* Invisible Backdrop that allows scroll-through but blocks clicking unless specifically handled */}
          <div 
            className="absolute inset-0 bg-zinc-900/5 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => { setSelectedDoc(null); setIsRenaming(false); }}
          ></div>

          <div 
            className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-[80px] w-full max-w-[360px] rounded-[3.5rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.25)] border-[5px] border-white/30 dark:border-zinc-800/30 animate-in zoom-in-95 duration-500 pointer-events-auto relative z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-8 bg-gradient-to-br ${getDocTypeConfig(selectedDoc.type).gradient} text-white flex justify-between items-start`}>
               <div className="space-y-2">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full inline-block border border-white/20">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">{selectedDoc.type} RECORD</p>
                  </div>
                  {isRenaming ? (
                    <input 
                      autoFocus 
                      className="text-3xl font-lobster bg-transparent border-b-2 border-white/50 outline-none w-full"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={e => e.key === 'Enter' && saveRename()}
                    />
                  ) : (
                    <h3 className="text-3xl font-lobster leading-tight">"{selectedDoc.name}"</h3>
                  )}
               </div>
               <button onClick={() => setSelectedDoc(null)} className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-all">
                  <i className="fa-solid fa-xmark"></i>
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <InfoPill label="Stored On" value={new Date(selectedDoc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})} icon="calendar" />
                  <InfoPill label="File Size" value={selectedDoc.fileSize} icon="hard-drive" />
               </div>

               {selectedDoc.mimeType?.startsWith('image/') && (
                 <div className="relative group rounded-[2rem] overflow-hidden border-4 border-white/20 dark:border-zinc-800/40 shadow-lg cursor-zoom-in" onClick={() => window.open(selectedDoc.fileUrl, '_blank')}>
                    <img src={selectedDoc.fileUrl} className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">
                       Inspect Original
                    </div>
                 </div>
               )}

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
                    className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[1.75rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all"
                  >
                    <i className="fa-solid fa-file-export"></i> Open Medical File
                  </button>
                  
                  <div className="grid grid-cols-1">
                    {!readOnly && (
                      <button 
                        onClick={() => { setNewName(selectedDoc.name); setIsRenaming(true); }}
                        className="w-full py-5 bg-orange-50/60 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] border-2 border-orange-100/30 dark:border-orange-900/30 flex items-center justify-center gap-2 hover:scale-[1.02] hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95 transition-all"
                      >
                        <i className="fa-solid fa-pen text-xs"></i> Rename Record
                      </button>
                    )}
                  </div>

                  {!readOnly && (
                    <button 
                      onClick={(e) => handleInitiateDelete(e, selectedDoc.id)}
                      disabled={isDeleting}
                      className="w-full py-2 text-rose-500 font-black uppercase tracking-widest text-[9px] hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2 group/shred"
                    >
                      {isDeleting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-trash-can group-hover/shred:rotate-6"></i>}
                      {isDeleting ? 'PURGING...' : 'PERMANENTLY SHRED RECORD'}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Custom Confirmation Modal (Identity Shredder - Heavy Frosted & Scrollable) */}
      {confirmDeleteId && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300"
          aria-modal="true"
          role="alertdialog"
        >
          {/* Transparent interaction layer to close on click outside and allow scrolling */}
          <div 
            className="absolute inset-0 bg-black/5 pointer-events-auto"
            onClick={cancelDelete}
          ></div>

          <div 
            className="bg-black/30 dark:bg-black/40 backdrop-blur-[80px] w-full max-w-sm rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-4 border-zinc-800/40 space-y-8 animate-in zoom-in-95 duration-500 text-center pointer-events-auto relative z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-rose-950/40 rounded-3xl flex items-center justify-center text-rose-500 text-4xl mx-auto shadow-inner relative border border-rose-500/20">
                <i className="fa-solid fa-trash-can relative z-10 translate-y-[-2px]"></i>
                <i className="fa-solid fa-arrow-up absolute top-3 text-xs opacity-80 animate-bounce"></i>
              </div>
              <h3 className="text-3xl font-lobster text-white">Shred Record?</h3>
              <p className="text-sm font-bold text-zinc-300/80 leading-relaxed">
                This will permanently remove this medical record from the sub-collection. This action cannot be undone.
              </p>
              <div className="bg-white/5 p-3 rounded-2xl text-[9px] font-mono text-zinc-500 border border-white/5">
                REF: <span className="text-zinc-400">{confirmDeleteId}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={executePurge}
                disabled={isDeleting}
                className={`w-full py-5 bg-gradient-to-r from-[#FF4C6A] to-[#FF3E5D] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-[0_10px_25px_rgba(255,76,106,0.3)] hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none ${isDeleting ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isDeleting ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-fire-flame-curved text-xs"></i>
                )}
                {isDeleting ? 'SHREDDING...' : 'PERMANENTLY DELETE'}
              </button>
              <button 
                onClick={cancelDelete}
                disabled={isDeleting}
                className="w-full py-5 bg-white/10 text-zinc-200 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white/20 active:scale-95 transition-all border border-white/5"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatMini: React.FC<{ label: string, count: number, color: string }> = ({ label, count, color }) => {
  const colors: any = {
    rose: 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/20 dark:border-rose-800',
    indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800',
    emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800',
  };
  return (
    <div className={`px-4 py-2 rounded-2xl border-2 shadow-sm flex items-center gap-3 transition-all hover:scale-105 ${colors[color]}`}>
       <span className="text-lg font-black">{count}</span>
       <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</span>
    </div>
  );
};

const InfoPill: React.FC<{ label: string, value: string, icon: string }> = ({ label, value, icon }) => (
  <div className="bg-white/30 dark:bg-zinc-800/30 p-4 rounded-2xl border border-white/40 dark:border-zinc-700/30">
    <p className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest flex items-center gap-1.5 mb-1">
      <i className={`fa-solid fa-${icon}`}></i> {label}
    </p>
    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm truncate">{value}</p>
  </div>
);

const ActionButton: React.FC<{ icon: string, label: string, onClick: (e: React.MouseEvent) => void, color: string }> = ({ icon, label, onClick, color }) => {
  const colors: any = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40',
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${colors[color]}`}>
      <i className={`fa-solid fa-${icon} text-base`}></i>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default DocumentsScreen;
