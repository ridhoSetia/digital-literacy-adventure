"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/app/_contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Edit3, Save, Gamepad, Trash2, Share2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import GameShareModal from '../_components/GameShareModal';

// Tipe data untuk Profile dan Game
type Profile = {
  username: string;
  total_xp: number;
};

type CreatedGame = {
  id: string;
  title: string;
  game_code: string;
  cover_image_url: string | null;
  play_count: number;
};

export default function ProfilePage() {
    const supabase = createClient();
    const { user } = useAuth();

    // State untuk data
    const [profile, setProfile] = useState<Profile | null>(null);
    const [createdGames, setCreatedGames] = useState<CreatedGame[]>([]);
    
    // State untuk interaksi UI
    const [username, setUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedGame, setSelectedGame] = useState<CreatedGame | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        
        // Ambil data profil dan data game secara bersamaan
        const profilePromise = supabase.from('profiles').select('username, total_xp').eq('id', user.id).single();
        const gamesPromise = supabase.from('games').select('id, title, game_code, cover_image_url, play_count').eq('creator_id', user.id).order('created_at', { ascending: false });

        const [profileResult, gamesResult] = await Promise.all([profilePromise, gamesPromise]);

        if (profileResult.error) {
            toast.error("Gagal memuat profil.");
        } else if (profileResult.data) {
            setProfile(profileResult.data);
            setUsername(profileResult.data.username);
        }

        if (gamesResult.error) {
            toast.error("Gagal memuat game buatanmu.");
        } else {
            setCreatedGames(gamesResult.data as CreatedGame[]);
        }
        
        setLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        if(user) {
            fetchData();
        }
    }, [user, fetchData]);

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || username === profile?.username) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        const { error } = await supabase.rpc('update_username', {
            new_username: username.trim()
        });

        if (error) {
            toast.error(`Gagal: ${error.message}`);
        } else {
            toast.success("Username berhasil diperbarui!");
            await fetchData(); // Muat ulang data untuk menampilkan username baru
            setIsEditing(false);
        }
        setIsSaving(false);
    };
    
    const handleDeleteGame = async (gameId: string, gameTitle: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus game "${gameTitle}"? Aksi ini tidak bisa dibatalkan.`)) {
            const { error } = await supabase.from('games').delete().eq('id', gameId);

            if (error) {
                toast.error("Gagal menghapus game.");
            } else {
                toast.success(`Game "${gameTitle}" berhasil dihapus.`);
                // Hapus game dari state agar UI langsung terupdate
                setCreatedGames(prevGames => prevGames.filter(game => game.id !== gameId));
            }
        }
    };
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (!profile) {
        return <div className="flex h-screen items-center justify-center">Profil tidak ditemukan.</div>;
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* --- Bagian Info Profil --- */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white mb-4">
                            <User size={48} />
                        </div>
                        
                        {isEditing ? (
                            <form onSubmit={handleUpdateUsername} className="w-full max-w-sm">
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="text-2xl font-bold text-center border-b-2 border-primary focus:outline-none w-full"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-4">
                                    <button type="button" onClick={() => { setIsEditing(false); setUsername(profile.username); }} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Batal</button>
                                    <button type="submit" disabled={isSaving} className="flex-1 bg-primary text-white py-2 rounded-lg disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-secondary">
                                        <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
                                    <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-primary p-1 rounded-full">
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                                <p className="text-gray-500 mt-1">{user?.email}</p>
                            </>
                        )}

                        <div className="mt-8 w-full border-t pt-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Statistik Pemain</h2>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">Total Poin Pengalaman (XP)</p>
                                <p className="text-3xl font-bold text-blue-600">{profile.total_xp}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Bagian Game Buatan Saya --- */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <Gamepad />
                        Game Buatan Saya
                    </h2>
                    {createdGames.length > 0 ? (
                        <div className="space-y-4">
                            {createdGames.map((game) => (
                                <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <Image 
                                            src={game.cover_image_url || '/placeholder.png'}
                                            alt={game.title}
                                            width={80}
                                            height={60}
                                            className="rounded-md object-cover flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-lg truncate">{game.title}</p>
                                            <p className="text-sm text-gray-500">{game.play_count} kali dimainkan</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setSelectedGame(game)} className="p-2 text-gray-600 hover:text-primary transition-colors" title="Kelola & Bagikan">
                                            <Share2 size={20} />
                                        </button>
                                        <button onClick={() => handleDeleteGame(game.id, game.title)} className="p-2 text-gray-600 hover:text-red-500 transition-colors" title="Hapus Game">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">
                            <p>Anda belum membuat game.</p>
                            <Link href="/create" className="text-primary font-semibold hover:underline mt-2 inline-block">Ayo buat sekarang!</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal untuk menampilkan kode dan QR */}
            {selectedGame && (
                <GameShareModal 
                    isOpen={!!selectedGame}
                    onClose={() => setSelectedGame(null)}
                    gameCode={selectedGame.game_code}
                    shareLink={`${window.location.origin}/play/${selectedGame.game_code}`}
                />
            )}
        </>
    );
}