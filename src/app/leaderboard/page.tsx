import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Trophy } from 'lucide-react';

async function getLeaderboardData() {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from('profiles')
        .select('username, total_xp')
        .neq('role', 'admin') // <-- TAMBAHKAN FILTER INI
        .order('total_xp', { ascending: false })
        .limit(10); // Ambil 10 pemain teratas

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
    return data;
}

export default async function LeaderboardPage() {
    const leaderboardData = await getLeaderboardData();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                    <Trophy className="text-yellow-500" />
                    Papan Peringkat
                </h1>
                <div className="space-y-4">
                    {leaderboardData && leaderboardData.length > 0 ? (
                        leaderboardData.map((player, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg w-8 text-center">{index + 1}</span>
                                    <span className="font-semibold">{player.username}</span>
                                </div>
                                <span className="text-primary font-bold">{player.total_xp.toLocaleString('id-ID')} XP</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">Belum ada pemain di papan peringkat.</p>
                    )}
                </div>
            </div>
        </div>
    );
}