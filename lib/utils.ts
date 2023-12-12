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

// Example usage:
const phoneNumber = "2101234567";
const formattedPhoneNumber = formatGreekPhoneNumber(phoneNumber);
console.log(formattedPhoneNumber);
