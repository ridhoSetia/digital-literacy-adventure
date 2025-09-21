"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import GameShareModal from '../_components/GameShareModal';

// Tipe data yang lebih fleksibel untuk form
type ScenarioOption = { [key: string]: string };

type Scenario = {
  situation: string;
  options: ScenarioOption;
  correct_answer: string;
  points: number;
  explanation: string;
};

export default function CreateGamePage() {
    const supabase = createClient();
    const { user } = useAuth();
    const router = useRouter();
    
    // State untuk form utama
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scenarios, setScenarios] = useState<Scenario[]>([
        { situation: '', options: { 'A': '', 'B': '' }, correct_answer: 'A', points: 20, explanation: '' }
    ]);
    
    // State untuk UI
    const [loading, setLoading] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [createdGameData, setCreatedGameData] = useState({ gameCode: '', shareLink: '' });

    // --- LOGIKA MANAJEMEN SKENARIO ---

    const addScenario = () => {
        setScenarios([...scenarios, { situation: '', options: { 'A': '', 'B': '' }, correct_answer: 'A', points: 20, explanation: '' }]);
    };

    const removeScenario = (index: number) => {
        const newScenarios = scenarios.filter((_, i) => i !== index);
        setScenarios(newScenarios);
    };

    const handleScenarioChange = (index: number, field: keyof Scenario, value: any) => {
        const newScenarios = [...scenarios];
        newScenarios[index] = { ...newScenarios[index], [field]: value };
        setScenarios(newScenarios);
    };

    const handleOptionChange = (scenarioIndex: number, optionKey: string, value: string) => {
        const newScenarios = [...scenarios];
        newScenarios[scenarioIndex].options[optionKey] = value;
        setScenarios(newScenarios);
    };
    
    // --- LOGIKA SIMPAN GAME ---

    const handleSaveGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Anda harus login untuk membuat game.');
            return;
        }
        if (!title.trim()) {
            toast.error('Judul game tidak boleh kosong!');
            return;
        }

        setLoading(true);
        toast.loading('Menyimpan game...');

        const gameCode = `DIGI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 1. Insert ke tabel 'games'
        const { data: gameData, error: gameError } = await supabase
            .from('games')
            .insert({ creator_id: user.id, title, description, game_code: gameCode })
            .select()
            .single();

        if (gameError) {
            toast.dismiss();
            toast.error(`Gagal menyimpan game: ${gameError.message}`);
            setLoading(false);
            return;
        }

        // 2. Insert ke tabel 'scenarios'
        const scenariosToInsert = scenarios.map(s => ({
            game_id: gameData.id,
            situation: s.situation,
            options: s.options,
            correct_answer: s.correct_answer,
            explanation: s.explanation,
            points: s.points,
        }));
        
        const { error: scenariosError } = await supabase.from('scenarios').insert(scenariosToInsert);
        
        toast.dismiss();
        if (scenariosError) {
            toast.error(`Gagal menyimpan skenario: ${scenariosError.message}`);
            // Opsional: hapus game yang sudah dibuat jika skenario gagal
        } else {
            toast.success('Game berhasil dibuat!');
            setCreatedGameData({
                gameCode,
                shareLink: `${window.location.origin}/play/${gameCode}`
            });
            setShareModalOpen(true);
        }
        setLoading(false);
    };
    
    const closeShareModalAndReset = () => {
        setShareModalOpen(false);
        router.push('/');
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold mb-8">Buat Game Literasi Digital</h2>
                        <form onSubmit={handleSaveGame} className="space-y-6">
                            {/* --- Info Game Utama --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Game</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Petualangan Keamanan Media Sosial" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Jelaskan tentang game yang akan dibuat..."></textarea>
                            </div>

                            <hr />

                            {/* --- List Skenario Dinamis --- */}
                            {scenarios.map((scenario, index) => (
                                <div key={index} className="scenario-item bg-gray-50 p-6 rounded-lg border">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Skenario {index + 1}</h3>
                                        {scenarios.length > 1 && (
                                            <button type="button" onClick={() => removeScenario(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <textarea rows={3} value={scenario.situation} onChange={(e) => handleScenarioChange(index, 'situation', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Contoh: Kamu mendapat pesan berantai berisi info beasiswa..." required></textarea>
                                        
                                        {/* Pilihan Jawaban */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {['A', 'B', 'C', 'D'].map(optionKey => (
                                                <div key={optionKey}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan {optionKey}</label>
                                                    <input type="text" value={scenario.options[optionKey] || ''} onChange={(e) => handleOptionChange(index, optionKey, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required={optionKey === 'A' || optionKey === 'B'} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Jawaban Benar & Poin */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban Benar</label>
                                                <select value={scenario.correct_answer} onChange={(e) => handleScenarioChange(index, 'correct_answer', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                                                    {Object.keys(scenario.options).filter(key => scenario.options[key]).map(key => (
                                                        <option key={key} value={key}>Pilihan {key}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Poin Reward</label>
                                                <input type="number" min="10" value={scenario.points} onChange={(e) => handleScenarioChange(index, 'points', parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                                            </div>
                                        </div>
                                        
                                        {/* Penjelasan */}
                                        <textarea rows={2} value={scenario.explanation} onChange={(e) => handleScenarioChange(index, 'explanation', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Jelaskan mengapa jawaban tersebut benar..."></textarea>
                                    </div>
                                </div>
                            ))}
                            
                            <button type="button" onClick={addScenario} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                                <Plus size={18} /> Tambah Skenario
                            </button>

                            {/* --- Tombol Aksi --- */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => router.push('/')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                                    <ArrowLeft size={18} /> Kembali
                                </button>
                                <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition flex items-center gap-2 disabled:bg-gray-400">
                                    <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <GameShareModal 
                isOpen={isShareModalOpen}
                onClose={closeShareModalAndReset}
                gameCode={createdGameData.gameCode}
                shareLink={createdGameData.shareLink}
            />
        </>
    );
}