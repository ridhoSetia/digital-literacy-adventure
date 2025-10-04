"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '../_contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Save, Trash2, ArrowLeft, Upload, FileText, MessageSquare, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import GameShareModal from '../_components/GameShareModal';
import Image from 'next/image'; // <-- menambah import ini

// Tipe data
type ScenarioOption = { [key: string]: string };
type Scenario = {
  situation: string;
  question: string;
  options: ScenarioOption;
  correct_answer: string;
  points: number;
  explanation: string;
  highlight_phrase: string;
  answer_time: number;
  image_url?: string;
};

export default function CreateGamePage() {
    const supabase = createClient();
    const { user } = useAuth();
    const router = useRouter();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [gameType, setGameType] = useState<'quiz' | 'story'>('quiz');
    const [isOfficial, setIsOfficial] = useState(false);
    
    const [scenarios, setScenarios] = useState<Array<Partial<Scenario> & { imageFile?: File | null }>>([
        { situation: '', options: { 'A': '', 'B': '' }, correct_answer: 'A', points: 20, imageFile: null, explanation: '', question: '', highlight_phrase: '', answer_time: 15 }
    ]);
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [createdGameData, setCreatedGameData] = useState({ gameCode: '', shareLink: '' });
    
    useEffect(() => {
        const checkUserRole = async () => {
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile?.role === 'admin') setIsAdmin(true);
            }
        };
        checkUserRole();
    }, [user, supabase]);

    const addScenario = () => {
        setScenarios([...scenarios, { situation: '', options: { 'A': '', 'B': '' }, correct_answer: 'A', points: 20, imageFile: null, explanation: '', question: '', highlight_phrase: '', answer_time: 15 }]);
    };
    const removeScenario = (index: number) => {
        setScenarios(scenarios.filter((_, i) => i !== index));
    };
    const handleScenarioChange = (index: number, field: keyof Scenario, value: any) => {
        const newScenarios = [...scenarios];
        newScenarios[index] = { ...newScenarios[index], [field]: value };
        setScenarios(newScenarios);
    };
    const handleOptionChange = (scenarioIndex: number, optionKey: string, value: string) => {
        const newScenarios = [...scenarios];
        if (!newScenarios[scenarioIndex].options) newScenarios[scenarioIndex].options = {};
        newScenarios[scenarioIndex].options![optionKey] = value;
        setScenarios(newScenarios);
    };
    const handleScenarioImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE_KB = 200;
        if (file.size > MAX_SIZE_KB * 1024) {
            toast.error(`Ukuran gambar terlalu besar! Maksimal ${MAX_SIZE_KB} KB.`);
            e.target.value = '';
            return;
        }
        const newScenarios = [...scenarios];
        newScenarios[index].imageFile = file;
        setScenarios(newScenarios);
    };

    const handleSaveGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error('Anda harus login untuk membuat game.');
        if (!title.trim()) return toast.error('Judul game tidak boleh kosong!');
        if (!coverImage) return toast.error('Silakan upload gambar sampul.');

        setLoading(true);
        toast.loading('Mengupload & menyimpan game...');

        let coverImageUrl = '';
        const coverFilePath = `${user.id}/${Date.now()}_${coverImage.name}`;
        const { error: coverUploadError } = await supabase.storage.from('game-covers').upload(coverFilePath, coverImage);
        if (coverUploadError) { toast.dismiss(); toast.error(`Gagal upload gambar sampul: ${coverUploadError.message}`); setLoading(false); return; }
        coverImageUrl = supabase.storage.from('game-covers').getPublicUrl(coverFilePath).data.publicUrl;

        const gameCode = `DIGI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const { data: gameData, error: gameError } = await supabase.from('games').insert({ 
            creator_id: user.id, title, description, game_code: gameCode,
            cover_image_url: coverImageUrl, game_type: gameType, is_official: isAdmin && isOfficial 
        }).select().single();

        if (gameError) { toast.dismiss(); toast.error(`Gagal menyimpan game: ${gameError.message}`); setLoading(false); return; }

        const scenariosToInsert = await Promise.all(
            scenarios.map(async (s) => {
                let imageUrl: string | undefined = undefined;
                if (s.imageFile) {
                    const scenarioFilePath = `${user.id}/scenarios/${Date.now()}_${s.imageFile.name}`;
                    await supabase.storage.from('game-covers').upload(scenarioFilePath, s.imageFile);
                    imageUrl = supabase.storage.from('game-covers').getPublicUrl(scenarioFilePath).data.publicUrl;
                }
                const { imageFile, ...scenarioData } = s;
                return { ...scenarioData, game_id: gameData!.id, image_url: imageUrl };
            })
        );
        
        // PERBAIKAN 1: Hapus `as any`
        const { error: scenariosError } = await supabase.from('scenarios').insert(scenariosToInsert);

        toast.dismiss();
        if (scenariosError) {
            toast.error(`Gagal menyimpan skenario: ${scenariosError.message}`);
        } else {
            toast.success('Game berhasil dibuat!');
            setCreatedGameData({ gameCode, shareLink: `${window.location.origin}/play/${gameCode}` });
            setShareModalOpen(true);
        }
        setLoading(false);
    };
    
    const closeShareModalAndReset = () => {
        setShareModalOpen(false);
        router.push('/game');
    };

    return (
        <>
            <div className="min-h-screen text-white pt-24">
                <div className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-violet-700 rounded-xl shadow-lg p-8">
                        <h2 className="text-4xl font-bold mb-8 font-display tracking-wider text-center">Buat Game Literasi Digital</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tipe Game</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setGameType('quiz')} className={`flex-1 p-4 border-2 rounded-lg flex items-center gap-3 transition-colors duration-200 ${gameType === 'quiz' ? 'border-violet-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <MessageSquare className={gameType === 'quiz' ? 'text-violet-400' : 'text-gray-500'}/>
                                    <div>
                                        <p className="font-semibold text-left">Kuis Pilihan Ganda</p>
                                        <p className="text-xs text-gray-400 text-left">Format tanya jawab klasik.</p>
                                    </div>
                                </button>
                                <button type="button" onClick={() => setGameType('story')} className={`flex-1 p-4 border-2 rounded-lg flex items-center gap-3 transition-colors duration-200 ${gameType === 'story' ? 'border-violet-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <FileText className={gameType === 'story' ? 'text-violet-400' : 'text-gray-500'}/>
                                    <div>
                                        <p className="font-semibold text-left">Mode Cerita</p>
                                        <p className="text-xs text-gray-400 text-left">Format narasi interaktif.</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveGame} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Gambar Sampul</label>
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-500" />
                                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-violet-400 focus-within:outline-none hover:text-violet-300">
                                                <span>Upload file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)} />
                                            </label>
                                            <p className="pl-1">atau drag and drop</p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-500">PNG, JPG, WEBP hingga 2MB</p>
                                        {coverImage && <p className="text-sm text-green-400 mt-2">File dipilih: {coverImage.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Judul Game</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required placeholder="Contoh: Petualangan Keamanan Sosmed" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi</label>
                                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="Jelaskan sedikit tentang game Anda..."></textarea>
                            </div>

                            {isAdmin && (
                                <div className="p-4 bg-slate-800/50 border border-blue-500 rounded-lg">
                                    <label htmlFor="is_official" className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" id="is_official" checked={isOfficial} onChange={(e) => setIsOfficial(e.target.checked)} className="h-5 w-5 rounded border-gray-500 bg-slate-700 text-violet-500 focus:ring-violet-500" />
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="text-blue-400" size={20}/>
                                            <span className="font-semibold text-blue-300">Jadikan Game Resmi (Khusus Admin)</span>
                                        </div>
                                    </label>
                                </div>
                            )}
                            
                            <hr className="border-slate-700"/>
                            
                            {scenarios.map((scenario, index) => (
                                <div key={index} className="scenario-item bg-slate-800/50 p-6 rounded-lg border border-slate-700">                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold font-display tracking-wide">Skenario {index + 1}</h3>
                                        {scenarios.length > 1 && (<button type="button" onClick={() => removeScenario(index)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>)}
                                    </div>
                                    {/* KONTEN FORM SKENARIO YANG DIPERBARUI */}
                                    <div className="space-y-4">
                                    <div>
                                            <label className="block text-sm font-medium text-gray-400">Gambar Skenario (Opsional, Maks 200KB)</label>
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="relative w-24 h-16 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center">
                                                    {/* PERBAIKAN 2: Ganti <img> dengan <Image> */}
                                                    {scenario.imageFile ? (
                                                        <Image src={URL.createObjectURL(scenario.imageFile)} alt="preview" layout="fill" className="object-cover rounded-md"/>
                                                    ) : (
                                                        <ImageIcon className="h-8 w-8 text-gray-500"/>
                                                    )}
                                                </div>
                                                <label htmlFor={`scenario-image-${index}`} className="cursor-pointer text-sm text-violet-400 font-semibold hover:underline">
                                                    Upload gambar
                                                    <input id={`scenario-image-${index}`} type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleScenarioImageChange(e, index)} />
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {gameType === 'story' && (<>
                                            <label className="block text-sm font-medium text-gray-400">Teks Narasi/Cerita</label>
                                            <textarea rows={5} value={scenario.situation || ''} onChange={(e) => handleScenarioChange(index, 'situation', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required></textarea>
                                            <label className="block text-sm font-medium text-gray-400">Pertanyaan</label>
                                            <input type="text" value={scenario.question || ''} onChange={(e) => handleScenarioChange(index, 'question', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required />
                                            <label className="block text-sm font-medium text-gray-400">Frasa untuk di-Highlight (Stabilo)</label>
                                            <input type="text" value={scenario.highlight_phrase || ''} onChange={(e) => handleScenarioChange(index, 'highlight_phrase', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="Harus sama persis dengan teks di narasi" required />
                                        </>)}
                                        
                                        {gameType === 'quiz' && (<>
                                            <label className="block text-sm font-medium text-gray-400">Pertanyaan Kuis</label>
                                            <textarea rows={3} value={scenario.situation || ''} onChange={(e) => handleScenarioChange(index, 'situation', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required></textarea>
                                        </>)}
                                        
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {['A', 'B', 'C', 'D'].map(optionKey => (
                                                <div key={optionKey}>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Pilihan {optionKey}</label>
                                                    <input type="text" value={scenario.options?.[optionKey] || ''} onChange={(e) => handleOptionChange(index, optionKey, e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required={optionKey === 'A' || optionKey === 'B'} />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Jawaban Benar</label>
                                                <select value={scenario.correct_answer} onChange={(e) => handleScenarioChange(index, 'correct_answer', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required>
                                                    {Object.keys(scenario.options || {}).filter(key => scenario.options?.[key]).map(key => (<option key={key} value={key} className="bg-slate-800">Pilihan {key}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Poin Reward</label>
                                                <input type="number" min="10" value={scenario.points || 20} onChange={(e) => handleScenarioChange(index, 'points', parseInt(e.target.value))} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required />
                                            </div>
                                        </div>
                                        
                                        {gameType === 'story' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Waktu Menjawab (detik)</label>
                                                <input type="number" min="5" value={scenario.answer_time || 15} onChange={(e) => handleScenarioChange(index, 'answer_time', parseInt(e.target.value))} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" required />
                                            </div>
                                        )}
                                        
                                        <textarea rows={2} value={scenario.explanation || ''} onChange={(e) => handleScenarioChange(index, 'explanation', e.target.value)} className="w-full bg-slate-800 border-slate-700 px-4 py-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500" placeholder="Jelaskan mengapa jawaban tersebut benar..."></textarea>
                                    </div>
                                </div>
                            ))}
                            
                            <button type="button" onClick={addScenario} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                                <Plus size={18} /> Tambah Skenario
                            </button>
                            
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => router.push('/game')} className="px-6 py-3 border border-slate-600 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 font-semibold">
                                    <ArrowLeft size={18} /> Kembali
                                </button>
                                <button type="submit" disabled={loading} className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:bg-slate-600 font-semibold">
                                    <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <GameShareModal isOpen={isShareModalOpen} onClose={closeShareModalAndReset} gameCode={createdGameData.gameCode} shareLink={createdGameData.shareLink} />
        </>
    );
}