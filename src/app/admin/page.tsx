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
            setReports(reportData as any); // Gunakan 'as any' untuk sementara bypass error TS yang membingungkan
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
        // 1. Ubah status laporan menjadi 'dismissed'
        await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
        // 2. Kembalikan status game menjadi tidak 'under review' agar muncul lagi
        await supabase.from('games').update({ is_under_review: false }).eq('id', gameId);

        toast.success("Laporan diabaikan dan game dikembalikan.");
        // Hapus laporan dari tampilan UI
        setReports(reports.filter(r => r.id !== reportId));
    };

    const handleDeleteGame = async (gameId: string, reportId: string) => {
        if (!window.confirm("Apakah Anda yakin ingin MENGHAPUS game ini secara permanen? Aksi ini tidak bisa dibatalkan.")) {
            return;
        }

        // 1. Hapus game dari tabel 'games' (RLS sudah memperbolehkan admin)
        const { error } = await supabase.from('games').delete().eq('id', gameId);

        if (error) {
            toast.error(`Gagal menghapus game: ${error.message}`);
        } else {
            // 2. Jika berhasil, ubah status laporan menjadi 'resolved'
            await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
            toast.success("Game berhasil dihapus secara permanen.");
            // Hapus laporan dari tampilan UI
            setReports(reports.filter(r => r.id !== reportId));
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }
    if (!isAdmin) { return null; }

    return (
        <>
            <div className="max-w-7xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6">Dashboard Admin - Laporan Game</h1>
                <div className="space-y-4">
                    {reports.length > 0 ? (
                        reports.map(report => {
                            // --- LOGIKA ANTI-ERROR DIMULAI DI SINI ---

                            // 1. Cek apakah report.games ada isinya.
                            if (!report.games) {
                                return null;
                            }

                            // 2. Logika Kunci: Cek apakah 'games' itu array atau objek.
                            //    Apapun bentuknya, ambil objek game yang benar.
                            const game = Array.isArray(report.games) ? report.games[0] : report.games;

                            // 3. Pengecekan keamanan terakhir, jika game tetap tidak ada.
                            if (!game) {
                                return null;
                            }

                            return (
                                <div key={report.id} className="bg-white p-4 border rounded-lg shadow-sm">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg">
                                                <Link href={`/play/${game.game_code}`} className="hover:underline text-primary" target="_blank" rel="noopener noreferrer">
                                                    {game.title}
                                                </Link>
                                            </h3>
                                            <p className="text-gray-600 mt-2"><b>Alasan Laporan:</b> {report.reason || 'Tidak ada alasan.'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">                                            <button
                                            onClick={() => setReviewingGameCode(game.game_code)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600 flex items-center gap-1.5"
                                        >
                                            <Eye size={14} /> Review
                                        </button>

                                            {/* Pastikan onClick memanggil fungsi yang benar */}
                                            <button
                                                onClick={() => handleDismissReport(report.id, game.id)}
                                                className="bg-gray-200 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300"
                                            >
                                                Abaikan
                                            </button>

                                            {/* Pastikan onClick memanggil fungsi yang benar */}
                                            <button
                                                onClick={() => handleDeleteGame(game.id, report.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600"
                                            >
                                                Hapus Game
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">
                            <p>Tidak ada laporan yang perlu ditinjau.</p>
                        </div>
                    )}
                </div>
            </div>

            <GameReviewModal isOpen={!!reviewingGameCode} onClose={() => setReviewingGameCode(null)} gameCode={reviewingGameCode} />
        </>
    );
}