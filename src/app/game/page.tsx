"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Plus, Users, Loader2, Play, Flag, Shield } from 'lucide-react';
import JoinGameModal from '../_components/JoinGameModal';
import ReportGameModal from '../_components/ReportGameModal';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';
import toast from 'react-hot-toast';

// Tipe data untuk Game (Tidak diubah)
type Game = {
  id: string;
  title: string;
  description: string | null;
  game_code: string;
  cover_image_url: string | null;
  play_count: number;
  game_type: 'quiz' | 'story';
  is_official: boolean;
  profiles: { username: string } | null;
};

// --- KOMPONEN KARTU GAME (STYLING BARU) ---
function GameCard({ game, isCompleted, onReport }: { game: Game; isCompleted: boolean; onReport: (gameId: string, gameTitle: string) => void; }) {
  const cardContent = (
    <div className={`w-72 flex-1 flex-grow relative block group border rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 bg-slate-900/70 backdrop-blur-sm border-violet-700 text-white ${isCompleted ? 'cursor-not-allowed' : 'hover:shadow-violet-500/50'}`}>
      {!game.is_official && !isCompleted && (
        <button 
          onClick={(e) => { 
            e.preventDefault();
            onReport(game.id, game.title); 
          }} 
          className="absolute top-2 right-2 z-10 p-1.5 bg-slate-800 bg-opacity-70 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-white transition" 
          title="Laporkan Game"
        >
          <Flag size={14} />
        </button>
      )}
      <div className="relative w-full h-48">
        <Image 
          src={game.cover_image_url || '/placeholder.png'} 
          alt={`Cover for ${game.title}`} 
          fill 
          style={{ objectFit: 'cover' }} 
          className={`transition-transform duration-300 ${!isCompleted ? 'group-hover:scale-105' : ''} ${isCompleted ? 'filter grayscale' : ''}`} 
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-4">
            <CheckCircle size={48} className="mb-2 text-green-400" />
            <span className="font-bold text-lg">Selesai</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between h-32">
        <div>
          <h3 className={`text-lg font-bold truncate ${!isCompleted ? 'group-hover:text-violet-400' : 'text-gray-500'}`}>{game.title}</h3>
          <p className="text-sm text-gray-400 mt-1 h-10 overflow-hidden">{game.description || 'Tidak ada deskripsi.'}</p>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span>Oleh: {game.profiles?.username || 'Admin'}</span>
          <span className="flex items-center gap-1 font-medium">
            <Play size={12} />
            {game.play_count.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
  
  return isCompleted ? (
    <div title="Anda sudah menyelesaikan game ini">{cardContent}</div>
  ) : (
    <Link href={`/play/${game.game_code}`}>{cardContent}</Link>
  );
}


// --- KOMPONEN UTAMA HALAMAN GAME (STYLING BARU) ---
export default function GamesPage() {
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [completedGameIds, setCompletedGameIds] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    gameId: '',
    gameTitle: '',
  });

  const { user } = useAuth();
  const supabase = createClient();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const gamesPromise = supabase.from('games').select('*, profiles(username)').eq('is_under_review', false).order('created_at', { ascending: false });
    
    let completedGamesPromise;
    let profilePromise;

    if (user) {
      completedGamesPromise = supabase.from('scores').select('game_id').eq('user_id', user.id);
      profilePromise = supabase.from('profiles').select('role').eq('id', user.id).single();
    }

    const [gamesResult, completedResult, profileResult] = await Promise.all([
      gamesPromise, 
      completedGamesPromise, 
      profilePromise
    ]);

    if (gamesResult.data) setAllGames(gamesResult.data as Game[]);
    if (completedResult?.data) {
      setCompletedGameIds(new Set(completedResult.data.map(s => s.game_id)));
    }
    if (profileResult?.data?.role === 'admin') {
      setIsAdmin(true);
    }
    
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReportClick = (gameId: string, gameTitle: string) => {
    if (!user) return toast.error("Anda harus login untuk melaporkan game.");
    setReportModalState({ isOpen: true, gameId, gameTitle });
  };
  
  const handleSubmitReport = async (reason: string) => {
    const { gameId, gameTitle } = reportModalState;
    
    const { error } = await supabase.rpc('report_game', { 
      game_id_input: gameId, 
      reason_input: reason
    });
    
    if (error) {
      toast.error(`Gagal mengirim laporan: ${error.message}`);
    } else {
      toast.success(`Terima kasih, laporan untuk game "${gameTitle}" telah dikirim.`);
      setAllGames(prev => prev.filter(g => g.id !== gameId));
    }
    setReportModalState({ isOpen: false, gameId: '', gameTitle: '' });
  };

  const officialStoryGames = allGames.filter(g => g.is_official && g.game_type === 'story');
  const officialQuizGames = allGames.filter(g => g.is_official && g.game_type === 'quiz');
  const userStoryGames = allGames.filter(g => !g.is_official && g.game_type === 'story');
  const userQuizGames = allGames.filter(g => !g.is_official && g.game_type === 'quiz');
  
  const GameSection = ({ title, games }: { title: string; games: Game[] }) => (
    <section>
      <h2 className="text-3xl font-bold text-white mb-6 font-display tracking-wider">{title}</h2>
      {games.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-4">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              isCompleted={completedGameIds.has(game.id)} 
              onReport={handleReportClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8 px-4 border-2 border-dashed rounded-lg border-indigo-700">
          <p>Tidak ada game di kategori ini untuk saat ini.</p>
        </div>
      )}
    </section>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto text-white min-h-screen pt-24 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white font-display tracking-wider">Pilih Petualanganmu</h1>
            <p className="text-gray-400 mt-1">Mainkan game resmi atau jelajahi karya dari komunitas.</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
             {isAdmin && (
                <Link href="/admin" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center gap-2">
                    <Shield size={18} /> Admin
                </Link>
             )}
            <button onClick={() => setJoinModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition flex items-center gap-2">
                <Users size={18} /> Gabung Game
            </button>
            <Link href="/create" className="bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700 transition flex items-center gap-2">
                <Plus size={18} /> Buat Game
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12 text-violet-400" /></div>
        ) : (
          <div className="space-y-12">
            <GameSection title="Game Resmi - Mode Cerita" games={officialStoryGames} />
            <GameSection title="Game Resmi - Mode Kuis" games={officialQuizGames} />
            <hr className="border-slate-700"/>
            <GameSection title="Game Komunitas - Mode Cerita" games={userStoryGames} />
            <GameSection title="Game Komunitas - Mode Kuis" games={userQuizGames} />
          </div>
        )}
      </div>

      <JoinGameModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setJoinModalOpen(false)} 
      />
      
      <ReportGameModal 
        isOpen={reportModalState.isOpen}
        onClose={() => setReportModalState({ isOpen: false, gameId: '', gameTitle: '' })}
        gameTitle={reportModalState.gameTitle}
        onSubmit={handleSubmitReport}
      />
    </>
  );
}