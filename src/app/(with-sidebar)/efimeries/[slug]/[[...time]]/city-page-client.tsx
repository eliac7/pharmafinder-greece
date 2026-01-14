"use client";

import { useEffect, useRef } from "react";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import { useCityPharmaciesStore } from "@/entities/pharmacy/model/use-city-pharmacies";
import { useLocationStore } from "@/features/locate-user";
import { MapWithControls } from "@/widgets/map-view";

interface CityPageClientProps {
  initialPharmacies: Pharmacy[];
  citySlug: string;
  timeFilter: TimeFilter;
  cityCenter: [number, number];
}

export function CityPageClient({
  initialPharmacies,
  citySlug,
  timeFilter,
  cityCenter,
}: CityPageClientProps) {
  const initialized = useRef(false);

  const { initialize, pharmacies, refetchWithLocation } =
    useCityPharmaciesStore();
  const { latitude, longitude } = useLocationStore();

  if (!initialized.current) {
    initialize(citySlug, timeFilter, initialPharmacies);
    initialized.current = true;
  }

  useEffect(() => {
    initialize(citySlug, timeFilter, initialPharmacies);
  }, [citySlug, timeFilter, initialPharmacies, initialize]);

  useEffect(() => {
    if (latitude && longitude) {
      refetchWithLocation(latitude, longitude);
    }
  }, [latitude, longitude, refetchWithLocation, citySlug, timeFilter]);

  const displayPharmacies =
    pharmacies.length > 0 ? pharmacies : initialPharmacies;

  return (
    <MapWithControls
      center={cityCenter}
      zoom={14}
      minZoom={10}
      pharmacies={displayPharmacies}
      timeFilter={timeFilter}
      citySlug={citySlug}
    />
  );
}
