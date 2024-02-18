import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  let countryCode = request.geo?.country ?? "";
  let countryName = request.geo?.region ?? "";

  console.log("Country code:", countryCode);
  console.log("Country name:", countryName);

  return NextResponse.next({
    headers: {
      "x-country-code": countryCode,
      "x-country-name": countryName,
    },
  });
}
