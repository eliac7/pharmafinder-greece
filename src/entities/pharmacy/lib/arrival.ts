import type { Pharmacy, TimeFilter } from "../model/types";
import { getPharmacyStatus } from "./status";

export type ArrivalRisk = "safe" | "tight" | "too_late" | "unknown";

export interface ArrivalEstimate {
  estimatedTravelMinutes: number | null;
  minutesUntilClose: number | null;
  marginMinutes: number | null;
  risk: ArrivalRisk;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

const AVERAGE_DRIVING_SPEED_KMH = 25;
const PARKING_AND_START_BUFFER_MINUTES = 3;
const SAFE_MARGIN_MINUTES = 10;

const RISK_ORDER: Record<ArrivalRisk, number> = {
  safe: 0,
  tight: 1,
  unknown: 2,
  too_late: 3,
};

const CONFIDENCE_SCORE = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

function toNumber(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(
  from: UserCoordinates,
  to: UserCoordinates
): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function estimateDrivingMinutes(distanceKm: number): number {
  return (
    Math.ceil((distanceKm / AVERAGE_DRIVING_SPEED_KMH) * 60) +
    PARKING_AND_START_BUFFER_MINUTES
  );
}

export function getPharmacyDistanceKm(
  pharmacy: Pharmacy,
  userLocation?: UserCoordinates | null
): number | null {
  const providedDistance = toNumber(pharmacy.distance_km);
  if (providedDistance != null) return providedDistance;

  if (!userLocation) return null;

  const latitude = toNumber(pharmacy.latitude);
  const longitude = toNumber(pharmacy.longitude);
  if (latitude == null || longitude == null) return null;

  return calculateDistanceKm(userLocation, { latitude, longitude });
}

export function getArrivalEstimate({
  pharmacy,
  userLocation,
  minutesUntilClose,
}: {
  pharmacy: Pharmacy;
  userLocation?: UserCoordinates | null;
  minutesUntilClose: number | null;
}): ArrivalEstimate {
  const distanceKm = getPharmacyDistanceKm(pharmacy, userLocation);
  const estimatedTravelMinutes =
    distanceKm == null ? null : estimateDrivingMinutes(distanceKm);

  if (estimatedTravelMinutes == null || minutesUntilClose == null) {
    return {
      estimatedTravelMinutes,
      minutesUntilClose,
      marginMinutes: null,
      risk: "unknown",
    };
  }

  const marginMinutes = minutesUntilClose - estimatedTravelMinutes;

  if (marginMinutes < 0) {
    return {
      estimatedTravelMinutes,
      minutesUntilClose,
      marginMinutes,
      risk: "too_late",
    };
  }

  if (marginMinutes < SAFE_MARGIN_MINUTES) {
    return {
      estimatedTravelMinutes,
      minutesUntilClose,
      marginMinutes,
      risk: "tight",
    };
  }

  return {
    estimatedTravelMinutes,
    minutesUntilClose,
    marginMinutes,
    risk: "safe",
  };
}

export function getPharmacyArrivalEstimate(
  pharmacy: Pharmacy,
  timeFilter: TimeFilter,
  userLocation?: UserCoordinates | null
): ArrivalEstimate {
  const status = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? null,
    pharmacy.next_day_close_time ?? null,
    timeFilter
  );

  return getArrivalEstimate({
    pharmacy,
    userLocation,
    minutesUntilClose: status.minutesUntilClose,
  });
}

function getConfidenceScore(pharmacy: Pharmacy): number {
  return pharmacy.confidence ? CONFIDENCE_SCORE[pharmacy.confidence] : 0;
}

function getUpdatedAtTime(pharmacy: Pharmacy): number {
  if (!pharmacy.last_updated_at) return 0;
  const timestamp = new Date(pharmacy.last_updated_at).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortPharmaciesByRecommendation(
  pharmacies: Pharmacy[],
  {
    timeFilter,
    userLocation,
    favoriteIds = [],
    getEstimate,
  }: {
    timeFilter: TimeFilter;
    userLocation?: UserCoordinates | null;
    favoriteIds?: number[];
    getEstimate?: (pharmacy: Pharmacy) => ArrivalEstimate;
  }
): Pharmacy[] {
  const favoriteSet = new Set(favoriteIds);
  const estimateFor =
    getEstimate ??
    ((pharmacy: Pharmacy) =>
      getPharmacyArrivalEstimate(pharmacy, timeFilter, userLocation));

  return pharmacies.toSorted((a, b) => {
    const estimateA = estimateFor(a);
    const estimateB = estimateFor(b);
    const riskDelta = RISK_ORDER[estimateA.risk] - RISK_ORDER[estimateB.risk];
    if (riskDelta !== 0) return riskDelta;

    const etaA = estimateA.estimatedTravelMinutes ?? Number.MAX_SAFE_INTEGER;
    const etaB = estimateB.estimatedTravelMinutes ?? Number.MAX_SAFE_INTEGER;
    if (etaA !== etaB) return etaA - etaB;

    const confidenceDelta = getConfidenceScore(b) - getConfidenceScore(a);
    if (confidenceDelta !== 0) return confidenceDelta;

    const freshnessDelta = getUpdatedAtTime(b) - getUpdatedAtTime(a);
    if (freshnessDelta !== 0) return freshnessDelta;

    const favoriteDelta =
      Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id));
    if (favoriteDelta !== 0) return favoriteDelta;

    return a.name.localeCompare(b.name, "el");
  });
}

export function getArrivalBadgeText(estimate: ArrivalEstimate): string {
  if (estimate.risk === "safe" && estimate.estimatedTravelMinutes != null) {
    return `Προλαβαίνετε περίπου σε ${estimate.estimatedTravelMinutes}'`;
  }

  if (estimate.risk === "tight") return "Οριακά";
  if (estimate.risk === "too_late") return "Μάλλον δεν προλαβαίνετε";
  return "Άγνωστη εκτίμηση";
}
