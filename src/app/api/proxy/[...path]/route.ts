export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { decryptPayload, encryptPayload } from "@/shared/lib/crypto";
import { logger } from "@/shared/lib/logger";
import { getBackendBaseUrl, isSameOrigin, SESSION_COOKIE } from "@/shared/lib/request-origin";
import { PUBLIC_ID_SOURCE } from "@/entities/pharmacy/lib/public-url";
import { isIP } from "node:net";

const API_BASE_URL = getBackendBaseUrl();
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";
const BFF_SERVICE_CREDENTIAL = process.env.BFF_SERVICE_CREDENTIAL || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";
const CLIENT_ENCRYPTION_SECRET =
  process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";
const CLIENT_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "";

const ALLOWED_ENDPOINTS = [
  { pattern: /^\/v1\/map\/query$/, methods: ["POST"] },
  {
    pattern: /^\/v1\/map\/clusters\/[A-Za-z0-9_-]{21,256}\/drill$/,
    methods: ["POST"],
  },
  { pattern: /^\/v1\/pharmacies\/nearby$/, methods: ["POST"] },
  { pattern: /^\/v1\/pharmacies\/reveal$/, methods: ["POST"] },
  { pattern: /^\/v1\/challenges\/turnstile$/, methods: ["POST"] },
  {
    pattern: new RegExp(`^\\/v1\\/pharmacies\\/${PUBLIC_ID_SOURCE}$`),
    methods: ["GET"],
  },
  {
    pattern: new RegExp(
      `^\\/v1\\/pharmacies\\/${PUBLIC_ID_SOURCE}\\/reports$`,
    ),
    methods: ["POST"],
  },
  {
    pattern: /^\/v1\/duty\/cities\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
    methods: ["GET"],
  },
  { pattern: /^\/v1\/search\/suggestions$/, methods: ["GET"] },

  { pattern: /^\/statistics$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities\/[^/]+$/, methods: ["GET"] },
];

const ALLOWED_HEADERS = ["content-type", "accept", "user-agent"];
const INTERNAL_CLIENT_IP_HEADER = "x-pharmafinder-client-ip";
const INTERNAL_EDGE_REQUEST_ID_HEADER = "x-pharmafinder-edge-request-id";
const TIME_VALUES = new Set(["now", "today", "tomorrow"]);

function invalidQuery(message: string) {
  return NextResponse.json(
    {
      type: "about:blank",
      title: "Invalid request",
      status: 422,
      detail: message,
    },
    { status: 422, headers: { "content-type": "application/problem+json" } },
  );
}

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || isSameOrigin(origin, request.url)) return null;
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

