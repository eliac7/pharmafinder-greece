export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { decryptPayload, encryptPayload } from "@/shared/lib/crypto";
import { logger } from "@/shared/lib/logger";
import { isIP } from "node:net";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";
const CLIENT_ENCRYPTION_SECRET =
  process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";
const CLIENT_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "";

const ALLOWED_ENDPOINTS = [
  { pattern: /^\/pharmacies\/(?:\d+|[A-Za-z0-9_-]{21}[AQgw])\/is-on-duty$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/search$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/viewport\/on_duty$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/(?:\d+|[A-Za-z0-9_-]{21}[AQgw])$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/(?:\d+|[A-Za-z0-9_-]{21}[AQgw])\/report$/, methods: ["POST"] },
  { pattern: /^\/nearby_pharmacies\/on_duty$/, methods: ["GET"] },
  { pattern: /^\/city$/, methods: ["GET"] },
  { pattern: /^\/statistics$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities$/, methods: ["GET"] },
  { pattern: /^\/locations\/prefectures$/, methods: ["GET"] },
  { pattern: /^\/search$/, methods: ["GET"] },
];

const ALLOWED_HEADERS = ["content-type", "accept", "user-agent"];
const INTERNAL_CLIENT_IP_HEADER = "x-pharmafinder-client-ip";
const INTERNAL_EDGE_REQUEST_ID_HEADER = "x-pharmafinder-edge-request-id";
const TIME_VALUES = new Set(["now", "today", "tomorrow"]);
const RADIUS_VALUES = new Set(["2", "5", "10", "20"]);
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;

function invalidQuery(message: string) {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid request", status: 422, detail: message },
    { status: 422, headers: { "content-type": "application/problem+json" } },
  );
}

function finite(value: string | null): value is string {
  return value !== null && value.trim() !== "" && Number.isFinite(Number(value));
}

