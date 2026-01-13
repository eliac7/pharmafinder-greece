import { useQuery } from "@tanstack/react-query";
import {
  useQueryState,
  parseAsFloat,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs";
import { pharmacyApi, TIME_OPTIONS, DEFAULT_RADIUS } from "@/entities/pharmacy";

export function useNearbyPharmacies() {
  const [lat] = useQueryState("lat", parseAsFloat);
  const [lng] = useQueryState("lng", parseAsFloat);
  const [time] = useQueryState(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  const isEnabled = !!lat && !!lng;

  return useQuery({
    queryKey: ["nearby-pharmacies", lat, lng, time, radius],
    queryFn: () => pharmacyApi.getNearbyOnDuty(lat!, lng!, radius, time),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}
