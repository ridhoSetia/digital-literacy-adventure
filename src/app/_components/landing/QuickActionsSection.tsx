"use client";

import { Trophy, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActionsSection({ onJoinGameClick }: { onJoinGameClick: () => void }) {
    const router = useRouter();

    return (
        <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold mb-10 font-display tracking-wider">Mulai Sekarang</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <button 
                        onClick={() => router.push('/leaderboard')} 
                        className="h-full group text-left bg-slate-900/50 border border-indigo-700 p-8 rounded-xl transition-all duration-300 hover:border-yellow-400 hover:bg-slate-900 hover:shadow-2xl hover:shadow-yellow-400/20"
                    >
                        <Trophy className="text-4xl text-yellow-400 mb-4 transition-transform group-hover:scale-110" />
                        <h3 className="text-xl font-semibold mb-2 font-pixel">Leaderboard</h3>
                        <p className="text-gray-400">Cek ranking pemain terbaik.</p>
                    </button>
                    <button 
                        onClick={onJoinGameClick} 
                        className="h-full group text-left bg-slate-900/50 border border-indigo-700 p-8 rounded-xl transition-all duration-300 hover:border-green-400 hover:bg-slate-900 hover:shadow-2xl hover:shadow-green-400/20"
                    >
                        <QrCode className="text-4xl text-green-400 mb-4 transition-transform group-hover:scale-110" />
                        <h3 className="text-xl font-semibold mb-2 font-pixel">Join Game</h3>
                        <p className="text-gray-400">Masukkan kode atau scan QR.</p>
                    </button>
                </div>
            </div>
        </section>
    );
}