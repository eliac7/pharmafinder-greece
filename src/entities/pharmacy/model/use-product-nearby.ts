"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";

import {
  DEFAULT_RADIUS,
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

  return useQuery({
    queryKey: ["product-nearby-pharmacies", latitude, longitude, time, radius],
    queryFn: () => queryNearbyAction(latitude!, longitude!, radius as 2 | 5 | 10 | 20, time),
    enabled: latitude != null && longitude != null,
    staleTime: 60_000,
    retry: false,
  });
}
