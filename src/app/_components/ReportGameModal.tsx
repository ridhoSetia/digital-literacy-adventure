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
        // Optional: Anda bisa menambahkan validasi di sini
        return;
    }
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose(); // Modal akan ditutup dari parent setelah submit berhasil
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">Laporkan Game</h2>
        <p className="text-center text-gray-500 mb-6 truncate">Anda akan melaporkan: <span className="font-semibold">{gameTitle}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Apa alasan Anda melaporkan game ini?
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Konten tidak pantas, jawaban salah, dll."
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !reason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 disabled:bg-gray-400"
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