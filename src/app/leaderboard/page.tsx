import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Trophy } from 'lucide-react';

async function getLeaderboardData() {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from('profiles')
        .select('username, total_xp')
        .neq('role', 'admin')
        .order('total_xp', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
    return data;
}

export default async function LeaderboardPage() {
    const leaderboardData = await getLeaderboardData();

    // Fungsi untuk menentukan warna border berdasarkan peringkat
    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'border-yellow-400 shadow-yellow-400/30'; // Emas
            case 1: return 'border-slate-400 shadow-slate-400/30'; // Perak
            case 2: return 'border-amber-600 shadow-amber-600/30'; // Perunggu
            default: return 'border-slate-700';
        }
    };

    return (
        // Menambahkan padding atas dan memastikan min-height
        <div className="min-h-screen pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Mengubah style kartu utama */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 rounded-xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3 font-display tracking-wider text-white">
                        <Trophy className="text-yellow-400 drop-shadow-lg" size={32} />
                        Papan Peringkat
                    </h1>
                    <div className="space-y-4">
                        {leaderboardData && leaderboardData.length > 0 ? (
                            leaderboardData.map((player, index) => (
                                <div 
                                  key={index} 
                                  // Mengubah style setiap baris peringkat
                                  className={`flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border-2 shadow-md transition-all duration-300 hover:bg-slate-800 ${getRankColor(index)}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold text-xl w-8 text-center font-pixel ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{index + 1}</span>
                                        <span className="font-semibold text-lg text-gray-200">{player.username}</span>
                                    </div>
                                    <span className="text-cyan-400 font-bold font-pixel text-lg">{player.total_xp.toLocaleString('id-ID')} XP</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Belum ada pemain di papan peringkat.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}