
import React, { useState } from 'react';
import { PetDocument } from '../types';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: (docs: PetDocument[]) => void;
  petName?: string;
  readOnly?: boolean;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments, petName, readOnly = false }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'Prescription' | 'Bill' | 'Report'>('Report');

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: PetDocument = {
        id: `DOC-${Date.now()}`,
        name: file.name.split('.')[0],
        type: 'Report',
        date: new Date().toISOString().split('T')[0],
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Using a placeholder for demo
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
    if (readOnly) return;
    setEditName(doc.name);
    setEditType(doc.type);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedDoc || readOnly) return;
    const updated = documents.map(d => d.id === selectedDoc.id ? { ...d, name: editName, type: editType } : d);
    setDocuments(updated);
    setSelectedDoc({ ...selectedDoc, name: editName, type: editType });
    setIsEditing(false);
  };

  const handleDeleteDoc = (id: string) => {
    if (readOnly) return;
    if (window.confirm('Are you sure you want to delete this document permanently?')) {
      const updatedDocs = documents.filter(d => d.id !== id);
      setDocuments(updatedDocs);
      if (selectedDoc?.id === id) setSelectedDoc(null);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-5 md:p-10 space-y-8 animate-in fade-in duration-500 pb-44 relative min-h-full">
      {/* Success Notification */}
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
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">Archive: {documents.length} Records</p>
        </div>
        {!readOnly && (
          <label className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-black shadow-[0_0_20px_rgba(255,255,255,0.4)] dark:shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <i className="fa-solid fa-file-circle-plus text-lg"></i>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1 -mx-1">
        {['All', 'Prescription', 'Bill', 'Report'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
              filter === f 
                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-md scale-105' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-200'
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
             <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-folder-open text-3xl opacity-30"></i>
             </div>
             <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Documents Found</p>
             {filter !== 'All' && <p className="text-[9px] text-zinc-400 font-bold mt-2">Try changing the filter</p>}
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div 
              key={doc.id} 
              onClick={() => isDeleteMode ? handleDeleteDoc(doc.id) : setSelectedDoc(doc)}
              className={`bg-white dark:bg-zinc-900 border-2 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all group animate-in slide-in-from-bottom-4 duration-500 shadow-sm cursor-pointer active:scale-[0.98] ${
                isDeleteMode 
                  ? 'border-rose-400/40 dark:border-rose-900/60 shadow-rose-100/50 dark:shadow-none hover:border-rose-500 active:rotate-1' 
                  : 'border-zinc-50 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-zinc-700'
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all group-hover:rotate-6 ${
                isDeleteMode ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40' :
                doc.type === 'Prescription' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' :
                doc.type === 'Bill' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
              }`}>
                <i className={`fa-solid ${
                  isDeleteMode ? 'fa-trash-can' :
                  doc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                  doc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold truncate text-[14px] md:text-base transition-colors ${isDeleteMode ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{doc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                     doc.type === 'Prescription' ? 'text-rose-600' :
                     doc.type === 'Bill' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{doc.type}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">{doc.date}</span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isDeleteMode 
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-200 hover:bg-rose-500 hover:text-white' 
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-orange-500 group-hover:text-white'
              }`}>
                <i className={`fa-solid ${isDeleteMode ? 'fa-trash-can text-[10px]' : 'fa-eye text-[9px]'}`}></i>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Management Button - Smaller, Dynamic Borders, Pink Glow */}
      {!readOnly && documents.length > 0 && (
        <div className="pt-10 flex justify-center sticky bottom-24 z-30 pointer-events-none">
          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`pointer-events-auto flex items-center gap-2.5 px-6 py-2.5 rounded-[1.25rem] font-black text-[8px] uppercase tracking-[0.2em] transition-all shadow-xl border-2 active:scale-95 ${
              isDeleteMode 
                ? 'bg-rose-500 text-white border-white dark:border-black shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-party' 
                : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-white dark:border-black shadow-lg hover:translate-y-[-2px]'
            }`}
          >
            <i className={`fa-solid ${isDeleteMode ? 'fa-check-circle' : 'fa-trash-can'}`}></i>
            {isDeleteMode ? 'Finish Cleanup' : 'Manage Records'}
          </button>
        </div>
      )}

      {/* Modal Preview - Consistent Frosted Glass Style */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/30 animate-in fade-in duration-300"
          onClick={() => {
            setSelectedDoc(null);
            setIsEditing(false);
          }}
        >
          <div 
            className="bg-white/95 dark:bg-zinc-950/90 backdrop-blur-[40px] backdrop-saturate-150 border-2 border-white/60 dark:border-zinc-800/50 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section with fixed readability */}
            <div className="p-7 flex items-center justify-between bg-white/40 dark:bg-zinc-900/40 border-b border-zinc-200/20 dark:border-zinc-800/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                  selectedDoc.type === 'Prescription' ? 'bg-rose-500' :
                  selectedDoc.type === 'Bill' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <i className={`fa-solid ${
                    selectedDoc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                    selectedDoc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                  } text-lg`}></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-950 dark:text-white text-base truncate max-w-[200px] leading-tight">{selectedDoc.name}</h3>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-[0.2em] mt-0.5">{selectedDoc.type}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                {!readOnly && (
                  <button 
                    onClick={() => isEditing ? saveEdit() : startEdit(selectedDoc)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 border-2 ${
                      isEditing 
                        ? 'bg-emerald-500 text-white border-white/20' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-orange-500 border-transparent'
                    }`}
                  >
                    <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen'} text-sm`}></i>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedDoc(null);
                    setIsEditing(false);
                  }}
                  className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:bg-rose-500 hover:text-white transition-all active:scale-90 border-2 border-transparent"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              {isEditing && !readOnly ? (
                <div className="w-full space-y-6 animate-in fade-in zoom-in-95">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-400 tracking-widest ml-1">Document Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-5 bg-white dark:bg-zinc-900 border-2 border-orange-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 text-zinc-950 dark:text-white shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-400 tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <select 
                        value={editType}
                        onChange={e => setEditType(e.target.value as any)}
                        className="w-full p-5 bg-white dark:bg-zinc-900 border-2 border-orange-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 text-zinc-950 dark:text-white shadow-inner appearance-none"
                      >
                        <option value="Prescription">Prescription</option>
                        <option value="Bill">Bill</option>
                        <option value="Report">Report</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"></i>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteDoc(selectedDoc.id)}
                    className="w-full flex items-center justify-center gap-2 py-5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] border-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-[0.98]"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Permanently Delete
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  {/* Enhanced Interactive Document Preview */}
                  <div className={`w-full h-64 bg-white/90 dark:bg-zinc-900 rounded-[2rem] shadow-2xl border-2 border-white dark:border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-700 ${isFetching ? 'scale-[1.02] shadow-orange-500/20' : 'hover:scale-[1.01]'}`}>
                    
                    {isFetching ? (
                      <div className="flex flex-col items-center gap-6 animate-pulse">
                         <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-sync-alt fa-spin text-3xl text-orange-500"></i>
                         </div>
                         <p className="text-[11px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest animate-bounce">Secure Syncing...</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col p-6 text-left opacity-30 group-hover:opacity-40 transition-opacity">
                         <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
                         <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mb-2"></div>
                         <div className="h-2.5 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-2"></div>
                         <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mb-2"></div>
                      </div>
                    )}

                    {!isFetching && (
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-3xl flex items-center justify-center text-rose-500 shadow-xl group-hover:scale-110 transition-transform">
                          <i className="fa-solid fa-file-pdf text-4xl"></i>
                        </div>
                        <button 
                          onClick={() => openInNewTab(selectedDoc.fileUrl)}
                          className="px-6 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all"
                        >
                          Expand View <i className="fa-solid fa-arrow-up-right-from-square ml-1.5"></i>
                        </button>
                      </div>
                    )}
                    
                    {isFetching && (
                      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-orange-500/10 overflow-hidden">
                        <div className="h-full bg-orange-500 w-1/2 animate-infinite-loading"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-3xl font-lobster text-zinc-900 dark:text-white tracking-wide">Secure File Preview</h4>
                    <p className="text-[11px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-[0.2em]">ID: {selectedDoc.id} • {selectedDoc.fileSize}</p>
                    <p className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${isFetching ? 'text-orange-600' : 'text-emerald-600'}`}>
                       {isFetching ? 'DECRYPTING DATA...' : 'VERIFIED PLUTO ENCRYPTION'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="p-8 pt-0 grid grid-cols-2 gap-5">
                <button 
                  onClick={handleShare}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border-2 active:scale-95 shadow-xl ${
                    shareStatus 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-white/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border-zinc-100 dark:border-zinc-800 hover:border-orange-500'
                  }`}
                >
                  <i className={`fa-solid ${shareStatus ? 'fa-check' : 'fa-share-nodes'}`}></i>
                  {shareStatus || 'Share'}
                </button>
                <button 
                  onClick={handleFetch}
                  disabled={isFetching}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-b-4 ${
                    isFetching 
                      ? 'bg-zinc-400 border-zinc-500 cursor-not-allowed text-white' 
                      : 'bg-orange-500 text-white border-orange-700 shadow-orange-500/30 hover:brightness-110'
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
          animation: infinite-loading 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DocumentsScreen;
