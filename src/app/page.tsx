"use client";

import HeroSection from './_components/landing/HeroSection';
import FeaturesSection from './_components/landing/FeaturesSection';
import SdgSection from './_components/landing/SdgSection';
import QuickActionsSection from './_components/landing/QuickActionsSection';

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <SdgSection />
      <QuickActionsSection />
    </div>
  );
}