function coordinatesAreValid(latitude: string | null, longitude: string | null) {
  if (!finite(latitude) || !finite(longitude)) return false;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function validateQuery(pathStr: string, searchParams: URLSearchParams) {
  let allowed: Set<string> | undefined;
  if (pathStr === "/pharmacies/viewport/on_duty") {
    allowed = new Set(["west", "south", "east", "north", "time"]);
  } else if (pathStr === "/nearby_pharmacies/on_duty") {
    allowed = new Set(["latitude", "longitude", "radius", "time"]);
  } else if (pathStr === "/pharmacies/search" || pathStr === "/search") {
    allowed = new Set(["q", "latitude", "longitude"]);
  } else if (pathStr === "/city") {
    allowed = new Set(["city_slug", "time", "latitude", "longitude"]);
  } else if (/^\/pharmacies\/\d+\/is-on-duty$/.test(pathStr)) {
    allowed = new Set(["date"]);
  } else {
    allowed = new Set();
  }

  const seen = new Set<string>();
  for (const key of searchParams.keys()) {
    if (!allowed.has(key)) return invalidQuery(`Unknown query parameter: ${key}`);
    if (seen.has(key) || searchParams.getAll(key).length !== 1) {
      return invalidQuery(`Duplicate query parameter: ${key}`);
    }
    seen.add(key);
  }

  const time = searchParams.get("time");
  if (time !== null && !TIME_VALUES.has(time)) return invalidQuery("Invalid time filter.");
  if (pathStr === "/pharmacies/viewport/on_duty") {
    const values = ["west", "south", "east", "north"].map((key) => searchParams.get(key));
    if (values.some((value) => !finite(value))) return invalidQuery("Viewport bounds must be finite numbers.");
    const [west, south, east, north] = values.map(Number);
    if (west < -180 || west > 180 || east < -180 || east > 180 || south < -90 || south > 90 || north < -90 || north > 90 || west >= east || south >= north || east - west > 3 || north - south > 3) {
      return invalidQuery("Invalid viewport bounds.");
    }
  }
  if (pathStr === "/nearby_pharmacies/on_duty") {
    if (!["latitude", "longitude", "radius"].every((key) => searchParams.has(key))) return invalidQuery("Nearby coordinates and radius are required.");
    if (!finite(searchParams.get("latitude")) || !finite(searchParams.get("longitude")) || !RADIUS_VALUES.has(searchParams.get("radius")!)) return invalidQuery("Invalid nearby parameters.");
    const lat = Number(searchParams.get("latitude"));
    const lng = Number(searchParams.get("longitude"));
    if (lat < 34 || lat > 42.5 || lng < 18 || lng > 30.5) return invalidQuery("Coordinates are outside the supported service area.");
  }
  if (pathStr === "/pharmacies/search" || pathStr === "/search") {
    const q = searchParams.get("q")?.trim() ?? "";
    if (q.length < 3 || q.length > 80 || CONTROL_CHARACTERS.test(q)) return invalidQuery("Invalid search query.");
    if (searchParams.has("latitude") !== searchParams.has("longitude") || (searchParams.has("latitude") && !coordinatesAreValid(searchParams.get("latitude"), searchParams.get("longitude")))) return invalidQuery("Coordinates must be supplied as a valid pair.");
  }
  if (pathStr === "/city") {
    const slug = searchParams.get("city_slug") ?? "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return invalidQuery("Invalid city slug.");
    if (searchParams.has("latitude") !== searchParams.has("longitude")) return invalidQuery("Coordinates must be supplied as a valid pair.");
    if (searchParams.has("latitude") && !coordinatesAreValid(searchParams.get("latitude"), searchParams.get("longitude"))) return invalidQuery("Coordinates must be a valid geographic pair.");
  }
  if (/^\/pharmacies\/\d+\/is-on-duty$/.test(pathStr)) {
    const date = searchParams.get("date");
    if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return invalidQuery("Invalid date.");
  }
  return null;
}

async function validateBody(pathStr: string, request: NextRequest) {
  if (!/^\/pharmacies\/\d+\/report$/.test(pathStr)) return null;
  try {
    const body = await request.clone().json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) return invalidQuery("Invalid report body.");
    const keys = Object.keys(body);
    if (keys.some((key) => !["description", "report_type", "turnstile_token"].includes(key)) || !keys.includes("report_type") || !keys.includes("turnstile_token")) return invalidQuery("Invalid report body.");
    if (!["closed", "wrong_coords", "wrong_info", "other"].includes(body.report_type) || typeof body.turnstile_token !== "string" || !body.turnstile_token.trim() || (body.description !== undefined && body.description !== null && (typeof body.description !== "string" || body.description.length > 500))) return invalidQuery("Invalid report body.");
  } catch {
    return invalidQuery("Invalid report body.");
  }
  return null;
}

