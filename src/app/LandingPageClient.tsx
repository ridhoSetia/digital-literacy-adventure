"use client";

import { useState } from 'react';
import JoinGameModal from './_components/JoinGameModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faShieldHalved, faHeadphones, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/_contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import komponen section
import FeaturesSection from './_components/landing/FeaturesSection';
import SdgSection from './_components/landing/SdgSection';
import QuickActionsSection from './_components/landing/QuickActionsSection';

export default function LandingPageClient({ totalPlays }: { totalPlays: number }) {
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const handlePlay = () => {
        if (!user) {
            toast.error("Silakan login untuk mulai bermain!");
            return;
        }
        router.push('/game');
    };

    return (
        <>
            <div className="relative z-10">
                {/* HERO SECTION WRAPPER */}
                <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
                    {/* Decorative Icons */}
                    <FontAwesomeIcon icon={faGamepad} className="text-[120px] text-indigo-400/70 absolute top-1/2 left-[15%] transform -translate-y-1/2 -translate-x-1/2 -rotate-12 hidden lg:block" />
                    <FontAwesomeIcon icon={faShieldHalved} className="text-6xl text-red-500 absolute top-[55%] left-[22%] transform -rotate-12 hidden lg:block" />
                    <FontAwesomeIcon icon={faGamepad} className="text-[120px] text-indigo-400/70 absolute top-1/2 right-[15%] transform -translate-y-1/2 translate-x-1/2 rotate-12 hidden lg:block" />
                    <FontAwesomeIcon icon={faHeadphones} className="text-6xl text-red-500 absolute top-[60%] right-[20%] transform rotate-12 hidden lg:block" />
                    <div className="w-8 h-6 bg-violet-500 rounded-sm absolute top-[40%] right-[25%] transform -rotate-45 hidden lg:block"></div>
                    <div className="w-6 h-4 bg-violet-500 rounded-sm absolute top-[70%] left-[28%] transform rotate-45 hidden lg:block"></div>

                    {/* Hero Content */}
                    <div className="relative">
                        <div className="bg-red-500 rounded-2xl p-3 shadow-2xl">
                            <div className="bg-red-400 rounded-xl p-1.5">
                                <div className="bg-slate-200 text-indigo-950 px-6 py-8 sm:px-10 sm:py-12 rounded-lg shadow-inner">
                                    <div className="flex flex-col items-center justify-center leading-none -mt-3">
                                        <span className="font-display text-5xl sm:text-7xl tracking-widest">Digital</span>
                                        <span className="font-display text-5xl sm:text-7xl tracking-widest">Explorer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <FontAwesomeIcon icon={faBolt} className="text-5xl text-yellow-400 absolute -top-4 -left-8 transform -rotate-12 drop-shadow-md" />
                        <FontAwesomeIcon icon={faBolt} className="text-5xl text-yellow-400 absolute -bottom-4 -right-8 transform rotate-[165deg] drop-shadow-md" />
                        <FontAwesomeIcon icon={faBolt} className="text-4xl text-yellow-400 absolute top-0 -right-8 transform rotate-12 drop-shadow-md" />
                    </div>

                    <div className="mt-12">
                        <h2 className="font-bold text-xl text-gray-200">Jelajahi dunia digital dengan aman!</h2>
                        <p className="mt-2 max-w-lg text-gray-400 text-sm">Belajar literasi digital melalui game interaktif yang seru.</p>
                        <div className="mt-8 flex items-center justify-center gap-6">
                            <Link href="/create" className="btn-pixel bg-violet-600" style={{ "--shadow-color": "#4c1d95" } as React.CSSProperties}>
                                Buat Game
                            </Link>
                            <button onClick={handlePlay} className="btn-pixel bg-green-600" style={{ "--shadow-color": "#166534" } as React.CSSProperties}>Start</button>
                        </div>
                    </div>
                </div>

                {/* KONTEN LAINNYA DI LUAR HERO */}
                <div className="container mx-auto px-6">
                    <FeaturesSection />

                    <section className="text-center py-16 bg-transparent relative">
                        <h2 className="text-3xl font-bold font-display tracking-wider">Bergabunglah Dengan Para Explorer Lain!</h2>
                        <p className="text-7xl font-bold font-pixel text-yellow-400 mt-4 drop-shadow-lg">{totalPlays.toLocaleString('id-ID')}</p>
                        <p className="text-gray-400 mt-2 font-bold tracking-widest">PERMAINAN TELAH DIMAINKAN</p>
                    </section>

                    <SdgSection />
                    <QuickActionsSection onJoinGameClick={() => setJoinModalOpen(true)} />
                </div>
            </div>

            <JoinGameModal
                isOpen={isJoinModalOpen}
                onClose={() => setJoinModalOpen(false)}
            />
        </>
    );
}