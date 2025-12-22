
import React, { useState } from 'react';
import { PetDocument } from '../types';

interface DocumentsProps {
  documents: PetDocument[];
  setDocuments: (docs: PetDocument[]) => void;
}

const DocumentsScreen: React.FC<DocumentsProps> = ({ documents, setDocuments }) => {
  const [filter, setFilter] = useState<'All' | 'Prescription' | 'Bill' | 'Report'>('All');
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.type === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: PetDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: 'Report', // Default
        date: new Date().toISOString().split('T')[0],
        fileUrl: '#',
        fileSize: `${(file.size / 1024).toFixed(0)} KB`
      };
      setDocuments([newDoc, ...documents]);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20 relative min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-3xl font-bold font-lobster text-zinc-900 dark:text-zinc-50 tracking-wide">Document Safe</h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Total: {documents.length} files</p>
        </div>
        <label className="w-14 h-14 bg-gradient-to-tr from-orange-400 to-amber-500 text-white rounded-[1.5rem] shadow-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-90 border-2 border-white/20">
          <i className="fa-solid fa-file-circle-plus text-xl"></i>
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1 -mx-1">
        {['All', 'Prescription', 'Bill', 'Report'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
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
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-zinc-300 dark:text-zinc-800">
             <i className="fa-solid fa-folder-open text-6xl mb-4"></i>
             <p className="font-bold uppercase tracking-widest text-[11px]">No documents found</p>
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoc(doc)}
              className="bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 rounded-[2.5rem] p-5 flex items-center gap-4 hover:border-orange-100 dark:hover:border-zinc-700 transition-all group animate-in slide-in-from-bottom-2 duration-300 shadow-sm cursor-pointer active:scale-[0.98]"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all group-hover:scale-110 ${
                doc.type === 'Prescription' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' :
                doc.type === 'Bill' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
              }`}>
                <i className={`fa-solid ${
                  doc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                  doc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                }`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-lg">{doc.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                     doc.type === 'Prescription' ? 'text-rose-500' :
                     doc.type === 'Bill' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{doc.type}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
                  <span className="text-[9px] font-bold text-zinc-400">{doc.date}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-eye text-xs"></i>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border-4 border-zinc-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between border-b dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  selectedDoc.type === 'Prescription' ? 'bg-rose-500' :
                  selectedDoc.type === 'Bill' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <i className={`fa-solid ${
                    selectedDoc.type === 'Prescription' ? 'fa-prescription-bottle-medical' :
                    selectedDoc.type === 'Bill' ? 'fa-file-invoice-dollar' : 'fa-file-medical'
                  }`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm truncate max-w-[150px]">{selectedDoc.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{selectedDoc.type}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:bg-rose-500 hover:text-white transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Simulated Document Preview Area */}
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-8 min-h-[350px] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-32 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border-2 border-zinc-200 dark:border-zinc-800 flex flex-col p-4 mb-6 relative overflow-hidden">
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 mb-2"></div>
                <div className="h-1 w-3/4 bg-zinc-100 dark:bg-zinc-800 mb-2"></div>
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 mb-2"></div>
                <div className="h-1 w-1/2 bg-zinc-100 dark:bg-zinc-800 mb-2"></div>
                <div className="mt-auto flex justify-center">
                   <i className={`fa-solid ${
                    selectedDoc.type === 'Prescription' ? 'fa-prescription-bottle-medical text-rose-500/20' :
                    selectedDoc.type === 'Bill' ? 'fa-file-invoice-dollar text-amber-500/20' : 'fa-file-medical text-emerald-500/20'
                  } text-4xl`}></i>
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-bl-lg border-l-2 border-b-2 border-zinc-200 dark:border-zinc-800"></div>
              </div>
              
              <h4 className="text-xl font-lobster text-zinc-900 dark:text-zinc-50 mb-2">Digital Copy Ready</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 px-6">
                This {selectedDoc.type.toLowerCase()} was safely stored on {selectedDoc.date}.
                File Size: {selectedDoc.fileSize}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 grid grid-cols-2 gap-4 bg-white dark:bg-zinc-900">
               <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all">
                  <i className="fa-solid fa-share-nodes"></i>
                  Share
               </button>
               <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all">
                  <i className="fa-solid fa-download"></i>
                  Download
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsScreen;
