// Jadikan ini server component untuk fetch data awal
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function getLeaderboardData() {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from('profiles')
        .select('username, total_xp')
        .order('total_xp', { ascending: false })
        .limit(10); // Ambil 10 teratas
    return data;
}

export default async function LeaderboardPage() {
    const leaderboardData = await getLeaderboardData();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Leaderboard</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <ul className="space-y-4">
                    {leaderboardData?.map((player, index) => (
                        <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="font-bold">#{index + 1} {player.username}</span>
                            <span className="text-primary font-semibold">{player.total_xp} XP</span>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Tambahkan UI untuk filter Creator Leaderboard di sini */}
        </div>
    );
}