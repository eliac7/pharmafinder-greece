import { decryptPayload } from "@/shared/lib/crypto";

const PROXY_PATH = "/api/proxy";
const BACKEND_URL = process.env.API_BASE_URL || "http://localhost:8000";
const BACKEND_SECRET = process.env.API_SECRET_KEY || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";

const IS_SERVER = typeof window === "undefined";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let url: string;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (IS_SERVER) {
    url = `${BACKEND_URL}${endpoint}`;
    headers["x-secret-key"] = BACKEND_SECRET;
  } else {
    url = `${PROXY_PATH}${endpoint}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 404) return [] as unknown as T;
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (data && typeof data === "object" && "encrypted" in data) {
    try {
      return (await decryptPayload(
        data.encrypted,
        ENCRYPTION_SECRET,
        ENCRYPTION_SALT
      )) as T;
    } catch (e) {
      console.error("Decryption failed for endpoint:", endpoint, e);
      throw e;
    }
  }

  return data as T;
}
