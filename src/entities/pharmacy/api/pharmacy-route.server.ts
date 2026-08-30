import { fetchAPI } from "@/shared/api/base";
import { PUBLIC_ID_SOURCE } from "../lib/public-url";

export type PharmacyRouteResolution =
  | { outcome: "canonical"; canonical_path: string }
  | { outcome: "redirect"; canonical_path: string }
  | { outcome: "gone"; canonical_path: null }
  | { outcome: "not_found"; canonical_path: null };

const CANONICAL_PATH = new RegExp(
  `^\\/farmakeia\\/[a-z0-9]+(?:-[a-z0-9]+)*--${PUBLIC_ID_SOURCE}$`,
);
const RESOLVER_TIMEOUT_MS = 3_000;

export async function resolvePharmacyRoute(
  routeSegment: string
): Promise<PharmacyRouteResolution> {
  const payload = await fetchAPI<unknown>(
    `/internal/pharmacies/route/${encodeURIComponent(routeSegment)}`,
    { signal: AbortSignal.timeout(RESOLVER_TIMEOUT_MS) }
  );

  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid pharmacy route resolver response");
  }

  const outcome = Reflect.get(payload, "outcome");
  const canonicalPath = Reflect.get(payload, "canonical_path");
  if (outcome === "gone" || outcome === "not_found") {
    if (canonicalPath !== null) {
      throw new Error("Invalid terminal pharmacy route response");
    }
    return { outcome, canonical_path: null };
  }
  if (
    (outcome === "canonical" || outcome === "redirect") &&
    typeof canonicalPath === "string" &&
    canonicalPath.length <= 132 &&
    CANONICAL_PATH.test(canonicalPath)
  ) {
    return { outcome, canonical_path: canonicalPath };
  }
  throw new Error("Invalid pharmacy route resolver response");
}
