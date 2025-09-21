"use client";
import { Rocket, Play, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_contexts/AuthContext';
import toast from 'react-hot-toast';

export default function HeroSection() {
    const router = useRouter();
    const { user } = useAuth();

    const handlePlay = () => {
        if (!user) {
            toast.error("Silakan login untuk mulai bermain!");
            // Anda bisa juga membuka modal login di sini
            return;
        }
        // Arahkan ke halaman pemilihan game atau game default
        router.push('/game'); 
    };
    
    const handleCreate = () => {
        if (!user) {
            toast.error("Silakan login untuk membuat game!");
            return;
        }
        router.push('/create');
    };

    return (
        <section className="gradient-bg text-white py-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="animate-bounce-slow inline-block">
                    <Rocket size={64} className="mb-6" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Digital Literacy <span className="text-accent">Adventure</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                    Jelajahi dunia digital dengan aman! Belajar literasi digital melalui game interaktif yang seru.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handlePlay} className="bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-yellow-600 transition glow flex items-center justify-center gap-2">
                        <Play /> Mulai Bermain
                    </button>
                    <button onClick={handleCreate} className="bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2">
                        <Plus /> Buat Game
                    </button>
                </div>
            </div>
        </section>
    );
}