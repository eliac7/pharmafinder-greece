export const SESSION_COOKIE = "pf_session";

export function getBackendBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8000";
}

export function getAppOrigin(fallbackUrl: string): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || fallbackUrl).origin;
  } catch {
    return "";
  }
}

/** True when the request's Origin header (if any) matches the deployed app origin. */
export function isSameOrigin(originHeader: string | null, fallbackUrl: string): boolean {
  if (!originHeader) return true;
  const appOrigin = getAppOrigin(fallbackUrl);
  if (!appOrigin) return false;
  try {
    return new URL(originHeader).origin === appOrigin;
  } catch {
    return false;
  }
}
