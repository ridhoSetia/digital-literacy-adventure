"use client";

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmQuestion: string;
  action: () => void;
  isDestructive?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  title, 
  confirmQuestion, 
  action, 
  isDestructive = true 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-red-700 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl shadow-red-500/20 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 font-display tracking-wider">{title}</h2>
            <p className="text-gray-400 mb-6">{confirmQuestion}</p>
        </div>
        
        <div className="flex justify-center gap-4">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition"
            >
                Batal
            </button>
            <button 
                type="button" 
                onClick={handleConfirm}
                className={`px-6 py-2 rounded-lg font-semibold transition ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
            >
                {isDestructive ? 'Ya, Hapus' : 'Konfirmasi'}
            </button>
        </div>
      </div>
    </div>
  );
}