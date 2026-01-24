export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { decryptPayload, encryptPayload } from "@/shared/lib/crypto";
import { logger } from "@/shared/lib/logger";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";
const CLIENT_ENCRYPTION_SECRET =
  process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";
const CLIENT_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "";

const ALLOWED_ENDPOINTS = [
  { pattern: /^\/pharmacies\/sitemap$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/\d+\/is-on-duty$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/search$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/\d+$/, methods: ["GET"] },
  { pattern: /^\/pharmacies\/\d+\/report$/, methods: ["POST"] },
  { pattern: /^\/nearby_pharmacies$/, methods: ["GET"] },
  { pattern: /^\/nearby_pharmacies\/on_duty$/, methods: ["GET"] },
  { pattern: /^\/city$/, methods: ["GET"] },
  { pattern: /^\/statistics$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/locations\/cities$/, methods: ["GET"] },
  { pattern: /^\/locations\/prefectures$/, methods: ["GET"] },
  { pattern: /^\/search$/, methods: ["GET"] },
];

const ALLOWED_HEADERS = ["content-type", "accept", "user-agent"];

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

    const body = request.body;

    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: body,
      // @ts-expect-error - duplex is needed for streaming bodies in some environments but ts might complain
      duplex: body ? "half" : undefined,
    });

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
