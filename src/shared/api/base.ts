const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY || "";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    "x-secret-key": API_SECRET_KEY,
    ...(options?.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 404) return [] as unknown as T;
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
