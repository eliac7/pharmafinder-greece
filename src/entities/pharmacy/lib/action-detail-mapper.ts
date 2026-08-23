import type { ActionPublicDetail } from "../api/product-actions.api";
import type { Pharmacy } from "../model/types";
import { dutyPeriodsToPharmacyHours } from "./status";

/** Build the presentation model for a pharmacy from its public detail DTO. */
export function actionDetailToPharmacy(
  detail: ActionPublicDetail,
): Pharmacy {
  const slugSegment = detail.canonical_path
    .split("/")
    .pop()
    ?.split("--")[0];

  return {
    public_id: detail.public_id,
    canonical_slug: slugSegment ?? null,
    name: detail.name,
    address: detail.address,
    city: detail.city,
    prefecture: detail.prefecture,
    prefecture_english: "",
    phone: detail.phone ?? "",
    latitude: detail.location.latitude,
    longitude: detail.location.longitude,
    distance_km: null,
    data_hours: dutyPeriodsToPharmacyHours(detail.duty.periods),
    is_frequent_duty: detail.is_frequent_duty,
  };
}
