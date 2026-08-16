import { ApiError, ApiProblem } from "@/shared/api/base";
import { decryptPayload } from "@/shared/lib/crypto";

const CLIENT_ENCRYPTION_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";
const CLIENT_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "";

export type DutyTime = "now" | "today" | "tomorrow";

/** Deployment-selected client rollout switch. Never derive this from user input. */
export const PRODUCT_ACTION_APIS_ENABLED =
  process.env.NEXT_PUBLIC_PRODUCT_ACTION_APIS_ENABLED === "true";

export interface DutyCoverage {
  status: "fresh" | "partial" | "stale" | "unknown";
  complete: boolean;
  observed_at: string | null;
}

export interface ActionMarker {
  handle: string;
  name: string;
  public_id?: string | null;
  latitude: number;
  longitude: number;
  city: string;
}

export interface ActionCluster {
  handle: string;
  center: { latitude: number; longitude: number };
  count: number;
}

export interface MapActionResponse {
  mode: "clusters" | "markers";
  clusters: ActionCluster[];
  markers: ActionMarker[];
  returned_count: number;
  matched_count: number;
  zoom_required: boolean;
  duty_coverage: DutyCoverage;
}

export interface ActionDutySummary {
  data_status: DutyCoverage["status"];
  observed_at: string | null;
  is_on_duty: boolean | null;
  closes_at: string | null;
  periods: Array<{ opens_at: string; closes_at: string; date?: string | null }>;
}

export interface ActionPharmacyListItem {
  handle: string;
  name: string;
  address_short: string;
  city: string;
  public_id: string | null;
  phone: string | null;
  distance_km: number | null;
  latitude: number | null;
  longitude: number | null;
  is_frequent_duty: boolean;
  duty_summary: ActionDutySummary;
}

export interface NearbyActionItem extends ActionPharmacyListItem {}

export interface CityActionItem extends ActionPharmacyListItem {
  latitude: number | null;
  longitude: number | null;
}

export interface NearbyActionResponse {
  items: NearbyActionItem[];
  returned_count: number;
  has_more: boolean;
  duty_coverage: DutyCoverage;
}

export interface ActionPublicDetail {
  public_id: string;
  canonical_path: string;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  phone: string | null;
  location: { latitude: number | null; longitude: number | null };
  is_frequent_duty: boolean;
  duty: ActionDutySummary;
}

export interface CityActionResponse {
  items: CityActionItem[];
  returned_count: number;
  has_more: boolean;
  next_cursor: string | null;
  duty_coverage: DutyCoverage;
}

export interface SearchActionItem {
  handle: string;
  name: string;
  city: string | null;
  text: string | null;
  slug: string | null;
}

export interface SearchActionResponse {
  pharmacies: SearchActionItem[];
  addresses: SearchActionItem[];
  cities: SearchActionItem[];
  has_more: Record<string, boolean>;
}

let sessionRequest: Promise<void> | undefined;

async function ensureSession() {
  if (!sessionRequest) {
    sessionRequest = fetch("/api/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    }).then(async (response) => {
      if (!response.ok) {
        sessionRequest = undefined;
        let problem: ApiProblem | undefined;
        try {
          problem = (await response.json()) as ApiProblem;
        } catch {
          // Preserve the typed transport error when the BFF has no JSON body.
        }
        throw new ApiError(response.status, response.statusText, problem);
      }
    });
  }
  return sessionRequest;
}

export async function fetchProductAction<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  await ensureSession();
  const response = await fetch(`/api/proxy${endpoint}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!response.ok) {
    let problem: ApiProblem | undefined;
    try {
      problem = (await response.json()) as ApiProblem;
    } catch {
      // The caller still receives the status even for a non-JSON failure.
    }
    throw new ApiError(response.status, response.statusText, problem);
  }
  const payload = await response.json();
  if (payload && typeof payload === "object" && "encrypted" in payload) {
    return (await decryptPayload(
      payload.encrypted,
      CLIENT_ENCRYPTION_SECRET,
      CLIENT_ENCRYPTION_SALT,
    )) as T;
  }
  return payload as T;
}

export function queryMapAction(
  bbox: { west: number; south: number; east: number; north: number },
  zoom: number,
  dutyTime: DutyTime,
) {
  return fetchProductAction<MapActionResponse>("/v1/map/query", {
    method: "POST",
    body: JSON.stringify({ bbox, zoom, duty_time: dutyTime }),
  });
}

export function drillMapAction(handle: string, targetZoom: number) {
  return fetchProductAction<MapActionResponse>(
    `/v1/map/clusters/${encodeURIComponent(handle)}/drill`,
    { method: "POST", body: JSON.stringify({ target_zoom: targetZoom }) },
  );
}

export function queryNearbyAction(
  latitude: number,
  longitude: number,
  radiusKm: 2 | 5 | 10 | 20,
  dutyTime: DutyTime,
) {
  return fetchProductAction<NearbyActionResponse>("/v1/pharmacies/nearby", {
    method: "POST",
    body: JSON.stringify({
      latitude,
      longitude,
      radius_km: radiusKm,
      duty_time: dutyTime,
    }),
  });
}

export function queryCityAction(
  citySlug: string,
  dutyTime: DutyTime,
  cursor?: string | null,
) {
  const params = new URLSearchParams({ time: dutyTime });
  if (cursor) params.set("cursor", cursor);
  return fetchProductAction<CityActionResponse>(
    `/v1/duty/cities/${encodeURIComponent(citySlug)}?${params.toString()}`,
  );
}

export function querySearchAction(
  query: string,
  coordinates?: { latitude: number; longitude: number },
) {
  const params = new URLSearchParams({ q: query });
  if (coordinates) {
    params.set("latitude", String(coordinates.latitude));
    params.set("longitude", String(coordinates.longitude));
  }
  return fetchProductAction<SearchActionResponse>(
    `/v1/search/suggestions?${params.toString()}`,
  );
}

export function revealProductHandle(handle: string) {
  return fetchProductAction<ActionPublicDetail>("/v1/pharmacies/reveal", {
    method: "POST",
    body: JSON.stringify({ handle }),
  });
}

export function getProductDetail(publicId: string) {
  return fetchProductAction<ActionPublicDetail>(
    `/v1/pharmacies/${encodeURIComponent(publicId)}`,
  );
}

export function reportProduct(
  publicId: string,
  data: {
    report_type: "closed" | "wrong_coords" | "wrong_info" | "other";
    description?: string;
    turnstile_token: string;
  },
) {
  return fetchProductAction<{ success: boolean }>(
    `/v1/pharmacies/${encodeURIComponent(publicId)}/reports`,
    { method: "POST", body: JSON.stringify(data) },
  );
}
