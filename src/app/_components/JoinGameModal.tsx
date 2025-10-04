"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, X, Keyboard } from 'lucide-react';
import QrScanner from './QrScanner';
import toast from 'react-hot-toast';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.trim()) {
      router.push(`/play/${gameCode.trim().toUpperCase()}`);
      onClose();
    }
  };
  
  const handleScanSuccess = (result: string) => {
    try {
        const url = new URL(result);
        const pathSegments = url.pathname.split('/');
        const code = pathSegments.pop() || pathSegments.pop();

        if (code) {
            toast.success(`Game ${code.toUpperCase()} ditemukan!`);
            router.push(`/play/${code.toUpperCase()}`);
            onClose();
        } else {
            toast.error("QR Code tidak valid.");
        }
    } catch (error) {
        toast.success(`Game ${result.toUpperCase()} ditemukan!`);
        router.push(`/play/${result.toUpperCase()}`);
        onClose();
    }
  };

  if (!isOpen) return null;

  const closeAndReset = () => {
    setScannerOpen(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-violet-700 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl shadow-violet-500/20 text-white">
        <button onClick={closeAndReset} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center font-display tracking-wider">Gabung ke Game</h2>
        
        {isScannerOpen ? (
          <div>
            <div className="p-1 bg-slate-700 rounded-lg">
                <QrScanner
                    onScanResult={handleScanSuccess}
                    // PERBAIKAN DI SINI
                    onScanError={(_error) => {
                        console.error("QR Scan Error:", _error);
                    }}
                />
            </div>
            <button onClick={() => setScannerOpen(false)} className="w-full mt-4 bg-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-600 flex items-center justify-center gap-2">
                <Keyboard size={18} />
                Gunakan Kode Saja
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Masukkan Kode Game</label>
                <input 
                  type="text" 
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center text-lg font-pixel tracking-widest" 
                  placeholder="DIGI1234"
                  maxLength={8}
                />
              </div>
              <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition">
                Join Game
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">atau</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button onClick={() => setScannerOpen(true)} className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-2">
              <QrCode size={20} />
              Scan QR Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
