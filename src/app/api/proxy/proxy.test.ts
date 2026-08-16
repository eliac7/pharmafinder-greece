/** @jest-environment node */
import { GET, POST } from "./[...path]/route";
import { NextRequest } from "next/server";

// Mock the crypto lib to avoid env var issues
jest.mock("@/shared/lib/crypto", () => ({
  decryptPayload: jest.fn(),
  encryptPayload: jest.fn().mockResolvedValue("encrypted-data"),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify({ status: "ok" })),
    body: null,
  })
) as jest.Mock;

describe("Proxy Security", () => {
  const createRequest = (method: string, url: string, headers: Record<string, string> = {}, body?: string) => {
    return new NextRequest(new URL(url, "http://localhost:3000"), {
      method,
      headers: new Headers(headers),
      body,
    });
  };

  const createParams = (path: string[]) => Promise.resolve({ path });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("should block non-whitelisted endpoint (/admin)", async () => {
    const req = createRequest("GET", "http://localhost:3000/api/proxy/admin");
    const res = await GET(req, { params: createParams(["admin"]) });
    expect(res.status).toBe(403);
  });

  it("does not expose the internal pharmacy route resolver to browsers", async () => {
    const path = ["internal", "pharmacies", "route", "123"];
    const req = createRequest(
      "GET",
      "http://localhost:3000/api/proxy/internal/pharmacies/route/123"
    );
    const res = await GET(req, { params: createParams(path) });

    expect(res.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should allow whitelisted POST endpoint (/pharmacies/123/report)", async () => {
    const req = createRequest("POST", "http://localhost:3000/api/proxy/pharmacies/123/report", {
      "content-type": "application/json",
    }, JSON.stringify({ report_type: "other", description: "ok", turnstile_token: "token" }));
    const res = await POST(req, { params: createParams(["pharmacies", "123", "report"]) });
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(405);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should block invalid path pattern (/locations/cities/some/nested/invalid)", async () => {
      const req = createRequest("GET", "http://localhost:3000/api/proxy/locations/cities/a/b");
      const res = await GET(req, { params: createParams(["locations", "cities", "a", "b"]) });
      expect(res.status).toBe(403);
  });

  it("allows strict compact public IDs for detail, duty, and report routes", async () => {
    const publicId = "jVLkgJjOTbik43IeIBvHcg";
    const detail = await GET(
      createRequest("GET", `http://localhost:3000/api/proxy/pharmacies/${publicId}`),
      { params: createParams(["pharmacies", publicId]) }
    );
    const duty = await GET(
      createRequest("GET", `http://localhost:3000/api/proxy/pharmacies/${publicId}/is-on-duty`),
      { params: createParams(["pharmacies", publicId, "is-on-duty"]) }
    );
    const report = await POST(
      createRequest(
        "POST",
        `http://localhost:3000/api/proxy/pharmacies/${publicId}/report`,
        { "content-type": "application/json" },
        JSON.stringify({ report_type: "other", description: "ok", turnstile_token: "token" })
      ),
      { params: createParams(["pharmacies", publicId, "report"]) }
    );

    expect(detail.status).not.toBe(403);
    expect(duty.status).not.toBe(403);
    expect(report.status).not.toBe(403);
  });

  it("allows only GET access to the viewport endpoint", async () => {
    const url = "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&south=37&east=24&north=38&time=now";
    const params = { params: createParams(["pharmacies", "viewport", "on_duty"]) };

    const getResponse = await GET(createRequest("GET", url), params);
    expect(getResponse.status).not.toBe(403);
    expect(getResponse.status).not.toBe(405);
    expect((await POST(createRequest("POST", url), params)).status).toBe(405);
  });

  it("overwrites the browser internal IP header with the trusted ingress IP", async () => {
    const req = createRequest(
      "GET",
      "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&south=37&east=24&north=38&time=now",
      {
        "x-pharmafinder-client-ip": "198.51.100.99",
        "cf-connecting-ip": "203.0.113.7",
      }
    );

    await GET(req, {
      params: createParams(["pharmacies", "viewport", "on_duty"]),
    });

    const forwarded = (global.fetch as jest.Mock).mock.calls[0][1]
      .headers as Headers;
    expect(forwarded.get("x-pharmafinder-client-ip")).toBe("203.0.113.7");
  });

  it("forwards rate-limit status and retry headers", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Too many requests" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": "42",
          "x-ratelimit-limit": "30",
          "x-ratelimit-remaining": "0",
        },
      })
    );

    const res = await GET(
      createRequest(
        "GET",
        "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&south=37&east=24&north=38&time=now"
      ),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) }
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
    expect(res.headers.get("x-ratelimit-remaining")).toBe("0");
  });

  it("forwards typed overflow problems without encrypting or adding partial data", async () => {
    const problem = {
      type: "https://pharmafinder.app/problems/result-set-too-large",
      title: "Η περιοχή είναι πολύ μεγάλη",
      status: 422,
      code: "RESULT_SET_TOO_LARGE",
      endpoint: "viewport",
      limit: 500,
      result_count_lower_bound: 501,
      remediation: { kind: "zoom_in" },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(problem), {
        status: 422,
        headers: { "content-type": "application/problem+json" },
      }),
    );

    const response = await GET(
      createRequest(
        "GET",
        "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&south=37&east=24&north=38&time=now",
      ),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) },
    );

    expect(response.status).toBe(422);
    expect(response.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    expect(await response.json()).toEqual(problem);
  });

  it("removes public JSON sitemap and all-pharmacy nearby shortcuts", async () => {
    const sitemap = await GET(createRequest("GET", "http://localhost:3000/api/proxy/pharmacies/sitemap"), { params: createParams(["pharmacies", "sitemap"]) });
    const nearby = await GET(createRequest("GET", "http://localhost:3000/api/proxy/nearby_pharmacies"), { params: createParams(["nearby_pharmacies"]) });
    expect(sitemap.status).toBe(403);
    expect(nearby.status).toBe(403);
  });

  it("rejects unknown and duplicate query parameters", async () => {
    const unknown = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&south=37&east=24&north=38&time=now&extra=1"),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) },
    );
    const duplicate = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=23&west=23.1&south=37&east=24&north=38&time=now"),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) },
    );
    expect(unknown.status).toBe(422);
    expect(duplicate.status).toBe(422);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects blank numbers and oversized viewports", async () => {
    const blank = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=&south=37&east=24&north=38&time=now"),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) },
    );
    const oversized = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty?west=20&south=37&east=24&north=38&time=now"),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) },
    );
    expect(blank.status).toBe(422);
    expect(oversized.status).toBe(422);
  });

  it("rejects unknown report fields before forwarding", async () => {
    const response = await POST(
      createRequest(
        "POST",
        "http://localhost:3000/api/proxy/pharmacies/123/report",
        { "content-type": "application/json" },
        JSON.stringify({
          report_type: "other",
          turnstile_token: "token",
          unexpected: true,
        }),
      ),
      { params: createParams(["pharmacies", "123", "report"]) },
    );
    expect(response.status).toBe(422);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
