/** @jest-environment node */
import { GET, POST } from "./[...path]/route";
import { NextRequest } from "next/server";

jest.mock("@/shared/lib/crypto", () => ({
  decryptPayload: jest.fn(),
  encryptPayload: jest.fn().mockResolvedValue("encrypted-data"),
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
});
