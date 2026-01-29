/**
 * Map search radius in km to a map zoom level.
 * Smaller radius = more zoomed in, bigger radius = more zoomed out.
 */
export function radiusToZoom(radiusKm: number): number {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  return 11; // 20km and above
}
