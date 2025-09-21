"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// ... import lainnya

// Definisikan tipe untuk hasil skor
type ResultData = {
  score_achieved: number;
  // Tambahkan properti lain jika ada, misal:
  // games: { title: string };
};

export default function ResultPage() {
    const { score_id } = useParams();
    // Beri tahu useState tipe datanya
    const [result, setResult] = useState<ResultData | null>(null); // <--- PERBAIKANNYA DI SINI

    // ... useEffect

    return (
        <div>
            <h1>Selamat, Digital Explorer!</h1>
            {/* Tampilkan skor jika result tidak null */}
            {result && <p>Skor Akhir Anda: {result.score_achieved}</p>}
            {/* ... */}
        </div>
    )
}