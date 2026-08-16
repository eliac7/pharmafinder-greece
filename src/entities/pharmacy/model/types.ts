export const TIME_OPTIONS = ["now", "today", "tomorrow"] as const;
export type TimeFilter = (typeof TIME_OPTIONS)[number];

export const RADIUS_OPTIONS = [2, 5, 10, 20] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];
export const DEFAULT_RADIUS: RadiusOption = 2;

export interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type PharmacyStatus = "open" | "closing-soon" | "closed" | "scheduled";

export interface PharmacyStatusResult {
  status: PharmacyStatus;
  statusColor: string;
  closingTime: string | null;
  minutesUntilClose: number | null;
}

export interface PharmacyHour {
  open_time: string | null;
  close_time: string | null;
  date: string | null;
}

/**
 * Basic pharmacy info (used in search results, nearby pharmacies)
 */
export interface PharmacyBasic {
  /** Transitional only: present when the frontend is deployed before Phase-1 backend cutover. */
  id?: number;
  public_id?: string | null;
  canonical_slug?: string | null;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  prefecture_english: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number;
}

/**
 * Full pharmacy with hours (used in city duty lists)
 */
export interface Pharmacy {
  /** Transitional only: present when the frontend is deployed before Phase-1 backend cutover. */
  id?: number;
  public_id?: string | null;
  canonical_slug?: string | null;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  prefecture_english: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  date?: string | null;
  data_hours: PharmacyHour[];
  open_until_tomorrow?: boolean | null;
  next_day_close_time?: string | null;
  is_frequent_duty?: boolean;
}

export interface PharmaciesWithCount {
  count: number;
  data: Pharmacy[];
  success: boolean;
  message: string;
}

/**
 * Response from /pharmacies/{id}/is-on-duty
 */
export interface PharmacyDutyStatus {
  date: string;
  is_on_duty: boolean;
  hours: PharmacyHour[];
}

export interface PharmacySitemapItem {
  public_id: string;
  canonical_slug: string;
  public_content_updated_at?: string | null;
}
