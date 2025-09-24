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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-8">
            <div className="bg-gray-100 rounded-xl max-w-5xl w-full h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-xl flex-shrink-0">
                    <h2 className="text-xl font-bold">Review Game: {gameCode}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {/* Render komponen game player di dalam modal */}
                    <GamePlayer gameCode={gameCode} />
                </div>
            </div>
        </div>
    );
}