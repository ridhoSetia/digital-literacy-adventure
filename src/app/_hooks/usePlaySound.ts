"use client";

import { useCallback } from 'react';

/**
 * Custom hook untuk memutar file audio.
 * @returns Fungsi `playSound` yang menerima path file suara dan volume opsional.
 */
export function usePlaySound() {
  const playSound = useCallback((src: string, volume: number = 1.0) => {
    // Pastikan kode hanya berjalan di sisi client
    if (typeof window !== 'undefined') {
      const audio = new Audio(src);
      audio.volume = volume;
      // Mengatasi error jika browser memblokir autoplay
      audio.play().catch(e => console.error(`Gagal memutar suara: ${e}`));
    }
  }, []);

  return playSound;
}