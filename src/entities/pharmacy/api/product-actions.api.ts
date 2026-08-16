import { ApiError, ApiProblem } from "@/shared/api/base";
import { decryptPayload } from "@/shared/lib/crypto";

const CLIENT_ENCRYPTION_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";
const CLIENT_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "";

export type DutyTime = "now" | "today" | "tomorrow";

export interface DutyCoverage {
  status: "fresh" | "partial" | "stale" | "unknown";
  complete: boolean;
  observed_at: string | null;
}

export interface ActionMarker {
  handle: string;
  name: string;
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

export interface NearbyActionItem {
  handle: string;
  name: string;
  address_short: string;
  city: string;
  distance_km: number | null;
  latitude: number;
  longitude: number;
  duty_summary: {
    data_status: DutyCoverage["status"];
    observed_at: string | null;
    is_on_duty: boolean | null;
    closes_at: string | null;
    periods: Array<{ opens_at: string; closes_at: string }>;
  };
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
  duty: NearbyActionItem["duty_summary"];
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

export function revealProductHandle(handle: string) {
  return fetchProductAction<ActionPublicDetail>("/v1/pharmacies/reveal", {
    method: "POST",
    body: JSON.stringify({ handle }),
  });
}
