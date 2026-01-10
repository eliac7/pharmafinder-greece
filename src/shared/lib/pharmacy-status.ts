"use client";

export type PharmacyStatus = "open" | "closing-soon" | "closed";

export interface PharmacyStatusResult {
  status: PharmacyStatus;
  closingTime: string | null;
  minutesUntilClose: number | null;
}

export interface PharmacyHours {
  open_time: string | null;
  close_time: string | null;
}

/**
 * Calculate the current status of a pharmacy based on its operating hours
 * @param hours - Array of operating hour slots
 * @param openUntilTomorrow - Whether the pharmacy stays open past midnight
 * @param nextDayCloseTime - The closing time on the next day if open overnight
 * @returns Status information including whether it's open, closing soon, or closed
 */
/**
 * Format pharmacy hours for display
 * @param hours - Array of operating hour slots
 * @returns Formatted string like "00:00 - 08:00" or null if no hours
 */
export function formatPharmacyHours(hours: PharmacyHours[]): string | null {
  if (!hours || hours.length === 0) return null;

  return hours
    .map((slot) => {
      if (!slot.open_time || !slot.close_time) return null;
      // Remove seconds from time format (HH:MM:SS -> HH:MM)
      const openTime = slot.open_time.slice(0, 5);
      const closeTime = slot.close_time.slice(0, 5);
      return `${openTime} - ${closeTime}`;
    })
    .filter(Boolean)
    .join(", ");
}

export function getPharmacyStatus(
  hours: PharmacyHours[],
  openUntilTomorrow: boolean | null,
  nextDayCloseTime: string | null
): PharmacyStatusResult {
  if (!hours || hours.length === 0) {
    return { status: "closed", closingTime: null, minutesUntilClose: null };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  for (const slot of hours) {
    if (!slot.close_time) continue;

    const [closeHour, closeMinute] = slot.close_time.split(":").map(Number);
    let closeTotalMinutes = closeHour * 60 + closeMinute;

    // Handle pharmacies open until tomorrow
    if (openUntilTomorrow && nextDayCloseTime) {
      const [nextCloseHour, nextCloseMinute] = nextDayCloseTime
        .split(":")
        .map(Number);
      closeTotalMinutes = 24 * 60 + nextCloseHour * 60 + nextCloseMinute;
    }

    // If close time is 23:59, treat as midnight
    if (closeHour === 23 && closeMinute === 59) {
      closeTotalMinutes = 24 * 60;
    }

    const minutesUntilClose = closeTotalMinutes - currentTotalMinutes;

    // Pharmacy is closed if past closing time
    if (minutesUntilClose <= 0) {
      return {
        status: "closed",
        closingTime: slot.close_time,
        minutesUntilClose: 0,
      };
    }

    // Closing soon if within 30 minutes
    if (minutesUntilClose <= 30) {
      return {
        status: "closing-soon",
        closingTime: slot.close_time,
        minutesUntilClose,
      };
    }

    // Otherwise open
    return { status: "open", closingTime: slot.close_time, minutesUntilClose };
  }

  return { status: "open", closingTime: null, minutesUntilClose: null };
}
