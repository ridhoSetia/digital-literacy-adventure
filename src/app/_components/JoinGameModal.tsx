"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, X, Keyboard } from 'lucide-react';
import QrScanner from './QrScanner'; // <-- Import komponen scanner baru
import toast from 'react-hot-toast';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false); // <-- State untuk menampilkan scanner

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.trim()) {
      router.push(`/play/${gameCode.trim().toUpperCase()}`);
      onClose();
    }
  };
  
  // Fungsi yang akan dijalankan setelah scan berhasil
  const handleScanSuccess = (result: string) => {
    try {
        // Asumsi hasil scan adalah URL lengkap (misal: https://domain.com/play/DIGI1234)
        const url = new URL(result);
        const pathSegments = url.pathname.split('/');
        const code = pathSegments.pop() || pathSegments.pop(); // Menangani trailing slash

        if (code) {
            toast.success(`Game ${code.toUpperCase()} ditemukan!`);
            router.push(`/play/${code.toUpperCase()}`);
            onClose();
        } else {
            toast.error("QR Code tidak valid.");
        }
    } catch (error) {
        // Jika hasil scan bukan URL, anggap itu adalah kodenya langsung
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button onClick={closeAndReset} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Gabung ke Game</h2>
        
        {/* Tampilan akan berubah tergantung apakah scanner terbuka atau tidak */}
        {isScannerOpen ? (
          <div>
            <QrScanner 
                onScanResult={handleScanSuccess} 
                onScanError={(error) => {
                    // Anda bisa menangani error di sini, misal menampilkan toast
                    // console.error("QR Scan Error:", error);
                }}
            />
            <button onClick={() => setScannerOpen(false)} className="w-full mt-4 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2">
                <Keyboard size={18} />
                Gunakan Kode Saja
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Kode Game</label>
                <input 
                  type="text" 
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-center text-lg font-mono tracking-widest" 
                  placeholder="DIGI1234"
                  maxLength={8}
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition">
                Join Game
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">atau</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button onClick={() => setScannerOpen(true)} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-black transition flex items-center justify-center gap-2">
              <QrCode size={20} />
              Scan QR Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}