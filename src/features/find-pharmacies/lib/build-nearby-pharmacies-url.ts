import {
  RADIUS_OPTIONS,
  type RadiusOption,
  type TimeFilter,
} from "@/entities/pharmacy/model/types";

type BuildNearbyPharmaciesUrlInput = {
  timeFilter: TimeFilter;
  radius?: string | number | null;
};

function isRadiusOption(value: number): value is RadiusOption {
  return RADIUS_OPTIONS.includes(value as RadiusOption);
}

export function buildNearbyPharmaciesUrl({
  timeFilter,
  radius,
}: BuildNearbyPharmaciesUrlInput) {
  const params = new URLSearchParams();
  const parsedRadius =
    typeof radius === "number"
      ? radius
      : typeof radius === "string"
        ? Number(radius)
        : null;

  if (timeFilter !== "now") {
    params.set("time", timeFilter);
  }

  if (parsedRadius != null && isRadiusOption(parsedRadius)) {
    params.set("radius", String(parsedRadius));
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
