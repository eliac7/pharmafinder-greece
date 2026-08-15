import { decryptPayload } from "@/shared/lib/crypto";

const PROXY_PATH = "/api/proxy";
const BACKEND_URL = process.env.API_BASE_URL || "http://localhost:8000";
const BACKEND_SECRET = process.env.API_SECRET_KEY || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";

const IS_SERVER = typeof window === "undefined";

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  code?: string;
  endpoint?: string;
  limit?: number;
  result_count_lower_bound?: number;
  remediation?: { kind: string; suggested_radius_km?: number };
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ApiProblem;

  constructor(status: number, statusText: string, problem?: ApiProblem) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export function getResultSetTooLargeProblem(
  error: unknown,
  endpoint?: "viewport" | "nearby"
) {
  if (
    !(error instanceof ApiError) ||
    error.status !== 422 ||
    error.problem?.code !== "RESULT_SET_TOO_LARGE" ||
    (endpoint && error.problem.endpoint !== endpoint)
  ) {
    return undefined;
  }
  return error.problem;
}

export function isResultSetTooLarge(error: unknown, endpoint?: "viewport" | "nearby") {
  return getResultSetTooLargeProblem(error, endpoint) !== undefined;
}

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
    let problem: ApiProblem | undefined;
    try {
      const errorText = await res.text();
      problem = errorText ? (JSON.parse(errorText) as ApiProblem) : undefined;
    } catch {
      problem = undefined;
    }
    throw new ApiError(res.status, res.statusText, problem);
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