function getTrustedClientIp(headers: Headers): string | null {
  const forwardedValues = [
    headers.get("cf-connecting-ip"),
    headers.get("x-vercel-forwarded-for"),
  ];

  for (const value of forwardedValues) {
    const candidate = value?.split(",")[0]?.trim();
    if (candidate && isIP(candidate)) return candidate;
  }

  return null;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = "/" + path.join("/");

  const matchedEndpoint = ALLOWED_ENDPOINTS.find((endpoint) =>
    endpoint.pattern.test(pathStr)
  );

  if (!matchedEndpoint) {
    logger.warn({ path: pathStr }, "Blocked proxy attempt to invalid path");
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!matchedEndpoint.methods.includes(request.method)) {
    logger.warn(
      { path: pathStr, method: request.method },
      "Blocked proxy attempt with invalid method"
    );
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  const queryError = validateQuery(pathStr, request.nextUrl.searchParams);
  if (queryError) return queryError;
  const bodyError = await validateBody(pathStr, request);
  if (bodyError) return bodyError;

  const searchParams = request.nextUrl.searchParams.toString();
  const urlPath = path.join("/");
  const url = `${API_BASE_URL}/${urlPath}${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const headers = new Headers();
    ALLOWED_HEADERS.forEach((headerKey) => {
      const value = request.headers.get(headerKey);
      if (value) {
        headers.set(headerKey, value);
      }
    });

    headers.set("x-secret-key", API_SECRET_KEY);
    const clientIp = getTrustedClientIp(request.headers);
    if (clientIp) {
      headers.set(INTERNAL_CLIENT_IP_HEADER, clientIp);
    }
    const edgeRequestId =
      request.headers.get("x-vercel-id") ?? request.headers.get("cf-ray");
    if (edgeRequestId) {
      headers.set(INTERNAL_EDGE_REQUEST_ID_HEADER, edgeRequestId.slice(0, 200));
    }

    const body = request.body;

    const started = Date.now();
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: body,
      // @ts-expect-error - duplex is needed for streaming bodies in some environments but ts might complain
      duplex: body ? "half" : undefined,
    });
    let problemCode: string | undefined;
    if (!response.ok && response.headers.get("content-type")?.includes("json")) {
      try {
        const problem = (await response.clone().json()) as { code?: unknown };
        if (typeof problem.code === "string") problemCode = problem.code;
      } catch {
        // The backend may return a non-problem error body. Do not log its contents.
      }
    }
    logger.info(
      {
        route_class: pathStr.includes("viewport")
          ? "viewport"
          : pathStr.includes("nearby")
            ? "nearby"
            : pathStr.includes("search")
              ? "search"
              : pathStr === "/city"
                ? "city"
                : pathStr.endsWith("/report")
                  ? "report"
                  : "other",
        status: response.status,
        problem_code: problemCode,
        request_duration_ms: Date.now() - started,
        edge_request_id: edgeRequestId,
        deployment:
          process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID,
      },
      "proxy_request"
    );

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
        if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
             responseHeaders.set(key, value);
        }
    });

    if (!response.ok) {
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      if (!text) {
        return new NextResponse(null, {
          status: response.status,
          headers: responseHeaders,
        });
      }

      try {
        const json = JSON.parse(text);
        let dataToEncrypt = json;

        if (json && typeof json === "object" && "encrypted" in json) {
          try {
            const decrypted = await decryptPayload(
              json.encrypted,
              ENCRYPTION_SECRET,
              ENCRYPTION_SALT
            );
            if (decrypted) {
              dataToEncrypt = decrypted;
            }
          } catch (err) {
            logger.error({ err }, "Backend decryption failed");
            return new NextResponse(text, {
              status: response.status,
              headers: responseHeaders,
            });
          }
        }

        // Enforce re-encryption for the client
        if (!CLIENT_ENCRYPTION_SECRET || !CLIENT_ENCRYPTION_SALT) {
          logger.error(
            "Missing NEXT_PUBLIC_ENCRYPTION_SECRET or NEXT_PUBLIC_ENCRYPTION_SALT. Cannot securely serve data."
          );
          return NextResponse.json(
            { message: "Server Configuration Error: Missing Encryption Keys" },
            { status: 500 }
          );
        }

        const clientEncrypted = await encryptPayload(
          dataToEncrypt,
          CLIENT_ENCRYPTION_SECRET,
          CLIENT_ENCRYPTION_SALT
        );

        if (!clientEncrypted) {
          logger.error("Failed to re-encrypt data for client.");
          return NextResponse.json(
            { message: "Internal Server Error: Encryption Failed" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { encrypted: clientEncrypted },
          {
            status: response.status,
            headers: responseHeaders,
          }
        );
      } catch (error: unknown) {
        logger.error({ err: error }, "Proxy processing error");
        // If parsing fails, return original text
        return new NextResponse(text, {
          status: response.status,
          headers: responseHeaders,
        });
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error({ err: error }, "Proxy error");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
