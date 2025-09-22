"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
//                   👇 TAMBAHKAN 'Play' DI SINI
import { CheckCircle, Plus, Users, Loader2, Play } from 'lucide-react';
import JoinGameModal from '../_components/JoinGameModal';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';

// Tipe data untuk Game (diperbarui)
type Game = {
  id: string;
  title: string;
  description: string | null;
  game_code: string;
  cover_image_url: string | null;
  play_count: number; // <-- TAMBAHKAN baris ini
  profiles: { username: string } | null;
};

// --- KOMPONEN KARTU GAME ---
// --- KOMPONEN KARTU GAME (DIPERBARUI) ---
function GameCard({ game, isCompleted }: { game: Game; isCompleted: boolean }) {
  const cardContent = (
    <div className={`relative block group border rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 bg-white ${isCompleted ? 'cursor-not-allowed' : 'hover:shadow-xl'}`}>
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
            <CheckCircle size={48} className="mb-2" />
            <span className="font-bold text-lg">Selesai Dimainkan</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between h-32">
        <div>
          <h3 className={`text-lg font-bold truncate ${!isCompleted ? 'group-hover:text-primary' : 'text-gray-500'}`}>{game.title}</h3>
          <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">{game.description || 'Tidak ada deskripsi.'}</p>
        </div>
        {/* --- TAMPILAN BARU UNTUK CREATOR & PLAY COUNT --- */}
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
    <div>{cardContent}</div>
  ) : (
    <Link href={`/play/${game.game_code}`}>{cardContent}</Link>
  );
}

// --- KOMPONEN UTAMA HALAMAN GAME ---
export default function GamesPage() {
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [officialGames, setOfficialGames] = useState<Game[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [completedGameIds, setCompletedGameIds] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const supabase = createClient();
  
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);

      // Ambil semua data game secara paralel
      const officialGamesPromise = supabase.from('games').select('*, profiles(username)').eq('is_official', true).order('created_at', { ascending: false });
      const userGamesPromise = supabase.from('games').select('*, profiles(username)').eq('is_official', false).order('created_at', { ascending: false }).limit(10);
      
      // Ambil data game yang sudah selesai jika user sudah login
      let completedGamesPromise;
      if (user) {
        completedGamesPromise = supabase.from('scores').select('game_id').eq('user_id', user.id);
      }

      const [officialResult, userResult, completedResult] = await Promise.all([
        officialGamesPromise,
        userGamesPromise,
        completedGamesPromise
      ]);

      if (officialResult.data) setOfficialGames(officialResult.data as Game[]);
      if (userResult.data) setUserGames(userResult.data as Game[]);
      if (completedResult?.data) {
        setCompletedGameIds(new Set(completedResult.data.map(s => s.game_id)));
      }
      
      setLoading(false);
    };

    fetchGames();
  }, [user, supabase]);

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Pilih Petualanganmu</h1>
            <p className="text-gray-600 mt-1">Mainkan game resmi atau jelajahi karya dari komunitas.</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setJoinModalOpen(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-black transition flex items-center gap-2"
            >
              <Users size={18} />
              Gabung Game
            </button>
            <Link href="/create" className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition flex items-center gap-2">
              <Plus size={18} />
              Buat Game
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Game Resmi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {officialGames.length > 0 ? (
                  officialGames.map((game) => (
                    <GameCard key={game.id} game={game} isCompleted={completedGameIds.has(game.id)} />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">Belum ada game resmi yang tersedia.</p>
                )}
              </div>
            </section>

            <hr className="my-12" />

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Game Komunitas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userGames.length > 0 ? (
                  userGames.map((game) => (
                    <GameCard key={game.id} game={game} isCompleted={completedGameIds.has(game.id)} />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">Jadilah yang pertama membuat game!</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <JoinGameModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setJoinModalOpen(false)} 
      />
    </>
  );
}