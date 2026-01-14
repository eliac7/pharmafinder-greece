export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { decryptPayload } from "@/shared/lib/crypto";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";

const cleanHeaders = (headers: Headers): Headers => {
  const newHeaders = new Headers(headers);
  newHeaders.delete("content-length");
  newHeaders.delete("content-encoding");
  newHeaders.delete("transfer-encoding");
  return newHeaders;
};

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathStr}${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const headers = new Headers(request.headers);

    headers.set("x-secret-key", API_SECRET_KEY);

    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    const body = request.body;

    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: body,
      // @ts-expect-error - duplex is needed for streaming bodies in some environments but ts might complain
      duplex: body ? "half" : undefined,
    });

    const sanitizedHeaders = cleanHeaders(response.headers);

    if (!response.ok) {
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: sanitizedHeaders,
      });
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      if (!text) {
        return new NextResponse(null, {
          status: response.status,
          headers: sanitizedHeaders,
        });
      }

      try {
        const json = JSON.parse(text);
        if (json && typeof json === "object" && "encrypted" in json) {
          const decrypted = await decryptPayload(
            json.encrypted,
            ENCRYPTION_SECRET,
            ENCRYPTION_SALT
          );
          return NextResponse.json(decrypted, {
            status: response.status,
            headers: sanitizedHeaders,
          });
        } else {
          return NextResponse.json(json, {
            status: response.status,
            headers: sanitizedHeaders,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return new NextResponse(text, {
            status: response.status,
            headers: sanitizedHeaders,
          });
        } else {
          console.error("Failed to parse JSON:", error);
        }
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: sanitizedHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
