/** @jest-environment node */
import { GET, POST } from "./[...path]/route";
import { NextRequest } from "next/server";
import { logger } from "@/shared/lib/logger";

jest.mock("@/shared/lib/crypto", () => ({
  decryptPayload: jest.fn(),
  encryptPayload: jest.fn().mockResolvedValue("encrypted-data"),
}));

jest.mock("@/shared/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify({ status: "ok" })),
    body: null,
  }),
) as jest.Mock;

describe("Proxy Security", () => {
  const createRequest = (
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body?: string,
  ) => new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: new Headers(headers),
    body,
  });

  const createParams = (path: string[]) => Promise.resolve({ path });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.warn as jest.Mock).mockClear();
  });

  it("blocks retired legacy interactive endpoints", async () => {
    const paths = [
      ["pharmacies", "search"],
      ["pharmacies", "viewport", "on_duty"],
      ["nearby_pharmacies", "on_duty"],
      ["city"],
      ["search"],
      ["pharmacies", "123"],
      ["pharmacies", "123", "report"],
    ];

    for (const path of paths) {
      const response = await GET(
        createRequest("GET", `http://localhost:3000/api/proxy/${path.join("/")}`),
        { params: createParams(path) },
      );
      expect(response.status).toBe(403);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not expose the internal pharmacy route resolver to browsers", async () => {
    const path = ["internal", "pharmacies", "route", "123"];
    const response = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/internal/pharmacies/route/123"),
      { params: createParams(path) },
    );
    expect(response.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("allows the request-bound Turnstile completion route", async () => {
    const path = ["v1", "challenges", "turnstile"];
    const response = await POST(
      createRequest(
        "POST",
        "http://localhost:3000/api/proxy/v1/challenges/turnstile",
        { "content-type": "application/json" },
        JSON.stringify({ request_token: "request", turnstile_token: "provider" }),
      ),
      { params: createParams(path) },
    );
    expect(response.status).not.toBe(403);
    expect(response.status).not.toBe(405);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed challenge bodies before forwarding", async () => {
    const path = ["v1", "challenges", "turnstile"];
    const response = await POST(
      createRequest(
        "POST",
        "http://localhost:3000/api/proxy/v1/challenges/turnstile",
        { "content-type": "application/json" },
        JSON.stringify({ request_token: "request", unexpected: true }),
      ),
      { params: createParams(path) },
    );
    expect(response.status).toBe(422);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("allows only the explicit versioned product-action routes", async () => {
    const path = ["v1", "map", "query"];
    const response = await POST(
      createRequest(
        "POST",
        "http://localhost:3000/api/proxy/v1/map/query",
        { "content-type": "application/json" },
        JSON.stringify({
          bbox: { west: 23, south: 37, east: 24, north: 38 },
          zoom: 14,
          duty_time: "now",
        }),
      ),
      { params: createParams(path) },
    );
    expect(response.status).not.toBe(403);
  });

  it("allows the retained legacy read-only endpoints", async () => {
    const paths = [
      ["statistics"],
      ["locations", "cities"],
      ["locations", "cities", "athina"],
    ];

    for (const path of paths) {
      const response = await GET(
        createRequest("GET", `http://localhost:3000/api/proxy/${path.join("/")}`),
        { params: createParams(path) },
      );
      expect(response.status).not.toBe(403);
      expect(response.status).not.toBe(405);
    }
    expect(global.fetch).toHaveBeenCalledTimes(paths.length);
  });

  it("rejects unknown query parameters on legacy endpoints", async () => {
    const path = ["statistics"];
    const response = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/statistics?foo=bar"),
      { params: createParams(path) },
    );
    expect(response.status).toBe(422);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("allows whitelisted query parameters on v1 duty city routes", async () => {
    const path = ["v1", "duty", "cities", "athina"];
    const response = await GET(
      createRequest(
        "GET",
        "http://localhost:3000/api/proxy/v1/duty/cities/athina?time=today&cursor=abc",
      ),
      { params: createParams(path) },
    );
    expect(response.status).not.toBe(422);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects unknown query parameters on v1 duty city routes", async () => {
    const path = ["v1", "duty", "cities", "athina"];
    const response = await GET(
      createRequest(
        "GET",
        "http://localhost:3000/api/proxy/v1/duty/cities/athina?radius=5",
      ),
      { params: createParams(path) },
    );
    expect(response.status).toBe(422);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("overwrites the browser internal IP header with the trusted ingress IP", async () => {
    const path = ["statistics"];
    await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/statistics", {
        "cf-connecting-ip": "203.0.113.7",
      }),
      { params: createParams(path) },
    );

    const forwarded = (global.fetch as jest.Mock).mock.calls[0][1]
      .headers as Headers;
    expect(forwarded.get("x-pharmafinder-client-ip")).toBe("203.0.113.7");
    expect(forwarded.has("cookie")).toBe(false);
  });

  it("forwards rate-limit status and retry headers", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({
        "content-type": "application/json",
        "x-ratelimit-limit": "30",
        "x-ratelimit-remaining": "0",
        "retry-after": "12",
      }),
      text: () => Promise.resolve(JSON.stringify({ message: "Too Many Requests" })),
      body: null,
    });

    const path = ["statistics"];
    const res = await GET(
      createRequest("GET", "http://localhost:3000/api/proxy/statistics"),
      { params: createParams(path) },
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(res.headers.get("retry-after")).toBe("12");
  });

  it("classifies the plural v1 report route as a report request", async () => {
    const path = ["v1", "pharmacies", "SVFNK9i0QHKA7JBxOGOVKQ", "reports"];
    const response = await POST(
      createRequest(
        "POST",
        "http://localhost:3000/api/proxy/v1/pharmacies/SVFNK9i0QHKA7JBxOGOVKQ/reports",
        { "content-type": "application/json" },
        JSON.stringify({ report_type: "other", turnstile_token: "provider" }),
      ),
      { params: createParams(path) },
    );

    expect(response.status).not.toBe(403);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/pharmacies/SVFNK9i0QHKA7JBxOGOVKQ/reports"),
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const logCall = (logger.info as jest.Mock).mock.calls.find(
      ([, msg]) => msg === "proxy_request",
    );
    expect(logCall?.[0]).toMatchObject({ route_class: "report" });
  });
});
