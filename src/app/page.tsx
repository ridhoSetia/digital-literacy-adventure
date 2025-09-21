// HAPUS "use client"; dari sini

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import LandingPageClient from './LandingPageClient'; // Impor komponen klien baru

// Fungsi untuk mengambil data di server
async function getTotalPlays() {
    const supabase = createServerComponentClient({ cookies });
    const { count } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true });
    return count ?? 0;
}

// Halaman utama sekarang menjadi Server Component
export default async function LandingPage() {
  // Ambil data di server
  const totalPlays = await getTotalPlays();

  // Render komponen klien dan kirim data sebagai props
  return <LandingPageClient totalPlays={totalPlays} />;
}