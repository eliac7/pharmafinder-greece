/** @jest-environment node */
import { NextRequest } from "next/server";

import { ApiError } from "@/shared/api/base";
import { proxy } from "./proxy";

const mockResolvePharmacyRoute = jest.fn();

jest.mock("@/entities/pharmacy/api/pharmacy-route.server", () => ({
  resolvePharmacyRoute: (...args: unknown[]) => mockResolvePharmacyRoute(...args),
}));

const canonicalPath =
  "/farmakeia/farmakeio-papadopoulos-athina--jVLkgJjOTbik43IeIBvHcg";

describe("Phase 1 pharmacy route proxy", () => {
  beforeEach(() => mockResolvePharmacyRoute.mockReset());

  it("redirects a legacy numeric alias directly to the canonical URL", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "redirect",
      canonical_path: canonicalPath,
    });

    const response = await proxy(
      new NextRequest("https://pharmafinder.app/farmakeia/123")
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      `https://pharmafinder.app${canonicalPath}`
    );
    expect(mockResolvePharmacyRoute).toHaveBeenCalledWith("123");
  });

  it("redirects wrong slugs and merged identities to the resolver target", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "redirect",
      canonical_path: canonicalPath,
    });

    const response = await proxy(
      new NextRequest(
        "https://pharmafinder.app/farmakeia/old-or-merged--AAAAAAAAQACAAAAAAAAAAA"
      )
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      `https://pharmafinder.app${canonicalPath}`
    );
  });

  it("passes through a canonical route after exactly one resolver request", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "canonical",
      canonical_path: canonicalPath,
    });

    const response = await proxy(
      new NextRequest(`https://pharmafinder.app${canonicalPath}`)
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(mockResolvePharmacyRoute).toHaveBeenCalledTimes(1);
  });

  it("returns the reusable styled tombstone with HTTP 410", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "gone",
      canonical_path: null,
    });

    const response = await proxy(
      new NextRequest(
        "https://pharmafinder.app/farmakeia/removed--jVLkgJjOTbik43IeIBvHcg"
      )
    );

    expect(response.status).toBe(410);
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await response.text()).toContain(
      "Το φαρμακείο δεν είναι πλέον διαθέσιμο"
    );
  });

  it("returns a true 404 for an unknown identity", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "not_found",
      canonical_path: null,
    });

    const response = await proxy(
      new NextRequest(
        "https://pharmafinder.app/farmakeia/unknown--jVLkgJjOTbik43IeIBvHcg"
      )
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await response.text()).toContain("Το φαρμακείο δεν βρέθηκε");
  });

  it.each([
    ["backend 5xx", new ApiError(503, "Service Unavailable")],
    ["network failure", new TypeError("fetch failed")],
  ])("returns a controlled 503 for %s", async (_label, error) => {
    mockResolvePharmacyRoute.mockRejectedValue(error);

    const response = await proxy(
      new NextRequest(`https://pharmafinder.app${canonicalPath}`)
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("30");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toContain("Προσωρινά μη διαθέσιμο");
  });

  it("fails closed when a canonical resolver response disagrees with the path", async () => {
    mockResolvePharmacyRoute.mockResolvedValue({
      outcome: "canonical",
      canonical_path: canonicalPath,
    });

    const response = await proxy(
      new NextRequest(
        "https://pharmafinder.app/farmakeia/different--AAAAAAAAQACAAAAAAAAAAA"
      )
    );

    expect(response.status).toBe(503);
  });

  it("preserves the Phase 0 radius containment redirect", async () => {
    const response = await proxy(
      new NextRequest("https://pharmafinder.app/?radius=999")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://pharmafinder.app/?radius=20"
    );
    expect(mockResolvePharmacyRoute).not.toHaveBeenCalled();
  });
});
