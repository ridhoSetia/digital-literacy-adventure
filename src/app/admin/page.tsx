"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Loader2, Eye } from 'lucide-react';
import GameReviewModal from '../_components/GameReviewModal';

// Tipe data yang paling aman, mengikuti apa kata TypeScript (array)
type Report = {
    id: string;
    reason: string | null;
    status: string;
    games: { id: string; title: string; game_code: string; }[] | null;
};

export default function AdminDashboard() {
    const supabase = createClient();
    const { user } = useAuth();
    const router = useRouter();

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [reviewingGameCode, setReviewingGameCode] = useState<string | null>(null);

    const fetchAdminData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            toast.error("Hanya admin yang dapat mengakses halaman ini.");
            router.push('/');
            return;
        }
        setIsAdmin(true);
        const { data: reportData, error } = await supabase
            .from('reports')
            .select(`id, reason, status, games (id, title, game_code)`)
            .eq('status', 'pending');

        if (error) {
            toast.error("Gagal memuat laporan.");
        } else {
            setReports(reportData as any);
        }
        setLoading(false);
    }, [user, router, supabase]);

    useEffect(() => {
        if (user) {
            fetchAdminData();
        } else if (user === null) {
            toast.error("Akses ditolak. Silakan login.");
            router.push('/');
        }
    }, [user, router, fetchAdminData]);

    const handleDismissReport = async (reportId: string, gameId: string) => {
        await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
        await supabase.from('games').update({ is_under_review: false }).eq('id', gameId);
        toast.success("Laporan diabaikan dan game dikembalikan.");
        setReports(reports.filter(r => r.id !== reportId));
    };

    const handleDeleteGame = async (gameId: string, reportId: string) => {
        if (!window.confirm("Apakah Anda yakin ingin MENGHAPUS game ini secara permanen? Aksi ini tidak bisa dibatalkan.")) {
            return;
        }

        const { error } = await supabase.from('games').delete().eq('id', gameId);

        if (error) {
            toast.error(`Gagal menghapus game: ${error.message}`);
        } else {
            await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
            toast.success("Game berhasil dihapus secara permanen.");
            setReports(reports.filter(r => r.id !== reportId));
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-violet-400" /></div>;
    }
    if (!isAdmin) { return null; }

    return (
        <>
            <div className="min-h-screen text-white pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <h1 className="text-4xl font-bold mb-8 font-display tracking-wider text-center">Dashboard Admin - Laporan Game</h1>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 rounded-xl shadow-lg p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Laporan Game Tertunda</h2>
                        <div className="space-y-4">
                            {reports.length > 0 ? (
                                reports.map(report => {
                                    if (!report.games) return null;
                                    const game = Array.isArray(report.games) ? report.games[0] : report.games;
                                    if (!game) return null;

                                    return (
                                        <div key={report.id} className="bg-slate-800/50 p-4 border border-slate-700 rounded-lg shadow-sm">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-lg text-gray-100">
                                                        <Link href={`/play/${game.game_code}`} className="hover:underline text-violet-400" target="_blank" rel="noopener noreferrer">
                                                            {game.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-gray-400 mt-2"><b className="text-gray-300">Alasan Laporan:</b> {report.reason || 'Tidak ada alasan.'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                                    <button
                                                        onClick={() => setReviewingGameCode(game.game_code)}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> Review
                                                    </button>
                                                    <button
                                                        onClick={() => handleDismissReport(report.id, game.id)}
                                                        className="bg-slate-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-slate-700 transition"
                                                    >
                                                        Abaikan
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGame(game.id, report.id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 transition"
                                                    >
                                                        Hapus Game
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-gray-500 p-8 border-2 border-dashed border-slate-700 rounded-lg">
                                    <p>Tidak ada laporan yang perlu ditinjau.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <GameReviewModal isOpen={!!reviewingGameCode} onClose={() => setReviewingGameCode(null)} gameCode={reviewingGameCode} />
        </>
    );
}