"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/_contexts/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

// --- Tipe Data (Tidak Diubah) ---
type Scenario = {
    id: string;
    situation: string;
    question: string | null;
    options: { [key: string]: string };
    correct_answer: string;
    explanation: string;
    points: number;
    highlight_phrase: string | null;
    answer_time: number;
    image_url: string | null;
};
type Game = {
    id: string;
    title: string;
    game_type: 'quiz' | 'story';
    scenarios: Scenario[];
};

// --- Komponen Tambahan (Styling Diperbarui) ---
const Timer = ({ duration, onTimeUp }: { duration: number, onTimeUp: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    useEffect(() => {
        if (timeLeft <= 0) { onTimeUp(); return; }
        const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);
    return <div className="font-pixel text-lg font-semibold text-yellow-400">Waktu: {timeLeft}s</div>;
};

const HighlightedText = ({ text, highlight }: { text: string, highlight: string | null }) => {
    if (!highlight || !text) return <>{text}</>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (<span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <mark key={i} className="bg-yellow-400 text-black px-1 rounded">{part}</mark> : part)}</span>);
};


// --- Komponen Utama Game Player ---
export default function GamePlayer({ gameCode, isReviewMode = false }: { gameCode: string, isReviewMode?: boolean }) {
    const supabase = createClient();
    const router = useRouter();
    const { user } = useAuth();

    const [game, setGame] = useState<Game | null>(null);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [hp, setHp] = useState(100);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewState, setViewState] = useState<'reading' | 'answering' | 'feedback'>('reading');
    const currentScenario = game?.scenarios[currentScenarioIndex];
    const [isGameFinished, setIsGameFinished] = useState(false); // PENAMBAHAN BARU

    useEffect(() => {
        const fetchGameAndCheckCompletion = async () => {
            if (!gameCode) return; // PENAMBAHAN: Hapus dependensi user
            setIsLoading(true);
            const { data: gameData, error: gameError } = await supabase.from('games').select(`*, scenarios (*)`).eq('game_code', gameCode).single();
            if (gameError || !gameData) { toast.error('Game tidak ditemukan!'); if (!isReviewMode) { router.push('/game'); } return; }

            // PENAMBAHAN: Logika ini hanya berjalan jika BUKAN mode review
            if (!isReviewMode && user) {
                const { data: existingScore } = await supabase.from('scores').select('id').eq('user_id', user.id).eq('game_id', gameData.id).maybeSingle();
                if (existingScore) { toast.error('Anda sudah menyelesaikan game ini!', { duration: 4000 }); router.push(`/result/${existingScore.id}`); return; }
            }

            setGame(gameData as Game);
            if (gameData.game_type === 'quiz') setViewState('answering');
            setIsLoading(false);
        };

        // PENAMBAHAN: Logika diperbarui untuk memperbolehkan mode review tanpa user
        if (isReviewMode || user) {
            fetchGameAndCheckCompletion();
        } else if (user === null && !isReviewMode) {
            toast.error("Anda harus login untuk bermain.");
            router.push('/');
        }
    }, [gameCode, user, router, supabase, isReviewMode]);

    const handleAnswer = useCallback((optionKey: string | null) => {
        if (isAnswered) return;
        setSelectedOption(optionKey);
        setIsAnswered(true);
        if (game?.game_type === 'story') setViewState('feedback');

        // PENAMBAHAN BARU: Jika mode review, jangan hitung skor atau HP
        if (isReviewMode) return;

        const points = currentScenario?.points || 0;
        if (optionKey === currentScenario?.correct_answer) {
            setScore(prev => prev + points);
            toast.success(`Benar! +${points} XP`, { icon: '🎉' });
        } else {
            setHp(prev => Math.max(0, prev - 20));
            toast.error(optionKey ? 'Kurang Tepat! -20 HP' : 'Waktu Habis! -20 HP', { icon: '💔' });
        }
    }, [isAnswered, currentScenario, game?.game_type, isReviewMode]);

    const nextStep = () => {
        if (currentScenarioIndex < game!.scenarios.length - 1) {
            setCurrentScenarioIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOption(null);
            if (game?.game_type === 'story') setViewState('reading');
        } else {
            endGame();
        }
    };

    const endGame = async () => {
        // PENAMBAHAN BARU: Logika untuk mode review
        if (isReviewMode) {
            setIsGameFinished(true); // Cukup set status selesai untuk menonaktifkan tombol
            toast.success("Review Selesai.");
            return;
        }

        if (!user || !game) return;
        toast.loading('Menyimpan hasil...');
        const { data: scoreData, error: scoreError } = await supabase.from('scores').insert({ user_id: user.id, game_id: game.id, score_achieved: score }).select('id').single();
        if (scoreError) { toast.dismiss(); toast.error("Gagal menyimpan sesi permainan."); return; }
        await supabase.rpc('increment_play_count', { game_id_input: game.id });
        const { error: rpcError } = await supabase.rpc('increment_xp', { user_id_input: user.id, xp_to_add: score });
        toast.dismiss();
        if (rpcError) { toast.error("Gagal memperbarui total XP Anda."); }
        else { toast.success("Game Selesai!"); router.push(`/result/${scoreData.id}`); }
    };

    if (isLoading || !currentScenario) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-violet-400" /></div>;
    const progress = ((currentScenarioIndex + 1) / game!.scenarios.length) * 100;

    const QuizView = () => (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg">
            {currentScenario.image_url && (
                <div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden border-2 border-slate-700">
                    <Image src={currentScenario.image_url} alt="Gambar Skenario" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4 font-display tracking-wider">{currentScenario.situation}</h2>
            <div className="space-y-3">{Object.entries(currentScenario.options).map(([key, value]) => (<button key={key} onClick={() => handleAnswer(key)} disabled={isAnswered} className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                ${isAnswered && key === currentScenario.correct_answer ? 'bg-green-900/50 border-green-500' : ''} 
                ${isAnswered && key === selectedOption && key !== currentScenario.correct_answer ? 'bg-red-900/50 border-red-500' : ''} 
                ${!isAnswered ? 'bg-slate-800/50 border-slate-700 hover:bg-violet-900/50 hover:border-violet-600' : 'border-slate-700'}`}>{value}</button>))}
            </div>
            {isAnswered && (
                <div className="mt-6 animate-fade-in">
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <h3 className="font-bold font-display tracking-wide text-yellow-400">Penjelasan:</h3>
                        <p className="text-gray-300">{currentScenario.explanation}</p>
                    </div>
                    <button onClick={nextStep} className="w-full mt-4 bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2">
                        {currentScenarioIndex < game!.scenarios.length - 1 ? 'Lanjut ke Pertanyaan Berikutnya' : 'Lihat Hasil Akhir'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );

    const StoryView = () => (
        <>
            {viewState !== 'answering' && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg mb-6">
                    {currentScenario.image_url && (<div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden border-2 border-slate-700"><Image src={currentScenario.image_url} alt="Gambar Narasi" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" /></div>)}
                    <p className="text-lg leading-relaxed text-gray-300"><HighlightedText text={currentScenario.situation} highlight={viewState === 'feedback' ? currentScenario.highlight_phrase : null} /></p>
                </div>
            )}
            {viewState === 'reading' && (<button onClick={() => setViewState('answering')} className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition">Lanjut untuk Menjawab</button>)}
            {viewState === 'answering' && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 font-display tracking-wider">{currentScenario.question}</h2>
                    <div className="space-y-3">{Object.entries(currentScenario.options).map(([key, value]) => (<button key={key} onClick={() => handleAnswer(key)} className="w-full text-left p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700 hover:bg-violet-900/50 hover:border-violet-600 transition-colors">{value}</button>))}</div>
                </div>
            )}
            {viewState === 'feedback' && (
                <div>
                    <div className={`p-4 rounded-lg mb-4 text-center font-bold font-pixel text-lg ${selectedOption === currentScenario.correct_answer ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {selectedOption === currentScenario.correct_answer ? 'Jawaban Benar!' : (selectedOption === null ? 'Waktu Habis!' : 'Jawaban Kurang Tepat!')}
                    </div>
                    <p className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg mb-4 text-gray-300"><b>Penjelasan:</b> {currentScenario.explanation}</p>
                    <button onClick={nextStep} className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition">{currentScenarioIndex < game.scenarios.length - 1 ? 'Lanjut ke Skenario Berikutnya' : 'Lihat Hasil Akhir'}</button>
                </div>
            )}
        </>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24 min-h-screen">
            {/* PENAMBAHAN: Menyembunyikan UI game jika mode review */}
            {!isReviewMode && (
                <>
                    <div className="flex justify-between items-center mb-4 text-gray-700">
                        <div className="font-pixel text-white">HP: {hp}/100</div>
                        {game!.game_type === 'story' && viewState === 'answering' && !isAnswered && <Timer duration={currentScenario.answer_time || 15} onTimeUp={() => handleAnswer(null)} />}
                        <div className="font-pixel text-white">Skor: {score} XP</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                        <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </>
            )}
            {game!.game_type === 'quiz' ? <QuizView /> : <StoryView />}
        </div>
    );
}