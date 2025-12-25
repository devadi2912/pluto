
import React, { useState } from 'react';
import { PetDocument } from '../types';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: (docs: PetDocument[]) => void;
  petName?: string;
  readOnly?: boolean;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments, petName, readOnly = false }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report' | 'Note'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedDoc.name,
          text: `Document: ${selectedDoc.name} (${selectedDoc.type})`,
          url: selectedDoc.fileUrl
        });
        setShareStatus('Sent');
      } catch (e) {
        // Fallback
        await navigator.clipboard.writeText(selectedDoc.fileUrl);
        setShareStatus('Copied');
      }
    } else {
      await navigator.clipboard.writeText(selectedDoc.fileUrl);
      setShareStatus('Copied');
    }
    setTimeout(() => setShareStatus(null), 2000);
  };

  const handleOpenFile = () => {
    if (selectedDoc?.fileUrl) {
      window.open(selectedDoc.fileUrl, '_blank');
    }
  };

  const handleDeleteDoc = (id: string) => {
    if (readOnly) return;
    if (window.confirm('Delete this document permanently?')) {
      setDocuments(documents.filter(d => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    }
  };

  const startRename = () => {
    if (!selectedDoc || readOnly) return;
    setNewName(selectedDoc.name);
    setIsRenaming(true);
  };

  const saveRename = () => {
    if (!selectedDoc || !newName.trim()) return;
    setDocuments(documents.map(d => d.id === selectedDoc.id ? { ...d, name: newName } : d));
    setSelectedDoc({ ...selectedDoc, name: newName });
    setIsRenaming(false);
  };

  const getDocTypeConfig = (type: PetDocument['type']) => {
    switch (type) {
      case 'Prescription':
        return { icon: 'fa-prescription', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' };
      case 'Bill':
        return { icon: 'fa-file-invoice-dollar', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' };
      case 'Note':
        return { icon: 'fa-note-sticky', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' };
      case 'Report':
      default:
        return { icon: 'fa-clipboard-check', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-100 dark:border-sky-500/20' };
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
          <label className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-black shadow-lg">
            <i className="fa-solid fa-file-circle-plus text-lg"></i>
            <input type="file" className="hidden" onChange={handleUpload} />
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
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className={`bg-white dark:bg-zinc-900 border-2 rounded-[1.75rem] p-4 flex items-center gap-4 transition-all group animate-in slide-in-from-bottom-4 duration-500 shadow-sm cursor-pointer active:scale-[0.98] border-zinc-50 dark:border-zinc-800 hover:border-orange-200`} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${config.bg} ${config.color}`}>
                <i className={`fa-solid ${config.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate text-[14px] md:text-base text-zinc-900 dark:text-zinc-100">{doc.name}</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{doc.type} • {doc.date}</p>
              </div>
              <div className="flex gap-3 text-zinc-300">
                <i className="fa-solid fa-pen-to-square group-hover:text-zinc-500 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setTimeout(startRename, 100); }}></i>
                <i className="fa-solid fa-eye group-hover:text-orange-500 transition-colors"></i>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-6">
           {/* Card Container - High Transparency & Theme Aware */}
           <div className="pointer-events-auto w-full max-w-[340px] bg-white/30 dark:bg-black/40 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
              
              {/* Header: Badge & Close */}
              <div className="flex items-center justify-between p-6 pb-2">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getDocTypeConfig(selectedDoc.type).bg} ${getDocTypeConfig(selectedDoc.type).color} ${getDocTypeConfig(selectedDoc.type).border} bg-opacity-20`}>
                   <i className={`fa-solid ${getDocTypeConfig(selectedDoc.type).icon} mr-2`}></i>
                   {selectedDoc.type}
                 </span>
                 <button 
                   onClick={() => { setSelectedDoc(null); setIsRenaming(false); }}
                   className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-white flex items-center justify-center transition-colors"
                 >
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 text-center space-y-5">
                 <div className="space-y-1">
                    {isRenaming ? (
                       <input 
                         autoFocus
                         className="w-full bg-transparent border-b border-orange-500 text-center font-lobster text-2xl text-zinc-900 dark:text-white outline-none pb-1"
                         value={newName}
                         onChange={(e) => setNewName(e.target.value)}
                         onBlur={saveRename}
                         onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                       />
                    ) : (
                       <h3 
                         className="font-lobster text-3xl text-zinc-900 dark:text-white tracking-wide cursor-pointer hover:text-orange-500 transition-colors"
                         onClick={!readOnly ? startRename : undefined}
                       >
                         {selectedDoc.name} 
                         {!readOnly && <i className="fa-solid fa-pen text-[10px] ml-2 text-zinc-400 align-top mt-1"></i>}
                       </h3>
                    )}
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{selectedDoc.date} • {selectedDoc.fileSize}</p>
                 </div>

                 <div 
                   onClick={handleOpenFile}
                   className="w-full aspect-[4/3] rounded-[2rem] border-2 border-dashed border-zinc-300/50 dark:border-zinc-700/50 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 hover:border-orange-500/50 transition-all cursor-pointer flex flex-col items-center justify-center group gap-4 relative overflow-hidden"
                 >
                    {/* Inner Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform relative z-10">
                       <i className={`fa-solid fa-file-lines ${getDocTypeConfig(selectedDoc.type).color}`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors relative z-10">Tap to View</span>
                 </div>
              </div>

              {/* Footer Actions */}
              <div className={`p-4 bg-white/30 dark:bg-black/20 backdrop-blur-md grid ${readOnly ? 'grid-cols-2' : 'grid-cols-3'} gap-2 mt-2 border-t border-white/20 dark:border-white/5`}>
                 <FooterButton icon="share-nodes" label={shareStatus || "Share"} onClick={handleShare} color="indigo" fullWidth={readOnly} />
                 {!readOnly && <FooterButton icon="pen" label="Rename" onClick={startRename} color="amber" disabled={isRenaming} />}
                 {!readOnly && <FooterButton icon="trash" label="Delete" onClick={() => handleDeleteDoc(selectedDoc.id)} color="rose" />}
                 {readOnly && <FooterButton icon="download" label="Download" onClick={handleOpenFile} color="emerald" fullWidth />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const FooterButton: React.FC<{ icon: string, label: string, onClick: () => void, color: string, disabled?: boolean, fullWidth?: boolean }> = ({ icon, label, onClick, color, disabled, fullWidth }) => {
  const styles: any = {
    indigo: { text: 'text-indigo-600 dark:text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]', bg: 'bg-indigo-50 dark:bg-indigo-500/20' },
    amber:  { text: 'text-amber-600 dark:text-amber-400',   glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',  bg: 'bg-amber-50 dark:bg-amber-500/20' },
    rose:   { text: 'text-rose-600 dark:text-rose-400',    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]',   bg: 'bg-rose-50 dark:bg-rose-500/20' },
    emerald:{ text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', bg: 'bg-emerald-50 dark:bg-emerald-500/20' }
  };
  const s = styles[color];

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 group ${fullWidth ? 'w-full' : ''} hover:bg-white/40 dark:hover:bg-white/5`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${s.bg} ${s.text} ${s.glow} transition-transform group-hover:scale-110`}>
        <i className={`fa-solid fa-${icon}`}></i>
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400`}>{label}</span>
    </button>
  );
};

export default DocumentsScreen;
