import type {
  NavigationPharmacy,
  PharmacyNavigationLinks,
} from "../model/types";

const WAZE_UTM_SOURCE = "pharmafinder_greece";

function toCoordinate(value: NavigationPharmacy["latitude"]): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function buildNavigationLinks(
  pharmacy: NavigationPharmacy
): PharmacyNavigationLinks {
  const latitude = toCoordinate(pharmacy.latitude);
  const longitude = toCoordinate(pharmacy.longitude);
  const hasCoordinates = latitude !== null && longitude !== null;
  const destination = hasCoordinates ? `${latitude},${longitude}` : null;
  const googleMapsUrl = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destination
      )}&travelmode=driving&dir_action=navigate`
    : null;
  const appleMapsUrl = destination
    ? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=d`
    : null;
  const wazeUrl = destination
    ? `https://waze.com/ul?ll=${encodeURIComponent(
        destination
      )}&navigate=yes&zoom=17&utm_source=${WAZE_UTM_SOURCE}`
    : null;

  const phone = pharmacy.phone?.trim();
  const copyParts = [
    pharmacy.name,
    pharmacy.address,
    googleMapsUrl ? `Google Maps: ${googleMapsUrl}` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    hasCoordinates,
    googleMapsUrl,
    appleMapsUrl,
    wazeUrl,
    telUrl: phone ? `tel:${phone}` : null,
    copyText: copyParts.join("\n"),
  };
}
