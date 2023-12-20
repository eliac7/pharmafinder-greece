import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGreekPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  // Check if the number is valid (10 digits for landline)
  if (cleanedNumber.length !== 10) {
    throw new Error("Invalid phone number");
  }

  // Format the number as desired
  const formattedNumber = `${cleanedNumber.substring(
    0,
    3
  )} ${cleanedNumber.substring(3, 6)} ${cleanedNumber.substring(6)}`;

  return formattedNumber;
}

export function formatKM(distance: number): string {
  return `${distance.toFixed(2)} km`;
}

export function calculateTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
