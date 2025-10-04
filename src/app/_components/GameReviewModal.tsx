"use client";

import { X } from 'lucide-react';
import GamePlayer from './GamePlayer';

interface GameReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameCode: string | null;
}

export default function GameReviewModal({ isOpen, onClose, gameCode }: GameReviewModalProps) {
    if (!isOpen || !gameCode) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
            <div className="bg-slate-900 border border-violet-700 rounded-xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl shadow-violet-500/20">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white font-display tracking-wider">Review Game: {gameCode}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto bg-indigo-950/30 rounded-b-xl">
                    {/* Mengirim prop isReviewMode={true} */}
                    <GamePlayer gameCode={gameCode} isReviewMode={true} />
                </div>
            </div>
        </div>
    );
}