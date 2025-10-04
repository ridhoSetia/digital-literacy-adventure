"use client";

import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface ReportGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  onSubmit: (reason: string) => Promise<void>;
}

export default function ReportGameModal({ isOpen, onClose, gameTitle, onSubmit }: ReportGameModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
        return;
    }
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-violet-700 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl shadow-violet-500/20 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center font-display tracking-wider">Laporkan Game</h2>
        <p className="text-center text-gray-400 mb-6 truncate">Anda akan melaporkan: <span className="font-semibold text-gray-200">{gameTitle}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-400 mb-2">
                Apa alasan Anda melaporkan game ini?
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Contoh: Konten tidak pantas, jawaban salah, dll."
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition">
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !reason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 disabled:bg-slate-600"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}