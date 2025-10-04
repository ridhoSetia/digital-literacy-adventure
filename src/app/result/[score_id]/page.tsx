"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Award, Trophy, ArrowLeft } from 'lucide-react';
import Confetti from 'react-confetti';

// Tipe untuk data hasil skor
type ResultData = {
  score_achieved: number;
  games: {
    title: string;
  }[] | null;
};

// Fungsi untuk menentukan kategori berdasarkan skor
const getScoreCategory = (score: number) => {
  if (score < 50) return { name: 'Pemula Digital', color: 'text-gray-400' };
  if (score < 100) return { name: 'Penjelajah Cerdas', color: 'text-cyan-400' };
  return { name: 'Master Literasi', color: 'text-yellow-400' };
};

export default function ResultPage() {
    const router = useRouter();
    const { score_id } = useParams();
    const supabase = createClient();

    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);

        const fetchResult = async () => {
            if (!score_id) return;

            const { data, error } = await supabase
                .from('scores')
                .select(`
                    score_achieved,
                    games ( title )
                `)
                .eq('id', score_id)
                .single();

            if (error || !data) {
                console.error("Error fetching result:", error);
                router.push('/');
            } else {
                setResult(data as ResultData);
            }
            setLoading(false);
        };

        fetchResult();
    }, [score_id, router, supabase]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen text-white">Memuat hasil...</div>;
    }

    if (!result) {
        return <div className="flex justify-center items-center h-screen text-white">Hasil tidak ditemukan.</div>;
    }

    const category = getScoreCategory(result.score_achieved);

    return (
        <>
            {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
            {/* Latar belakang diubah agar sesuai tema */}
            <div className="min-h-screen flex items-center justify-center p-4 pt-20">
                {/* Kartu utama diubah ke style gelap */}
                <div className="bg-slate-900/70 backdrop-blur-sm border border-violet-700 rounded-2xl shadow-2xl shadow-violet-500/20 p-8 max-w-2xl w-full text-center">
                    <Award className="mx-auto h-20 w-20 text-yellow-400 mb-4" />
                    <h1 className="text-4xl font-extrabold text-white mb-2 font-display tracking-wider">Selamat!</h1>
                    <p className="text-gray-400 mb-6">
                        Anda telah menyelesaikan game "{result.games?.[0]?.title || 'ini'}" dengan gemilang.
                    </p>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                        <p className="text-sm text-gray-400 font-pixel">SKOR AKHIR ANDA</p>
                        <p className="text-7xl font-bold text-cyan-400 my-2 font-pixel drop-shadow-lg">{result.score_achieved}</p>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${category.color}`}>
                            {category.name}
                        </div>
                    </div>

                    <h3 className="text-white text-lg font-semibold mb-4 font-display tracking-wide">Langkah Selanjutnya?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/game" className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-transform transform hover:-translate-y-1">
                            <ArrowLeft size={18} /> Kembali ke Daftar Game
                        </Link>
                         <Link href="/leaderboard" className="flex items-center justify-center gap-2 w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-transform transform hover:-translate-y-1">
                           <Trophy size={18} /> Lihat Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}