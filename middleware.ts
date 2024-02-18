import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  let countryCode = request.geo?.country ?? "";
  let countryName = request.geo?.region ?? "";

  return new NextResponse(null, {
    headers: {
      "x-country-code": countryCode,
      "x-country-name": countryName,
    },
  });
}
