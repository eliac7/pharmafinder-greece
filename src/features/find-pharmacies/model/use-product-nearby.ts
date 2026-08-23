"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";

import {
  DEFAULT_RADIUS,
  normalizeRadius,
  TIME_OPTIONS,
  queryNearbyAction,
  type DutyTime,
} from "@/entities/pharmacy";
import { useLocationStore } from "@/features/locate-user";

export function useProductNearbyPharmacies() {
  const { latitude, longitude } = useLocationStore();
  const [time] = useQueryState<DutyTime>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now"),
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS),
  );

  const normalizedRadius = normalizeRadius(radius);

  return useQuery({
    queryKey: ["product-nearby-pharmacies", latitude, longitude, time, normalizedRadius],
    queryFn: () => queryNearbyAction(latitude!, longitude!, normalizedRadius, time),
    enabled: latitude != null && longitude != null,
    staleTime: 60_000,
    retry: false,
  });
}
