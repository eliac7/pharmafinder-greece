/** @jest-environment node */
import { NextRequest } from "next/server";

const mockDecryptPayload = jest.fn();

jest.mock("@/shared/lib/crypto", () => ({
  decryptPayload: (payload: string, secret: string, salt: string) =>
    mockDecryptPayload(payload, secret, salt),
  encryptPayload: jest.fn(),
}));

const loadRoute = () => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./route") as typeof import("./route");
};

global.fetch = jest.fn() as jest.Mock;

const BASE_ENV = {
  API_BASE_URL: "http://backend.test",
  BFF_SERVICE_CREDENTIAL: "bff-cred",
  ENCRYPTION_SECRET: "secret",
  ENCRYPTION_SALT: "salt",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const createRequest = (
  options: { origin?: string; cookie?: string } = {},
) => {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.origin) headers.set("origin", options.origin);
  if (options.cookie) headers.set("cookie", options.cookie);
  return new NextRequest("http://localhost:3000/api/session", {
    method: "POST",
    headers,
  });
};

describe("Anonymous session route", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    Object.assign(process.env, BASE_ENV, {
      ANONYMOUS_SESSION_ENABLED: "true",
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("rejects cross-origin requests", async () => {
    const { POST } = loadRoute();
    const response = await POST(createRequest({ origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when anonymous sessions are disabled", async () => {
    process.env.ANONYMOUS_SESSION_ENABLED = "false";
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.code).toBe("SESSION_ISSUANCE_DISABLED");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("returns 503 when the BFF credential is missing", async () => {
    delete process.env.BFF_SERVICE_CREDENTIAL;
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
  });

  it("issues the session cookie from a plain backend payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ session_token: "tok-123" }),
    });
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(200);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("pf_session=tok-123");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend.test/v1/sessions/anonymous",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-bff-service-credential": "bff-cred",
        }),
      }),
    );
  });

  it("decrypts an encrypted backend payload before issuing the cookie", async () => {
    mockDecryptPayload.mockResolvedValue({ session_token: "tok-enc" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ encrypted: "payload" }),
    });
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("pf_session=tok-enc");
  });

  it("forwards an existing session token when present", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ session_token: "tok-new" }),
    });
    const { POST } = loadRoute();
    await POST(createRequest({ cookie: "pf_session=tok-old" }));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-pharmafinder-session": "tok-old",
        }),
      }),
    );
  });

  it("returns 503 when the backend payload lacks a usable session token", async () => {
    mockDecryptPayload.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ encrypted: "payload" }),
    });
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.code).toBe("SESSION_ISSUANCE_INVALID");
  });

  it("passes through backend failures without setting a cookie", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      body: null,
    });
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(502);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns 503 when the backend call throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network down"));
    const { POST } = loadRoute();
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.code).toBe("SESSION_ISSUANCE_UNAVAILABLE");
  });
});
