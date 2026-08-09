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
  const createRequest = (method: string, url: string, headers: Record<string, string> = {}) => {
    return new NextRequest(new URL(url, "http://localhost:3000"), {
      method,
      headers: new Headers(headers),
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

  it("should allow whitelisted POST endpoint (/pharmacies/123/report)", async () => {
    const req = createRequest("POST", "http://localhost:3000/api/proxy/pharmacies/123/report");
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

  it("allows only GET access to the viewport endpoint", async () => {
    const url = "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty";
    const params = { params: createParams(["pharmacies", "viewport", "on_duty"]) };

    const getResponse = await GET(createRequest("GET", url), params);
    expect(getResponse.status).not.toBe(403);
    expect(getResponse.status).not.toBe(405);
    expect((await POST(createRequest("POST", url), params)).status).toBe(405);
  });

  it("overwrites the browser internal IP header with the trusted ingress IP", async () => {
    const req = createRequest(
      "GET",
      "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty",
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
        "http://localhost:3000/api/proxy/pharmacies/viewport/on_duty"
      ),
      { params: createParams(["pharmacies", "viewport", "on_duty"]) }
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
    expect(res.headers.get("x-ratelimit-remaining")).toBe("0");
  });
});
