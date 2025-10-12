"use client";

import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Copy, Link as LinkIcon, X } from 'lucide-react';

interface GameShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode: string;
  shareLink: string;
}

export default function GameShareModal({ isOpen, onClose, gameCode, shareLink }: GameShareModalProps) {
  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-violet-700 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl shadow-violet-500/20 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center font-display tracking-wider">Game Berhasil Dibuat!</h2>
        
        <div className="text-center mb-6">
          <div className="inline-block p-2 bg-white border-2 border-violet-400 rounded-lg">
            <QRCodeCanvas value={shareLink} size={160} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Kode Game</label>
            <div className="flex">
              <input type="text" value={gameCode} className="flex-1 px-4 py-2 border border-slate-700 rounded-l-lg bg-slate-800 font-pixel text-sm" readOnly />
              <button onClick={() => copyToClipboard(gameCode, 'Kode Game')} className="px-4 py-2 bg-violet-600 text-white rounded-r-lg hover:bg-violet-700 transition flex items-center">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Link Sharing</label>
            <div className="flex">
              <input type="text" value={shareLink} className="flex-1 px-4 py-2 border border-slate-700 rounded-l-lg bg-slate-800 text-sm" readOnly />
              <button onClick={() => copyToClipboard(shareLink, 'Link')} className="px-4 py-2 bg-violet-600 text-white rounded-r-lg hover:bg-violet-700 transition flex items-center">
                <LinkIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold">
          Tutup
        </button>
      </div>
    </div>
  );
}
