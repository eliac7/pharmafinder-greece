import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  let countryCode = request.geo?.country ?? "";
  let cityName = request.geo?.city ?? "";

  return NextResponse.next({
    headers: {
      "x-country-code": countryCode,
      "x-city-name": encodeURIComponent(cityName),
    },
  });
}
