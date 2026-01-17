import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { pharmacyApi, TIME_OPTIONS, DEFAULT_RADIUS } from "@/entities/pharmacy";
import { useLocationStore } from "@/features/locate-user";

export function useNearbyPharmacies() {
  const { latitude, longitude } = useLocationStore();
  const [time] = useQueryState(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  const isEnabled = !!latitude && !!longitude;

  return useQuery({
    queryKey: ["nearby-pharmacies", latitude, longitude, time, radius],
    queryFn: () =>
      pharmacyApi.getNearbyOnDuty(latitude!, longitude!, radius, time),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}
