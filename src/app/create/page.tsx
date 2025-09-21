"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Save, Trash2 } from 'lucide-react';
// ... import komponen lain seperti GameShareModal jika ada

type Scenario = {
  id: number;
  situation: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: string;
  points: number;
  explanation: string;
};

export default function CreateGamePage() {
    const supabase = createClient();
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scenarios, setScenarios] = useState<Scenario[]>([
        { id: 1, situation: '', options: { a: '', b: '', c: '', d: '' }, correct_answer: '', points: 20, explanation: '' }
    ]);
    const [loading, setLoading] = useState(false);
    
    // Function untuk add, remove, update scenario
    // ...
    
    const handleSaveGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Anda harus login untuk membuat game.');
            return;
        }
        setLoading(true);

        const gameCode = `DIGI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 1. Insert ke tabel 'games'
        const { data: gameData, error: gameError } = await supabase
            .from('games')
            .insert({
                creator_id: user.id,
                title,
                description,
                game_code: gameCode,
            })
            .select()
            .single();

        if (gameError) {
            toast.error(`Gagal menyimpan game: ${gameError.message}`);
            setLoading(false);
            return;
        }

        // 2. Insert ke tabel 'scenarios'
        const scenariosToInsert = scenarios.map(s => ({
            game_id: gameData.id,
            situation: s.situation,
            options: s.options, // Simpan sebagai JSON
            correct_answer: s.correct_answer,
            explanation: s.explanation,
            points: s.points,
        }));
        
        const { error: scenariosError } = await supabase.from('scenarios').insert(scenariosToInsert);
        
        if (scenariosError) {
            toast.error(`Gagal menyimpan skenario: ${scenariosError.message}`);
            // Anda mungkin ingin menghapus game yang sudah dibuat jika skenario gagal
        } else {
            toast.success('Game berhasil dibuat!');
            // Tampilkan modal share dengan gameCode dan link
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-8">Buat Game Literasi Digital</h2>
                    <form onSubmit={handleSaveGame} className="space-y-6">
                        {/* Form input untuk Judul & Deskripsi */}
                        
                        {/* Mapping untuk render setiap scenario item */}
                        {scenarios.map((scenario, index) => (
                            <div key={scenario.id} className="scenario-item bg-gray-50 p-6 rounded-lg mb-4">
                                {/* ... semua input untuk satu scenario */}
                            </div>
                        ))}
                        
                        <div className="flex justify-end space-x-4">
                             <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition flex items-center gap-2">
                                <Save size={18} /> Simpan Game
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}