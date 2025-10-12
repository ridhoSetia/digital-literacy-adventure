"use client";

import Image from 'next/image';
import { X, Play, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_contexts/AuthContext';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

type Game = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  game_code: string;
  scenarios: { id: string }[];
};

interface GameConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
}

export default function GameConfirmationModal({ isOpen, onClose, game }: GameConfirmationModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkGameStatus = async () => {
      if (!user || !game) return;

      const { data: scoreData } = await supabase
        .from('scores')
        .select('scenario_count')
        .eq('user_id', user.id)
        .eq('game_id', game.id)
        .single();

      if (scoreData && scoreData.scenario_count > 0) {
        const totalScenarios = game.scenarios?.length || 0;
        if (scoreData.scenario_count >= totalScenarios) {
          setIsCompleted(true);
        }
      }
    };

    if (isOpen) {
      checkGameStatus();
    }
  }, [isOpen, user, game, supabase]);

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
          
          {isCompleted && (
            <div className="mb-4 p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-semibold">Peringatan Main Ulang</p>
                <p className="text-xs mt-1">Game ini sudah diselesaikan. Bermain ulang hanya akan memberikan <span className="font-bold">2.5% XP</span> dari nilai asli untuk setiap jawaban benar.</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleStartGame} 
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2"
            >
              <Play size={18} /> {isCompleted ? 'Main Ulang' : 'Mulai'}
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