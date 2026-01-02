
import React, { useState } from 'react';
import { PetDocument } from '../types';
import { api } from '../lib/api';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<PetDocument[]>>;
  petName?: string;
  petId?: string;
  readOnly?: boolean;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments, petName, petId, readOnly = false }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report' | 'Note'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

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

  const handleDeleteDoc = async (e: React.MouseEvent | undefined, id: string) => {
    if (e) e.stopPropagation();
    if (readOnly || !petId || isDeleting) return;

    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setIsDeleting(true);
    console.log(`[UI] Deleting document: ${id}`);

    // OPTIMISTIC UPDATE: Remove from UI immediately
    const previousDocs = [...documents];
    setDocuments(prev => prev.filter(d => d.id !== id));

    // If we are deleting the currently open document, close the modal
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }

    try {
      await api.deleteDocument(petId, id);
      console.log("[UI] Document deleted successfully from backend");
    } catch (err) {
      console.error("[UI] Delete failed, reverting UI:", err);
      // Revert UI on failure
      setDocuments(previousDocs);
      alert("Failed to delete document. Please check your connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDocTypeConfig = (type: PetDocument['type']) => {
    switch (type) {
      case 'Prescription': return { icon: 'fa-prescription', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' };
      case 'Bill': return { icon: 'fa-file-invoice-dollar', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'Note': return { icon: 'fa-note-sticky', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { icon: 'fa-clipboard-check', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' };
    }
  };

  return (
    <div className="p-5 md:p-10 space-y-8 animate-in fade-in duration-500 pb-32 relative">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Document Safe</h2>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest mt-1">Archive: {documents.length} Records</p>
        </div>
        {!readOnly && (
          <label className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-black shadow-lg ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <i className="fa-solid fa-spinner animate-spin text-lg"></i> : <i className="fa-solid fa-file-circle-plus text-lg"></i>}
            <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
        {['All', 'Prescription', 'Bill', 'Report', 'Note'].map((f) => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filter === f ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-md scale-105' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredDocs.map((doc, idx) => {
          const config = getDocTypeConfig(doc.type);
          return (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className={`bg-white dark:bg-zinc-900 border-2 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all group animate-in slide-in-from-bottom-4 duration-500 shadow-sm cursor-pointer border-zinc-50 hover:border-orange-200`} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${config.bg} ${config.color}`}>
                <i className={`fa-solid ${config.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate text-[14px] md:text-base text-zinc-900 dark:text-zinc-100">{doc.name}</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{doc.type} • {doc.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button 
                    onClick={(e) => handleDeleteDoc(e, doc.id)}
                    className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Delete File"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                )}
                <div className="w-10 h-10 flex items-center justify-center text-zinc-300 group-hover:text-orange-500 transition-colors">
                  <i className="fa-solid fa-eye text-sm"></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-6">
           <div className="pointer-events-auto w-full max-w-[340px] bg-white/30 dark:bg-black/40 backdrop-blur-3xl border border-white/40 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
              <div className="flex items-center justify-between p-6 pb-2">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getDocTypeConfig(selectedDoc.type).bg} ${getDocTypeConfig(selectedDoc.type).color} ${getDocTypeConfig(selectedDoc.type).border}`}>
                   {selectedDoc.type}
                 </span>
                 <button onClick={() => { setSelectedDoc(null); setIsRenaming(false); }} className="w-8 h-8 rounded-full bg-black/5 text-zinc-500 flex items-center justify-center hover:text-rose-500"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="px-6 py-4 text-center space-y-5">
                 {isRenaming ? (
                    <input autoFocus className="w-full bg-transparent border-b border-orange-500 text-center font-lobster text-2xl text-zinc-900 dark:text-white outline-none" value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={saveRename} onKeyDown={(e) => e.key === 'Enter' && saveRename()} />
                 ) : (
                    <h3 className="font-lobster text-3xl text-zinc-900 dark:text-white cursor-pointer hover:text-orange-500 transition-colors" onClick={() => window.open(selectedDoc.fileUrl, '_blank')}>{selectedDoc.name}</h3>
                 )}
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{selectedDoc.date} • {selectedDoc.fileSize}</p>
                 
                 {selectedDoc.mimeType?.startsWith('image/') && (
                   <div className="w-full h-32 rounded-2xl overflow-hidden bg-black/10 mt-2 border border-white/20">
                     <img src={selectedDoc.fileUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                   </div>
                 )}
              </div>
              <div className="p-4 bg-white/30 grid grid-cols-3 gap-2 border-t border-white/20">
                 <FooterButton icon="share-nodes" label={shareStatus || "Share"} onClick={handleShare} color="indigo" disabled={isDeleting} />
                 {!readOnly && <FooterButton icon="pen" label="Rename" onClick={() => { setNewName(selectedDoc.name); setIsRenaming(true); }} color="amber" disabled={isDeleting} />}
                 {!readOnly && (
                   <FooterButton 
                     icon={isDeleting ? 'spinner' : 'trash'} 
                     label={isDeleting ? "..." : "Delete"} 
                     onClick={(e) => handleDeleteDoc(e, selectedDoc.id)} 
                     color="rose" 
                     disabled={isDeleting} 
                   />
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const FooterButton: React.FC<{ icon: string, label: string, onClick: (e: React.MouseEvent) => void, color: string, disabled?: boolean }> = ({ icon, label, onClick, color, disabled }) => {
  const styles: any = { indigo: 'text-indigo-600', amber: 'text-amber-600', rose: 'text-rose-600' };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg bg-white/50 ${styles[color]}`}>
        <i className={`fa-solid fa-${icon} ${icon === 'spinner' ? 'animate-spin' : ''}`}></i>
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{label}</span>
    </button>
  );
};

export default DocumentsScreen;
