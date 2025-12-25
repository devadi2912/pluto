
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
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        const newDoc: PetDocument = {
          id: `DOC-${Date.now()}`,
          name: file.name.split('.')[0],
          type: 'Report',
          date: new Date().toISOString().split('T')[0],
          fileUrl: URL.createObjectURL(file),
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          data: base64Data,
          mimeType: file.type
        };
        setDocuments([newDoc, ...documents]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    setShareStatus('Link Copied!');
    setTimeout(() => setShareStatus(null), 2000);
  };

  const handleDeleteDoc = (id: string) => {
    if (readOnly) return;
    if (window.confirm('Delete this document permanently?')) {
      setDocuments(documents.filter(d => d.id !== id));
      setSelectedDoc(null);
      setIsDeleteMode(false);
    }
  };

  return (
    <div className="p-5 md:p-10 space-y-8 animate-in fade-in duration-500 pb-60 relative">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Document Safe</h2>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">Archive: {documents.length} Records</p>
        </div>
        {!readOnly && (
          <label className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-black shadow-lg">
            <i className="fa-solid fa-file-circle-plus text-lg"></i>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
        {['All', 'Prescription', 'Bill', 'Report'].map((f) => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filter === f ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-md scale-105' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredDocs.map((doc, idx) => (
          <div key={doc.id} onClick={() => isDeleteMode ? handleDeleteDoc(doc.id) : setSelectedDoc(doc)} className={`bg-white dark:bg-zinc-900 border-2 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all group animate-in slide-in-from-bottom-4 duration-500 shadow-sm cursor-pointer active:scale-[0.98] ${isDeleteMode ? 'border-rose-400 hover:border-rose-500' : 'border-zinc-50 dark:border-zinc-800 hover:border-orange-200'}`} style={{ animationDelay: `${idx * 60}ms` }}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${isDeleteMode ? 'bg-rose-50 text-rose-500' : 'bg-zinc-50 text-orange-500'}`}>
              <i className={`fa-solid ${isDeleteMode ? 'fa-trash-can' : 'fa-file-medical'}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-[14px] md:text-base">{doc.name}</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{doc.type} • {doc.date}</p>
            </div>
            <i className={`fa-solid ${isDeleteMode ? 'fa-trash-can' : 'fa-eye'} text-zinc-300 group-hover:text-orange-500`}></i>
          </div>
        ))}
      </div>

      {!readOnly && documents.length > 0 && (
        <div className="pt-10 flex justify-center sticky bottom-24 z-30 pointer-events-none">
          <button onClick={() => setIsDeleteMode(!isDeleteMode)} className={`pointer-events-auto flex items-center gap-2.5 px-6 py-2.5 rounded-[1.25rem] font-black text-[8px] uppercase tracking-[0.2em] transition-all shadow-xl border-2 active:scale-95 ${isDeleteMode ? 'bg-rose-500 text-white border-white shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-party' : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-white shadow-lg'}`}>
            <i className={`fa-solid ${isDeleteMode ? 'fa-check-circle' : 'fa-trash-can'}`}></i>
            {isDeleteMode ? 'Finish Cleanup' : 'Manage Records'}
          </button>
        </div>
      )}

      {/* Document View Glass Card */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-transparent pointer-events-none animate-in fade-in duration-300" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-4 border-white dark:border-zinc-800 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 p-8 text-center space-y-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-3xl font-lobster">{selectedDoc.name}</h3>
            <p className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.2em]">{selectedDoc.type} • {selectedDoc.fileSize}</p>
            <div className="bg-white/40 dark:bg-zinc-900/40 rounded-[2rem] h-48 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
               <i className="fa-solid fa-file-pdf text-5xl text-rose-500 opacity-50"></i>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleShare} className="py-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border-2 border-white dark:border-zinc-700 font-black text-[10px] uppercase tracking-widest">{shareStatus || 'Share'}</button>
              <button onClick={() => setSelectedDoc(null)} className="py-4 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-widest border-2 border-white dark:border-zinc-950">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsScreen;
