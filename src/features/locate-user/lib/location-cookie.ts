import { cookies } from "next/headers";

interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Server-side helper to read user location from the cookie.
 * Cookie is set by useLocationStore.setLocation() as simple JSON.
 */
export async function getLocationFromCookies(): Promise<UserLocation | null> {
  const cookieStore = await cookies();
  const locationCookie = cookieStore.get("user-location");

  if (!locationCookie?.value) {
    return null;
  }

  try {
    const { latitude, longitude } = JSON.parse(locationCookie.value);

    if (typeof latitude === "number" && typeof longitude === "number") {
      return { latitude, longitude };
    }
  } catch {
    // Invalid cookie format
  }

  return null;
}
