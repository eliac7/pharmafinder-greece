import type { Pharmacy, PharmacyBasic } from "../model/types";

type PublicPharmacy =
  | Pick<Pharmacy, "id" | "public_id" | "canonical_slug">
  | Pick<PharmacyBasic, "id" | "public_id" | "canonical_slug">;

const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{21}[AQgw]$/;

export function getPharmacyCanonicalPath(pharmacy: PublicPharmacy): string {
  if (pharmacy.public_id != null || pharmacy.canonical_slug != null) {
    if (!pharmacy.canonical_slug || !pharmacy.public_id || !PUBLIC_ID_PATTERN.test(pharmacy.public_id)) {
      throw new Error("Pharmacy has a malformed canonical public identity");
    }
    return `/farmakeia/${pharmacy.canonical_slug}--${pharmacy.public_id}`;
  }
  if (!Number.isSafeInteger(pharmacy.id) || (pharmacy.id ?? 0) <= 0) {
    throw new Error("Pharmacy is missing a canonical public identity");
  }
  return `/farmakeia/${pharmacy.id}`;
}

/** Supports a frontend-first rollout; post-cutover DTOs always take the public branch. */
export function getPharmacyReference(pharmacy: PublicPharmacy): string {
  if (pharmacy.public_id && PUBLIC_ID_PATTERN.test(pharmacy.public_id)) {
    return pharmacy.public_id;
  }
  if (pharmacy.public_id != null || pharmacy.canonical_slug != null) {
    throw new Error("Pharmacy has a malformed canonical public identity");
  }
  if (!Number.isSafeInteger(pharmacy.id) || (pharmacy.id ?? 0) <= 0) {
    throw new Error("Pharmacy is missing a usable identity");
  }
  return String(pharmacy.id);
}
