"use client";

import { Trophy, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Komponen ini sekarang menerima prop 'onJoinGameClick'
export default function QuickActionsSection({ onJoinGameClick }: { onJoinGameClick: () => void }) {
    const router = useRouter();

    return (
        <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold mb-8">Mulai Sekarang</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <button onClick={() => router.push('/leaderboard')} className="card-hover text-left bg-white border-2 border-primary p-8 rounded-xl">
                        <Trophy className="text-3xl text-accent mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Lihat Leaderboard</h3>
                        <p className="text-gray-600">Cek ranking pemain terbaik</p>
                    </button>
                    {/* Tombol ini sekarang memanggil fungsi dari prop */}
                    <button onClick={onJoinGameClick} className="card-hover text-left bg-white border-2 border-primary p-8 rounded-xl">
                        <QrCode className="text-3xl text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Join Game</h3>
                        <p className="text-gray-600">Masukkan kode atau scan QR</p>
                    </button>
                </div>
            </div>
        </section>
    );
}