const QUERY_PARAM_ALLOWLIST: { pattern: RegExp; params: string[] }[] = [
  { pattern: /^\/v1\/duty\/cities\//, params: ["time", "cursor"] },
  {
    pattern: /^\/v1\/search\/suggestions$/,
    params: ["q", "latitude", "longitude"],
  },
];

function validateQuery(pathStr: string, searchParams: URLSearchParams) {
  const matchedRule = QUERY_PARAM_ALLOWLIST.find((rule) =>
    rule.pattern.test(pathStr),
  );
  const allowed = new Set(matchedRule ? matchedRule.params : []);

  const seen = new Set<string>();
  for (const key of searchParams.keys()) {
    if (!allowed.has(key))
      return invalidQuery(`Unknown query parameter: ${key}`);
    if (seen.has(key) || searchParams.getAll(key).length !== 1) {
      return invalidQuery(`Duplicate query parameter: ${key}`);
    }
    seen.add(key);
  }

  const time = searchParams.get("time");
  if (time !== null && !TIME_VALUES.has(time))
    return invalidQuery("Invalid time filter.");
  return null;
}

async function validateBody(pathStr: string, request: NextRequest) {
  if (pathStr === "/v1/challenges/turnstile") {
    try {
      const body = await request.clone().json();
      if (body === null || typeof body !== "object" || Array.isArray(body))
        return invalidQuery("Invalid challenge body.");
      const keys = Object.keys(body);
      if (
        keys.length !== 2 ||
        !keys.every((key) =>
          ["request_token", "turnstile_token"].includes(key),
        ) ||
        typeof body.request_token !== "string" ||
        !body.request_token.trim() ||
        body.request_token.length > 512 ||
        typeof body.turnstile_token !== "string" ||
        !body.turnstile_token.trim() ||
        body.turnstile_token.length > 4096
      )
        return invalidQuery("Invalid challenge body.");
    } catch {
      return invalidQuery("Invalid challenge body.");
    }
    return null;
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

function classifyRoute(pathStr: string): string {
  if (/^\/v1\/map\/query$/.test(pathStr)) return "map-query";
  if (/^\/v1\/map\/clusters\/.+\/drill$/.test(pathStr)) return "clusters-drill";
  if (/^\/v1\/pharmacies\/nearby$/.test(pathStr)) return "nearby";
  if (/^\/v1\/pharmacies\/reveal$/.test(pathStr)) return "reveal";
  if (/^\/v1\/challenges\//.test(pathStr)) return "challenges";
  if (/^\/v1\/pharmacies\/[^/]+\/reports$/.test(pathStr)) return "report";
  if (/^\/v1\/duty\/cities\//.test(pathStr)) return "duty-cities";
  if (/^\/v1\/search\//.test(pathStr)) return "search";
  if (/^\/v1\/pharmacies\//.test(pathStr)) return "pharmacy";
  if (/^\/statistics$/.test(pathStr)) return "statistics";
  if (/^\/locations\//.test(pathStr)) return "locations";
  return "other";
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = "/" + path.join("/");

  const matchedEndpoint = ALLOWED_ENDPOINTS.find((endpoint) =>
    endpoint.pattern.test(pathStr),
  );

  if (!matchedEndpoint) {
    logger.warn({ path: pathStr }, "Blocked proxy attempt to invalid path");
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!matchedEndpoint.methods.includes(request.method)) {
    logger.warn(
      { path: pathStr, method: request.method },
      "Blocked proxy attempt with invalid method",
    );
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 },
    );
  }

  const originError = validateOrigin(request);
  if (originError) return originError;

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

    if (BFF_SERVICE_CREDENTIAL) {
      headers.set("x-bff-service-credential", BFF_SERVICE_CREDENTIAL);
      const session = request.cookies.get(SESSION_COOKIE)?.value;
      if (session) headers.set("x-pharmafinder-session", session);
    } else {
      headers.set("x-secret-key", API_SECRET_KEY);
    }
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
    if (
      !response.ok &&
      response.headers.get("content-type")?.includes("json")
    ) {
      try {
        const problem = (await response.clone().json()) as { code?: unknown };
        if (typeof problem.code === "string") problemCode = problem.code;
      } catch {
        // The backend may return a non-problem error body. Do not log its contents.
      }
    }
    logger.info(
      {
        route_class: classifyRoute(pathStr),
        status: response.status,
        problem_code: problemCode,
        request_duration_ms: Date.now() - started,
        edge_request_id: edgeRequestId,
        deployment:
          process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID,
      },
      "proxy_request",
    );

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (
        ![
          "content-length",
          "content-encoding",
          "transfer-encoding",
          "connection",
        ].includes(key.toLowerCase())
      ) {
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
              ENCRYPTION_SALT,
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
            "Missing NEXT_PUBLIC_ENCRYPTION_SECRET or NEXT_PUBLIC_ENCRYPTION_SALT. Cannot securely serve data.",
          );
          return NextResponse.json(
            { message: "Server Configuration Error: Missing Encryption Keys" },
            { status: 500 },
          );
        }

        const clientEncrypted = await encryptPayload(
          dataToEncrypt,
          CLIENT_ENCRYPTION_SECRET,
          CLIENT_ENCRYPTION_SALT,
        );

        if (!clientEncrypted) {
          logger.error("Failed to re-encrypt data for client.");
          return NextResponse.json(
            { message: "Internal Server Error: Encryption Failed" },
            { status: 500 },
          );
        }

        return NextResponse.json(
          { encrypted: clientEncrypted },
          {
            status: response.status,
            headers: responseHeaders,
          },
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
      { status: 500 },
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
