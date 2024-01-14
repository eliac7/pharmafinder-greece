import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const url = new URL(request.url);

  if (!url.searchParams.has("radius")) {
    url.searchParams.set("radius", "3");
    return NextResponse.redirect(url);
  } else {
    if (isNaN(Number(url.searchParams.get("radius")))) {
      url.searchParams.set("radius", "3");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/now", "/today", "/tomorrow", "/nearby"],
};
