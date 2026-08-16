import { NextRequest, NextResponse } from "next/server";
import { decryptPayload } from "@/shared/lib/crypto";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const BFF_SERVICE_CREDENTIAL = process.env.BFF_SERVICE_CREDENTIAL || "";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "";
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "";
const SESSION_COOKIE = "pf_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (!BFF_SERVICE_CREDENTIAL || process.env.ANONYMOUS_SESSION_ENABLED !== "true") {
    return NextResponse.json(
      { code: "SESSION_ISSUANCE_DISABLED" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) {
    return NextResponse.json(
      { ready: true },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/sessions/anonymous`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-bff-service-credential": BFF_SERVICE_CREDENTIAL,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: { "cache-control": "no-store" },
      });
    }

    const payload = (await response.json()) as {
      encrypted?: string;
      session_token?: unknown;
    };
    const session = payload.encrypted
      ? ((await decryptPayload(
          payload.encrypted,
          ENCRYPTION_SECRET,
          ENCRYPTION_SALT,
        )) as { session_token?: unknown })
      : payload;
    if (typeof session.session_token !== "string" || !session.session_token) {
      return NextResponse.json(
        { code: "SESSION_ISSUANCE_INVALID" },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }

    const result = NextResponse.json(
      { ready: true },
      { headers: { "cache-control": "private, no-store" } },
    );
    result.cookies.set({
      name: SESSION_COOKIE,
      value: session.session_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return result;
  } catch {
    return NextResponse.json(
      { code: "SESSION_ISSUANCE_UNAVAILABLE" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
