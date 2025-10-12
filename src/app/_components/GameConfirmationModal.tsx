"use client";

import Image from 'next/image';
import { X, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk properti game yang dibutuhkan
type Game = {
  title: string;
  description: string | null;
  cover_image_url: string | null;
  game_code: string;
};

interface GameConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
}

export default function GameConfirmationModal({ isOpen, onClose, game }: GameConfirmationModalProps) {
  const router = useRouter();

  if (!isOpen || !game) return null;

  const handleStartGame = () => {
    router.push(`/play/${game.game_code}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-violet-700 rounded-xl max-w-lg w-full mx-4 relative shadow-2xl shadow-violet-500/20 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X size={24} />
        </button>
        
        <div className="relative w-full h-56">
          <Image 
            src={game.cover_image_url || '/placeholder.png'} 
            alt={`Cover for ${game.title}`} 
            fill 
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-t-xl" 
          />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 font-display tracking-wider">{game.title}</h2>
          <p className="text-gray-400 mb-6 text-sm max-h-24 overflow-y-auto">
            {game.description || 'Tidak ada deskripsi.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleStartGame} 
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2"
            >
              <Play size={18} /> Mulai
            </button>
            <button 
              onClick={onClose} 
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}