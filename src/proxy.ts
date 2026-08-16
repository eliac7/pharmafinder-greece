import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RADIUS_OPTIONS } from "@/entities/pharmacy/model/types";
import { resolvePharmacyRoute } from "@/entities/pharmacy/api/pharmacy-route.server";
import { ApiError } from "@/shared/api/base";
import { renderHttpStatusDocument } from "@/shared/lib/http-status-document";
import { logger } from "@/shared/lib/logger";

function routeReferenceKind(segment: string) {
  if (/^\d+$/.test(segment)) return "legacy_numeric";
  if (/^[A-Za-z0-9_-]{21}[AQgw]$/.test(segment)) return "public_id";
  if (segment.length > 24 && segment.slice(-24, -22) === "--")
    return "canonical";
  return "malformed";
}

function terminalRouteResponse(outcome: "gone" | "not_found") {
  const gone = outcome === "gone";
  return new NextResponse(
    renderHttpStatusDocument({
      title: gone
        ? "Το φαρμακείο δεν είναι πλέον διαθέσιμο | PharmaFinder"
        : "Φαρμακείο δεν βρέθηκε | PharmaFinder",
      heading: gone
        ? "Το φαρμακείο δεν είναι πλέον διαθέσιμο"
        : "Το φαρμακείο δεν βρέθηκε",
      message: gone
        ? "Η δημόσια καταχώριση έχει αφαιρεθεί. Μπορείτε να επιστρέψετε στον χάρτη για να βρείτε διαθέσιμα εφημερεύοντα φαρμακεία."
        : "Η καταχώριση που αναζητήσατε δεν υπάρχει ή η διεύθυνση δεν είναι έγκυρη.",
    }),
    {
      status: gone ? 410 : 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": gone ? "public, max-age=300" : "no-store",
        "x-robots-tag": "noindex",
      },
    },
  );
}

function resolverUnavailable(request: NextRequest, error: unknown) {
  const edgeRequestId =
    request.headers.get("x-vercel-id") ?? request.headers.get("cf-ray");
  logger.error(
    {
      event: "pharmacy_route_resolver_failure",
      route_class: "pharmacy_page",
      reference_kind: routeReferenceKind(
        request.nextUrl.pathname.slice("/farmakeia/".length),
      ),
      upstream_status: error instanceof ApiError ? error.status : undefined,
      error_name: error instanceof Error ? error.name : "UnknownError",
      edge_request_id: edgeRequestId?.slice(0, 200),
      deployment:
        process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID,
    },
    "Pharmacy route resolver unavailable",
  );
  return new NextResponse(
    renderHttpStatusDocument({
      title: "Προσωρινά μη διαθέσιμο | PharmaFinder",
      heading: "Προσωρινά μη διαθέσιμο",
      message:
        "Δεν μπορέσαμε να ελέγξουμε αυτή την καταχώριση. Δοκιμάστε ξανά σε λίγο.",
    }),
    {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": "30",
        "x-robots-tag": "noindex",
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  const pharmacyMatch = request.nextUrl.pathname.match(
    /^\/farmakeia\/([^/]+)$/,
  );
  if (pharmacyMatch) {
    const started = Date.now();
    let routeSegment: string;
    try {
      routeSegment = decodeURIComponent(pharmacyMatch[1]);
    } catch {
      logger.info(
        {
          event: "pharmacy_route_resolution",
          outcome: "not_found",
          reference_kind: "malformed",
          request_duration_ms: Date.now() - started,
        },
        "Malformed pharmacy route",
      );
      return terminalRouteResponse("not_found");
    }

    try {
      const resolution = await resolvePharmacyRoute(routeSegment);
      logger.info(
        {
          event: "pharmacy_route_resolution",
          outcome: resolution.outcome,
          reference_kind: routeReferenceKind(routeSegment),
          request_duration_ms: Date.now() - started,
          edge_request_id: (
            request.headers.get("x-vercel-id") ?? request.headers.get("cf-ray")
          )?.slice(0, 200),
        },
        "Pharmacy route resolved",
      );

      if (resolution.outcome === "redirect") {
        return NextResponse.redirect(
          new URL(resolution.canonical_path, request.url),
          308,
        );
      }
      if (resolution.outcome === "gone") {
        return terminalRouteResponse("gone");
      }
      if (resolution.outcome === "not_found") {
        return terminalRouteResponse("not_found");
      }
      if (request.nextUrl.pathname !== resolution.canonical_path) {
        throw new Error(
          "Canonical resolver response does not match request path",
        );
      }
    } catch (error) {
      return resolverUnavailable(request, error);
    }
  }

  const { searchParams } = request.nextUrl;
  const radiusParam = searchParams.get("radius");

  if (radiusParam) {
    const radius = parseInt(radiusParam, 10);
    const maxRadius = Math.max(...RADIUS_OPTIONS);

    if (!isNaN(radius) && radius > maxRadius) {
      const url = request.nextUrl.clone();
      url.searchParams.set("radius", maxRadius.toString());
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
