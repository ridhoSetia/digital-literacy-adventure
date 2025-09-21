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
  if (score < 50) return { name: 'Pemula Digital', color: 'text-gray-500' };
  if (score < 100) return { name: 'Penjelajah Cerdas', color: 'text-blue-500' };
  return { name: 'Master Literasi', color: 'text-amber-500' };
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
        return <div className="flex justify-center items-center h-screen">Memuat hasil...</div>;
    }

    if (!result) {
        return <div className="flex justify-center items-center h-screen">Hasil tidak ditemukan.</div>;
    }

    const category = getScoreCategory(result.score_achieved);

    return (
        <>
            {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center transform transition-all hover:scale-105 duration-500">
                    <Award className="mx-auto h-20 w-20 text-amber-400 mb-4" />
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Selamat!</h1>
                    <p className="text-gray-600 mb-6">
                        Anda telah menyelesaikan game "{result.games?.[0]?.title || 'ini'}" dengan gemilang.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                        <p className="text-sm text-gray-500">SKOR AKHIR ANDA</p>
                        <p className="text-7xl font-bold text-primary my-2">{result.score_achieved}</p>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${category.color} bg-opacity-10 ${category.color.replace('text-', 'bg-')}`}>
                            {category.name}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Langkah Selanjutnya?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/game" className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-transform transform hover:-translate-y-1">
                            <ArrowLeft size={18} /> Kembali ke Daftar Game
                        </Link>
                         <Link href="/leaderboard" className="flex items-center justify-center gap-2 w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-transform transform hover:-translate-y-1">
                           <Trophy size={18} /> Lihat Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}