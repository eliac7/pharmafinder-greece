"use client";

import { useEffect, useRef } from "react";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import { useCityPharmaciesStore } from "@/entities/pharmacy/model/use-city-pharmacies";
import { useLocationStore } from "@/features/locate-user";
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
  initialPharmacies,
  citySlug,
  timeFilter,
  cityCenter,
}: CityPharmaciesMapProps) {
  const initializedKeyRef = useRef<string | null>(null);

  const { initialize, pharmacies, refetchWithLocation } =
    useCityPharmaciesStore();
  const { latitude, longitude } = useLocationStore();
  const hasInitialDistances = initialPharmacies.some(
    (p) => typeof p.distance_km === "number" && p.distance_km > 0
  );
  const initializeKey = `${citySlug}:${timeFilter}`;

  useEffect(() => {
    if (initializedKeyRef.current === initializeKey) return;
    if (hasInitialDistances && (!latitude || !longitude)) return;

    initialize(
      citySlug,
      timeFilter,
      initialPharmacies,
      hasInitialDistances ? { lat: latitude!, lng: longitude! } : null
    );
    initializedKeyRef.current = initializeKey;
  }, [
    citySlug,
    timeFilter,
    initialPharmacies,
    initialize,
    hasInitialDistances,
    latitude,
    longitude,
    initializeKey,
  ]);

  useEffect(() => {
    if (initializedKeyRef.current !== initializeKey) {
      initializedKeyRef.current = null;
    }
  }, [initializeKey]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const userLocation = useCityPharmaciesStore.getState().userLocation;
    const locationChanged =
      !userLocation ||
      Math.abs(userLocation.lat - latitude) > 0.0001 ||
      Math.abs(userLocation.lng - longitude) > 0.0001;

    if (locationChanged) {
      refetchWithLocation(latitude, longitude);
    }
  }, [latitude, longitude, refetchWithLocation, initializeKey]);

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
