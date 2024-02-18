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
    .map((word) => {
      // Capitalize the first letter of each word
      let result = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

      // Additional logic to capitalize letters following a parenthesis
      const parenthesisIndex = result.indexOf("(");
      if (parenthesisIndex !== -1 && parenthesisIndex + 1 < result.length) {
        result =
          result.substring(0, parenthesisIndex + 1) +
          result.charAt(parenthesisIndex + 1).toUpperCase() +
          result.substring(parenthesisIndex + 2);
      }

      return result;
    })
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
