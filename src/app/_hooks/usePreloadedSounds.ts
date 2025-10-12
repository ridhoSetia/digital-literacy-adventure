"use client";

import { useEffect, useRef, useCallback } from 'react';

// Tipe untuk menyimpan objek audio yang sudah dimuat
type SoundMap = { [key: string]: HTMLAudioElement };

/**
 * Hook untuk memuat file audio di awal dan memainkannya tanpa jeda.
 * @param soundUrls Array berisi path/URL ke file audio yang ingin dimuat.
 * @returns Fungsi `playSound(url, volume)` yang stabil.
 */
export const usePreloadedSounds = (soundUrls: string[]) => {
  // Gunakan useRef agar tidak menyebabkan re-render saat audio di-load
  const audioObjects = useRef<SoundMap>({});

  // Efek ini hanya berjalan sekali saat komponen dimuat
  useEffect(() => {
    // Proses pre-loading untuk setiap URL suara
    soundUrls.forEach(url => {
      if (!audioObjects.current[url]) {
        const audio = new Audio(url);
        audio.preload = 'auto'; // Memberi tahu browser untuk mulai men-download audio
        audioObjects.current[url] = audio;
      }
    });

    // Cleanup untuk melepaskan sumber daya memori saat komponen dibongkar
    return () => {
      Object.values(audioObjects.current).forEach(audio => {
        audio.pause();
        audio.src = ''; 
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array kosong agar hanya berjalan sekali

  /**
   * Fungsi untuk memainkan suara yang sudah di-load.
   */
  const playSound = useCallback((url: string, volume = 1.0) => {
    const audio = audioObjects.current[url];
    if (audio) {
      audio.volume = volume;
      // Atur waktu ke awal, agar suara bisa diputar ulang meskipun belum selesai
      audio.currentTime = 0; 
      audio.play().catch(e => console.error(`Gagal memutar suara: ${url}`, e));
    } else {
      console.warn(`Suara belum di-preload: ${url}`);
    }
  }, []);

  return playSound;
};