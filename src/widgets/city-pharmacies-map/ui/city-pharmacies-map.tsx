"use client";

import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import dynamic from "next/dynamic";

const MapWithControls = dynamic(
  () => import("@/widgets/map-view").then((mod) => mod.MapWithControls),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20 animate-pulse" />,
  }
);

interface CityPharmaciesMapProps {
  initialPharmacies: Pharmacy[];
  citySlug: string;
  timeFilter: TimeFilter;
  cityCenter: [number, number];
}

export function CityPharmaciesMap({
  citySlug,
  timeFilter,
  cityCenter,
}: CityPharmaciesMapProps) {
  return (
    <MapWithControls
      center={cityCenter}
      zoom={14}
      minZoom={10}
      timeFilter={timeFilter}
      citySlug={citySlug}
    />
  );
}
