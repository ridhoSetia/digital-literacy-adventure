"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function LoadingScreen({ isLoading }: { isLoading: boolean }) {
    return (
        <div 
            className={`fixed inset-0 bg-indigo-950 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="flex flex-col items-center justify-center leading-none -mt-3">
                <span className="font-display text-5xl sm:text-7xl tracking-widest text-white">Digital</span>
                <span className="font-display text-5xl sm:text-7xl tracking-widest text-white">Explorer</span>
            </div>
            {/* Perubahan di sini: Membungkus ikon dengan div yang ukurannya pasti */}
            <div className="w-10 h-10 mt-8">
                <FontAwesomeIcon icon={faSpinner} className="fa-spin text-white w-full h-full" />
            </div>
        </div>
    );
}