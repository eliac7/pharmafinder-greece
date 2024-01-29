"use client";
import Cities from "@/components/frontpage/CitiesSection";
import FAQ from "@/components/frontpage/FAQSection";
import Hero from "@/components/frontpage/HeroSection";
import HowItWorks from "@/components/frontpage/HowItWorksSection";
import Stats from "@/components/frontpage/StatsSection";

export default function Page() {
  return (
    <main className="relative flex flex-1 flex-grow flex-col overflow-visible">
      <Hero />
      <Cities />
      <HowItWorks />
      <Stats />
      <FAQ />
    </main>
  );
}
