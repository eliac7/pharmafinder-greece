import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ICountryByIP } from "./interfaces";

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
    3,
  )} ${cleanedNumber.substring(3, 6)} ${cleanedNumber.substring(6)}`;

  return formattedNumber;
}

export function formatKM(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else {
    return `${distance.toFixed(2)} km`;
  }
}
export function calculateTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function capitalizeFirstLetterOfEachWord(phrase: string): string {
  return phrase
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
    )
    .join(" ");
}

export function formatDateInGreek(date: string): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("el-GR", options);

  return formattedDate;
}

export async function getCountryByIP(ip: string): Promise<ICountryByIP> {
  try {
    const response = await fetch(`https://freeipapi.com/api/json/${ip}`);
    const data = await response.json();
    return {
      countryCode: data.countryCode,
      countryName: data.countryName,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
