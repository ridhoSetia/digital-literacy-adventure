"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/_contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

// --- Tipe Data (Diperbarui untuk mendukung kedua mode) ---
type Scenario = {
  id: string;
  situation: string; // Narasi untuk mode cerita ATAU pertanyaan untuk mode kuis
  question: string | null; // Pertanyaan spesifik untuk mode cerita
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
  points: number;
  highlight_phrase: string | null; // Teks yang akan distabilo di mode cerita
  answer_time: number; // Waktu menjawab per skenario
};

type Game = {
  id: string;
  title: string;
  game_type: 'quiz' | 'story'; // Membedakan tipe game
  scenarios: Scenario[];
};

// --- Komponen Tambahan ---

// Komponen Timer untuk mode cerita
const Timer = ({ duration, onTimeUp }: { duration: number, onTimeUp: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  return (
    <div className="font-mono text-lg font-semibold text-gray-700">
      Waktu: {timeLeft}s
    </div>
  );
};

// Komponen untuk menyorot teks (stabilo)
const HighlightedText = ({ text, highlight }: { text: string, highlight: string | null }) => {
  if (!highlight || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 px-1 rounded">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export default function GamePage() {
  const supabase = createClient();
  const router = useRouter();
  const { game_code } = useParams();
  const { user } = useAuth();

  // --- State Management ---
  const [game, setGame] = useState<Game | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<'reading' | 'answering' | 'feedback'>('reading');

  const currentScenario = game?.scenarios[currentScenarioIndex];

  // --- Logika Fetch & Inisialisasi Game ---
  useEffect(() => {
    const fetchGameAndCheckCompletion = async () => {
      if (!game_code || !user) return;

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`*, scenarios (*)`)
        .eq('game_code', game_code)
        .single();

      if (gameError || !gameData) {
        toast.error('Game tidak ditemukan!');
        router.push('/game');
        return;
      }

      const { data: existingScore } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', gameData.id)
        .maybeSingle();

      if (existingScore) {
        toast.error('Anda sudah menyelesaikan game ini!', { duration: 4000 });
        router.push(`/result/${existingScore.id}`);
        return;
      }

      setGame(gameData as Game);
      if (gameData.game_type === 'quiz') {
        setViewState('answering'); // Mode kuis langsung ke sesi tanya jawab
      }
      setIsLoading(false);
    };

    if (user) {
      fetchGameAndCheckCompletion();
    } else if (user === null) {
      toast.error("Anda harus login untuk bermain.");
      router.push('/');
    }
  }, [game_code, user, router, supabase]);

  // --- Logika Inti Permainan ---
  const handleAnswer = useCallback((optionKey: string | null) => {
    if (isAnswered) return;

    setSelectedOption(optionKey);
    setIsAnswered(true);
    if (game?.game_type === 'story') {
      setViewState('feedback');
    }

    const points = currentScenario?.points || 0;
    if (optionKey === currentScenario?.correct_answer) {
      setScore(prev => prev + points);
      toast.success(`Benar! +${points} XP`, { icon: '🎉' });
    } else {
      setHp(prev => Math.max(0, prev - 20));
      toast.error(optionKey ? 'Kurang Tepat! -20 HP' : 'Waktu Habis! -20 HP', { icon: '💔' });
    }
    
    // setTimeout otomatis telah dihapus
  }, [isAnswered, currentScenario, game?.game_type]);

  const nextStep = () => {
    if (currentScenarioIndex < game!.scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      if (game?.game_type === 'story') {
        setViewState('reading');
      }
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    if (!user || !game) return;
    toast.loading('Menyimpan hasil...');

    const { data: scoreData, error: scoreError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        game_id: game.id,
        score_achieved: score
      })
      .select('id')
      .single();

    if (scoreError) {
      toast.dismiss();
      toast.error("Gagal menyimpan sesi permainan.");
      return;
    }

    const { error: playCountError } = await supabase.rpc('increment_play_count', {
      game_id_input: game.id
    });

    if (playCountError) {
      console.error("Failed to increment play count:", playCountError);
    }

    const { error: rpcError } = await supabase.rpc('increment_xp', {
      user_id_input: user.id,
      xp_to_add: score
    });

    toast.dismiss();
    if (rpcError) {
      toast.error("Gagal memperbarui total XP Anda.");
    } else {
      toast.success("Game Selesai!");
      router.push(`/result/${scoreData.id}`);
    }
  };


  // --- Logika Tampilan (Render Logic) ---
  if (isLoading || !currentScenario) {
    return <div className="flex h-screen items-center justify-center">Loading Game...</div>;
  }

  const progress = ((currentScenarioIndex + 1) / game.scenarios.length) * 100;

  // Tampilan Mode Kuis
  const QuizView = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{currentScenario.situation}</h2>
      <div className="space-y-3">
        {Object.entries(currentScenario.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleAnswer(key)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-lg border-2 transition ${isAnswered && key === currentScenario.correct_answer ? 'bg-green-100 border-green-500'
              : isAnswered && key === selectedOption ? 'bg-red-100 border-red-500'
                : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
          >
            {value}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-6 animate-fade-in">
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold">Penjelasan:</h3>
                <p>{currentScenario.explanation}</p>
            </div>
            <button 
                onClick={nextStep} 
                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center gap-2"
            >
                {currentScenarioIndex < game!.scenarios.length - 1 ? 'Lanjut ke Pertanyaan Berikutnya' : 'Lihat Hasil Akhir'}
                <ArrowRight size={18} />
            </button>
        </div>
      )}
    </div>
  );

  // Tampilan Mode Cerita
  const StoryView = () => (
    <>
      {viewState !== 'answering' && (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
          <p className="text-lg leading-relaxed">
            <HighlightedText text={currentScenario.situation} highlight={viewState === 'feedback' ? currentScenario.highlight_phrase : null} />
          </p>
        </div>
      )}

      {viewState === 'reading' && (
        <button onClick={() => setViewState('answering')} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition">
          Lanjut untuk Menjawab
        </button>
      )}

      {viewState === 'answering' && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{currentScenario.question}</h2>
          <div className="space-y-3">
            {Object.entries(currentScenario.options).map(([key, value]) => (
              <button key={key} onClick={() => handleAnswer(key)} className="w-full text-left p-4 rounded-lg border-2 hover:bg-blue-50">
                {value}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewState === 'feedback' && (
        <div>
          <div className={`p-4 rounded-lg mb-4 text-center font-bold ${selectedOption === currentScenario.correct_answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {selectedOption === currentScenario.correct_answer ? 'Jawaban Benar!' : (selectedOption === null ? 'Waktu Habis!' : 'Jawaban Kurang Tepat!')}
          </div>
          <p className="p-4 bg-gray-100 rounded-lg mb-4"><b>Penjelasan:</b> {currentScenario.explanation}</p>
          <button onClick={nextStep} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition">
            {currentScenarioIndex < game.scenarios.length - 1 ? 'Lanjut ke Skenario Berikutnya' : 'Lihat Hasil Akhir'}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Info Game (HP, Skor, Progress) */}
      <div className="flex justify-between items-center mb-4 text-gray-700">
        <div className="font-bold">HP: {hp}/100</div>
        {game.game_type === 'story' && viewState === 'answering' && !isAnswered &&
          <Timer duration={currentScenario.answer_time || 15} onTimeUp={() => handleAnswer(null)} />
        }
        <div className="font-bold">Skor: {score} XP</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
        <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Render Tampilan Berdasarkan Tipe Game */}
      {game.game_type === 'quiz' ? <QuizView /> : <StoryView />}
    </div>
  );
}