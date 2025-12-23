
import React, { useState } from 'react';
import { PetDocument } from '../types';
import { supabase } from '../lib/supabase';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: (docs: PetDocument[]) => void;
  petName?: string;
  petId: string;
  readOnly?: boolean;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments, petName, petId, readOnly = false }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'Prescription' | 'Bill' | 'Report'>('Report');

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        // Included petId for proper data grouping in backend
        const newDoc: PetDocument = {
          id: `DOC-${Date.now()}`,
          name: file.name.split('.')[0],
          type: 'Report',
          date: new Date().toISOString().split('T')[0],
          fileUrl: URL.createObjectURL(file),
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          data: base64Data,
          mimeType: file.type,
          petId
        };
        
        setDocuments([newDoc, ...documents]);
        await supabase.from('documents').insert(newDoc);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    setShareStatus('Generating Link...');
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pluto Record: ${selectedDoc.name}`, url: window.location.href });
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

  const saveEdit = async () => {
    if (!selectedDoc || readOnly) return;
    const updated = documents.map(d => d.id === selectedDoc.id ? { ...d, name: editName, type: editType } : d);
    setDocuments(updated);
    setSelectedDoc({ ...selectedDoc, name: editName, type: editType });
    await supabase.from('documents').update({ name: editName, type: editType }).eq('id', selectedDoc.id);
    setIsEditing(false);
  };

  const handleDeleteDoc = async (id: string) => {
    if (readOnly) return;
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(d => d.id !== id);
      setDocuments(updatedDocs);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      await supabase.from('documents').delete().eq('id', id);
    }
  };

  return (
    <div className="p-5 md:p-10 space-y-8 animate-in fade-in duration-500 pb-44 relative min-h-full">
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-500 text-white px-6 py-4 rounded-[1.5rem] shadow-xl font-black uppercase tracking-widest text-[10px] animate-in slide-in-from-top-10">
          Secure Sync Complete
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Document Safe</h2>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">Archive: {documents.length} Records</p>
        </div>
        {!readOnly && (
          <label className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 border-4 border-white dark:border-black shadow-xl">
            <i className="fa-solid fa-file-circle-plus text-lg"></i>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1 -mx-1">
        {['All', 'Prescription', 'Bill', 'Report'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
              filter === f 
                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-md scale-105' 
                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3 md:space-y-4">
        {filteredDocs.map((doc, idx) => (
          <div 
            key={doc.id} 
            onClick={() => isDeleteMode ? handleDeleteDoc(doc.id) : setSelectedDoc(doc)}
            className={`bg-white dark:bg-zinc-900 border-2 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all group animate-in slide-in-from-bottom-4 shadow-sm cursor-pointer active:scale-[0.98] ${isDeleteMode ? 'border-rose-400 hover:border-rose-500' : 'border-zinc-50 hover:border-orange-200'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${doc.type === 'Prescription' ? 'bg-rose-50 text-rose-500' : doc.type === 'Bill' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <i className={`fa-solid ${isDeleteMode ? 'fa-trash-can' : doc.type === 'Prescription' ? 'fa-prescription-bottle-medical' : doc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold truncate text-[14px] md:text-base ${isDeleteMode ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100'}`}>{doc.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-black uppercase tracking-widest ${doc.type === 'Prescription' ? 'text-rose-600' : doc.type === 'Bill' ? 'text-amber-600' : 'text-emerald-600'}`}>{doc.type}</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase">{doc.date}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <i className={`fa-solid ${isDeleteMode ? 'fa-trash-can' : 'fa-eye'}`}></i>
            </div>
          </div>
        ))}
      </div>

      {!readOnly && documents.length > 0 && (
        <div className="pt-10 flex justify-center sticky bottom-24 z-30">
          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`px-6 py-2.5 rounded-[1.25rem] font-black text-[8px] uppercase tracking-widest transition-all shadow-xl border-2 ${isDeleteMode ? 'bg-rose-500 text-white animate-party' : 'bg-zinc-950 text-white'}`}
          >
            {isDeleteMode ? 'Finish Cleanup' : 'Manage Records'}
          </button>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-7 flex items-center justify-between border-b dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${selectedDoc.type === 'Prescription' ? 'bg-rose-500' : selectedDoc.type === 'Bill' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  <i className="fa-solid fa-file-medical text-lg"></i>
                </div>
                <h3 className="font-bold dark:text-white">{selectedDoc.name}</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="w-full h-64 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] flex flex-col items-center justify-center text-center">
                  <i className="fa-solid fa-file-pdf text-4xl text-rose-500 mb-4"></i>
                  <p className="text-[10px] font-black uppercase text-zinc-400">Archived Record • {selectedDoc.fileSize}</p>
                  <a href={selectedDoc.fileUrl} target="_blank" className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase">Download</a>
               </div>
               <button onClick={handleShare} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Share Securely</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsScreen;
