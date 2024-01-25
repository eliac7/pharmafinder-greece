"use client";
import Cities from "@/components/frontpage/CitiesSection";
import Hero from "@/components/frontpage/HeroSection";

export default function Page() {
  return (
    <main className="relative flex flex-1 flex-grow flex-col overflow-visible">
      <Hero />
      <Cities />
    </main>
  );
}
