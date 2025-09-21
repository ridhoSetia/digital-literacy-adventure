"use client";

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  onScanResult: (result: string) => void;
  onScanError: (error: string) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function QrScanner({ onScanResult, onScanError }: QrScannerProps) {
  useEffect(() => {
    // Buat instance scanner baru
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true, // Ingat kamera terakhir yang digunakan
      },
      /* verbose= */ false
    );

    // Render scanner
    html5QrcodeScanner.render(onScanResult, onScanError);

    // Fungsi cleanup untuk menghentikan scanner saat komponen ditutup
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Gagal membersihkan Html5QrcodeScanner.", error);
      });
    };
  }, [onScanResult, onScanError]);

  return (
    <div id={qrcodeRegionId} />
  );
}