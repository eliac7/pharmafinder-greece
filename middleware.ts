import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const ip = request.ip || "";
  requestHeaders.set("x-forwarded-for", ip);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
