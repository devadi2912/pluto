
import React, { useState } from 'react';
import { PetDocument } from '../types';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: (docs: PetDocument[]) => void;
  // Added petName prop to allow customized share messages
  petName?: string;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments, petName }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'Prescription' | 'Bill' | 'Report'>('Report');

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: PetDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: 'Report',
        date: new Date().toISOString().split('T')[0],
        fileUrl: '#',
        fileSize: `${(file.size / 1024).toFixed(0)} KB`
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    
    setShareStatus('Generating Link...');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pluto Medical Record: ${selectedDoc.name}`,
          text: `Secure access to ${petName || 'Pet'}'s medical data.`,
          url: window.location.href,
        });
        setShareStatus(null);
      } catch (err) {
        setShareStatus('Link Copied!');
        setTimeout(() => setShareStatus(null), 2000);
      }
    } else {
      setShareStatus('Link Copied!');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleFetch = () => {
    if (!selectedDoc || isFetching) return;
    setIsFetching(true);
    
    // Simulate high-speed medical server sync
    setTimeout(() => {
      setIsFetching(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const startEdit = (doc: PetDocument) => {
    setEditName(doc.name);
    setEditType(doc.type);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedDoc) return;
    const updated = documents.map(d => d.id === selectedDoc.id ? { ...d, name: editName, type: editType } : d);
    setDocuments(updated);
    setSelectedDoc({ ...selectedDoc, name: editName, type: editType });
    setIsEditing(false);
  };

  const deleteDoc = () => {
    if (!selectedDoc) return;
    if (confirm(`Remove ${selectedDoc.name} permanently?`)) {
      setDocuments(documents.filter(d => d.id !== selectedDoc.id));
      setSelectedDoc(null);
    }
  };

  return (
    <div className="p-5 md:p-10 space-y-8 animate-in fade-in duration-500 pb-24 relative min-h-full">
      {/* Success Notification - High Z-index */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-500 text-white px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.4)] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 animate-in slide-in-from-top-10">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-check"></i>
          </div>
          Secure Sync Complete
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Document Safe</h2>
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Archive: {documents.length} Records</p>
        </div>
        <label className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl shadow-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-2 border-white/20">
          <i className="fa-solid fa-file-circle-plus text-lg"></i>
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1 -mx-1">
        {['All', 'Prescription', 'Bill', 'Report'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
              filter === f 
                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-md scale-105' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-orange-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3 md:space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-zinc-300 dark:text-zinc-800 animate-in zoom-in duration-500">
             <i className="fa-solid fa-folder-open text-5xl mb-4 opacity-30"></i>
             <p className="font-black uppercase tracking-[0.2em] text-[10px]">Vault is Empty</p>
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoc(doc)}
              className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 rounded-[1.75rem] p-4 flex items-center gap-4 hover:border-orange-200 dark:hover:border-zinc-700 transition-all group animate-in slide-in-from-bottom-4 duration-500 shadow-sm cursor-pointer active:scale-[0.98]"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all group-hover:rotate-6 ${
                doc.type === 'Prescription' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' :
                doc.type === 'Bill' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
              }`}>
                <i className={`fa-solid ${
                  doc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                  doc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-[14px] md:text-base">{doc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                     doc.type === 'Prescription' ? 'text-rose-500' :
                     doc.type === 'Bill' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{doc.type}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase">{doc.date}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-eye text-[9px]"></i>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REFINED Frosted Glass Document Preview Modal - HEAVILY ELEVATED Z-INDEX */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 animate-in fade-in duration-300"
          onClick={() => {
            setSelectedDoc(null);
            setIsEditing(false);
          }}
        >
          <div 
            className="bg-white/90 dark:bg-zinc-950/90 border-2 border-white/50 dark:border-zinc-800/50 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Area */}
            <div className="p-6 flex items-center justify-between border-b border-zinc-200/20 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  selectedDoc.type === 'Prescription' ? 'bg-rose-500' :
                  selectedDoc.type === 'Bill' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <i className={`fa-solid ${
                    selectedDoc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                    selectedDoc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                  } text-sm`}></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-[13px] truncate max-w-[140px] leading-tight">{selectedDoc.name}</h3>
                  <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">{selectedDoc.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => isEditing ? saveEdit() : startEdit(selectedDoc)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border border-zinc-100 dark:border-zinc-700/30 ${
                    isEditing ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-orange-500'
                  }`}
                >
                  <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen'} text-xs`}></i>
                </button>
                <button 
                  onClick={() => {
                    setSelectedDoc(null);
                    setIsEditing(false);
                  }}
                  className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Preview Body / Edit Body */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              {isEditing ? (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Document Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-orange-100 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Category</label>
                    <select 
                      value={editType}
                      onChange={e => setEditType(e.target.value as any)}
                      className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-orange-100 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 dark:text-white"
                    >
                      <option value="Prescription">Prescription</option>
                      <option value="Bill">Bill</option>
                      <option value="Report">Report</option>
                    </select>
                  </div>
                  <button 
                    onClick={deleteDoc}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 dark:bg-rose-950/20 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-rose-100 dark:border-rose-900/50 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Permanently Delete
                  </button>
                </div>
              ) : (
                <>
                  <div className={`w-32 h-44 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border-2 border-white dark:border-zinc-800 flex flex-col items-center justify-center p-6 mb-6 relative overflow-hidden group transition-all duration-500 ${isFetching ? 'scale-110 shadow-orange-500/20' : 'rotate-[-2deg] hover:rotate-0'}`}>
                    {/* Visual Placeholder Content */}
                    <div className="space-y-2 w-full mb-4">
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                      <div className="h-1.5 w-4/5 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                    </div>
                    
                    <div className="relative">
                      <i className={`fa-solid ${isFetching ? 'fa-sync-alt fa-spin' : 'fa-file-pdf'} text-5xl ${isFetching ? 'text-orange-500' : 'text-rose-500'} transition-colors duration-500`}></i>
                    </div>
                    
                    {isFetching && (
                      <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px] flex items-end p-2">
                        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-1/2 animate-infinite-loading"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-2xl font-lobster text-zinc-900 dark:text-white mb-2 tracking-wide">Medical Record</h4>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Secure Archive: {selectedDoc.id}</p>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{selectedDoc.fileSize} • {isFetching ? 'ACCESSING ENCRYPTED DATA...' : 'ENCRYPTED & SYNCED'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Functional Buttons */}
            {!isEditing && (
              <div className="p-8 pt-0 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleShare}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 active:scale-95 ${
                    shareStatus ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-100 dark:border-zinc-800 hover:border-orange-500'
                  }`}
                >
                  <i className={`fa-solid ${shareStatus ? 'fa-check' : 'fa-share-nodes'}`}></i>
                  {shareStatus || 'Share'}
                </button>
                <button 
                  onClick={handleFetch}
                  disabled={isFetching}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                    isFetching 
                      ? 'bg-zinc-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-orange-500/30 hover:brightness-110'
                  }`}
                >
                  <i className={`fa-solid ${isFetching ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
                  {isFetching ? 'Syncing' : 'Fetch'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes infinite-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-infinite-loading {
          animation: infinite-loading 1s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default DocumentsScreen;
