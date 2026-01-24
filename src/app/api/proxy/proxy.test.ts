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

  it("should block non-whitelisted endpoint (/admin)", async () => {
    const req = createRequest("GET", "http://localhost:3000/api/proxy/admin");
    const res = await GET(req, { params: createParams(["admin"]) });
    expect(res.status).toBe(403);
  });

  it("should allow whitelisted POST endpoint (/pharmacies/123/report)", async () => {
    const req = createRequest("POST", "http://localhost:3000/api/proxy/pharmacies/123/report");
    const res = await POST(req, { params: createParams(["pharmacies", "123", "report"]) });
    expect(res.status).toBe(200);
  });

  it("should block invalid path pattern (/locations/cities/some/nested/invalid)", async () => {
      const req = createRequest("GET", "http://localhost:3000/api/proxy/locations/cities/a/b");
      const res = await GET(req, { params: createParams(["locations", "cities", "a", "b"]) });
      expect(res.status).toBe(403);
  });
});