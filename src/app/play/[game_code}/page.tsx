"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/_contexts/AuthContext';

// Definisikan tipe data untuk kejelasan
type Scenario = {
  id: string;
  situation: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
  points: number;
};

type Game = {
  id: string;
  title: string;
  scenarios: Scenario[];
};

export default function GamePage() {
  const supabase = createClient();
  const router = useRouter();
  const { game_code } = useParams();
  const { user } = useAuth();

  // State untuk permainan
  const [game, setGame] = useState<Game | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data game dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchGame = async () => {
      if (!game_code) return;
      const { data, error } = await supabase
        .from('games')
        .select(`*, scenarios (*)`)
        .eq('game_code', game_code)
        .single();

      if (error || !data) {
        toast.error('Game tidak ditemukan!');
        router.push('/');
        return;
      }
      setGame(data as Game);
      setIsLoading(false);
    };
    fetchGame();
  }, [game_code, router, supabase]);

  // Fungsi saat jawaban dipilih
  const handleAnswer = (optionKey: string) => {
    if (isAnswered) return;

    setSelectedOption(optionKey);
    setIsAnswered(true);

    const currentScenario = game?.scenarios[currentScenarioIndex];
    if (!currentScenario) return;

    if (optionKey === currentScenario.correct_answer) {
      // Jawaban Benar
      setScore(prev => prev + currentScenario.points);
      toast.success(`Benar! +${currentScenario.points} XP`, { icon: '🎉' });
      // Logika badge bisa ditambahkan di sini
    } else {
      // Jawaban Salah
      setHp(prev => Math.max(0, prev - 20)); // Kurangi 20 HP, minimal 0
      toast.error('Kurang Tepat! -20 HP', { icon: '💔' });
    }

    // Lanjut ke soal berikutnya atau selesaikan game
    setTimeout(() => {
      if (currentScenarioIndex < game.scenarios.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        endGame();
      }
    }, 2000); // Tunggu 2 detik sebelum lanjut
  };
  
  const endGame = async () => {
    if (!user || !game) return;
    toast.loading('Menyimpan hasil...');
    
    // Simpan skor ke tabel scores
    const { data: scoreData, error } = await supabase
        .from('scores')
        .insert({ user_id: user.id, game_id: game.id, score_achieved: score })
        .select()
        .single();
        
    // Update total_xp di profil user (gunakan RPC untuk keamanan)
    // Untuk sekarang kita update langsung
    const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', user.id).single();
    if (profile) {
        await supabase.from('profiles').update({ total_xp: profile.total_xp + score }).eq('id', user.id);
    }
    
    toast.dismiss();
    if (error) {
        toast.error("Gagal menyimpan skor.");
    } else {
        toast.success("Game Selesai!");
        router.push(`/result/${scoreData.id}`);
    }
  };


  if (isLoading) return <div>Loading Game...</div>;
  if (!game) return <div>Game tidak ditemukan.</div>;

  const currentScenario = game.scenarios[currentScenarioIndex];
  const progress = ((currentScenarioIndex + 1) / game.scenarios.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Info Game: HP, Skor, Progress Bar */}
      <div className="flex justify-between items-center mb-4">
        <div>HP: {hp}/100</div>
        <div>Skor: {score} XP</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
        <div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Konten Skenario/Pertanyaan */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{currentScenario.situation}</h2>
        <div className="space-y-3">
          {Object.entries(currentScenario.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                isAnswered && key === currentScenario.correct_answer ? 'bg-green-100 border-green-500' 
                : isAnswered && key === selectedOption ? 'bg-red-100 border-red-500' 
                : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {isAnswered && (
             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold">Penjelasan:</h3>
                <p>{currentScenario.explanation}</p>
            </div>
        )}
      </div>
    </div>
  );
}