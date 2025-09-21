"use client"; // Komponen ini adalah Client Component

import HeroSection from './_components/landing/HeroSection';
import FeaturesSection from './_components/landing/FeaturesSection';
import SdgSection from './_components/landing/SdgSection';
import QuickActionsSection from './_components/landing/QuickActionsSection';

// Terima totalPlays sebagai properti (props)
export default function LandingPageClient({ totalPlays }: { totalPlays: number }) {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      {/* Section Statistik Baru */}
      <section className="text-center py-16 bg-white">
          <h2 className="text-3xl font-bold">Bergabunglah Dengan Para Explorer Lain!</h2>
          <p className="text-5xl font-extrabold text-primary mt-4">{totalPlays.toLocaleString('id-ID')}</p>
          <p className="text-gray-600 mt-2">Permainan Telah Dimainkan</p>
      </section>
      <SdgSection />
      <QuickActionsSection />
    </div>
  );
}