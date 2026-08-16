"use client";

import { useState } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { toast } from "sonner";

import {
  revealProductHandle,
  TIME_OPTIONS,
  useProductCityPharmacies,
  type CityActionItem,
  type TimeFilter,
} from "@/entities/pharmacy";
import { useRevealWithChallenge } from "@/features/pharmacy-detail/model/use-reveal-with-challenge";
import { DetailChallenge } from "@/features/pharmacy-detail/ui/detail-challenge";
import { useMapStore } from "@/shared/model/use-map-store";
import {
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/shared/ui/map";
import { ProductActionPopupTarget } from "./product-action-popup";
import { ProductActionMarkerContent } from "./product-action-marker";

interface PharmacyMarkersProps {
  timeFilter?: TimeFilter;
  citySlug?: string;
}

export function PharmacyMarkers({ citySlug, timeFilter }: PharmacyMarkersProps) {
  const setProductPopupTarget = useMapStore((state) => state.setProductPopupTarget);
  const { challenge, challengeError, reveal, verifyChallenge } = useRevealWithChallenge();
  const [pendingCenter, setPendingCenter] = useState<[number, number] | null>(null);
  const [queryTime] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now"),
  );
  const activeTime = timeFilter ?? queryTime;
  const { data } = useProductCityPharmacies(citySlug ?? "", activeTime);

  if (!citySlug || !data) return null;

  const openPopup = (
    detail: Awaited<ReturnType<typeof revealProductHandle>>,
    fallbackCenter?: [number, number],
  ) => {
    const latitude = detail.location.latitude ?? fallbackCenter?.[1];
    const longitude = detail.location.longitude ?? fallbackCenter?.[0];
    if (latitude == null || longitude == null) {
      throw new Error("Pharmacy has no map coordinates");
    }
    setProductPopupTarget({
      detail: { ...detail, location: { latitude, longitude } },
      center: [longitude, latitude],
      timeFilter: activeTime,
    });
  };

  const open = async (handle: string, fallbackCenter: [number, number]) => {
    setPendingCenter(fallbackCenter);
    try {
      const detail = await reveal(handle);
      if (detail) openPopup(detail, fallbackCenter);
    } catch {
      toast.error("Δεν ήταν δυνατή η φόρτωση των στοιχείων.");
    }
  };

  return (
    <>
      {challenge && (
        <div className="absolute left-1/2 top-5 z-30 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border bg-background/95 p-4 text-center shadow-xl backdrop-blur">
          <p className="text-sm font-medium">Απαιτείται επιβεβαίωση για την προβολή στοιχείων.</p>
          <DetailChallenge
            errorMessage={challengeError}
            onVerified={async (providerToken) => {
              const detail = await verifyChallenge(providerToken);
              if (detail) {
                openPopup(detail, pendingCenter ?? undefined);
                setPendingCenter(null);
              }
            }}
          />
        </div>
      )}
      {data.items
        .filter(
          (item: CityActionItem) =>
            item.latitude != null && item.longitude != null,
        )
        .map((item: CityActionItem) => (
          <MapMarker
            key={item.handle}
            longitude={item.longitude!}
            latitude={item.latitude!}
          >
            <MarkerContent>
              <button
                type="button"
                onClick={() => void open(item.handle, [item.longitude!, item.latitude!])}
                className="cursor-pointer border-0 bg-transparent p-0"
              >
                <ProductActionMarkerContent
                  publicId={item.public_id}
                  status={activeTime === "now" ? "open" : "scheduled"}
                />
                <span className="sr-only">{item.name}</span>
              </button>
            </MarkerContent>
            <MarkerTooltip className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
              {item.name}
            </MarkerTooltip>
          </MapMarker>
        ))}
      <ProductActionPopupTarget />
    </>
  );
}
