/** @jest-environment node */
import { fetchAPI } from "@/shared/api/base";
import { resolvePharmacyRoute } from "./pharmacy-route.server";

jest.mock("@/shared/api/base", () => ({
  fetchAPI: jest.fn(),
}));

const mockFetchAPI = jest.mocked(fetchAPI);

describe("pharmacy route resolver client", () => {
  beforeEach(() => mockFetchAPI.mockReset());

  it("accepts the strict minimal resolver contract", async () => {
    mockFetchAPI.mockResolvedValue({
      outcome: "redirect",
      canonical_path:
        "/farmakeia/farmakeio-athina--jVLkgJjOTbik43IeIBvHcg",
    });

    await expect(resolvePharmacyRoute("123")).resolves.toEqual({
      outcome: "redirect",
      canonical_path:
        "/farmakeia/farmakeio-athina--jVLkgJjOTbik43IeIBvHcg",
    });
    expect(mockFetchAPI).toHaveBeenCalledWith(
      "/internal/pharmacies/route/123",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it.each([
    [{ outcome: "canonical", canonical_path: null }],
    [{ outcome: "gone", canonical_path: "/farmakeia/not-allowed" }],
    [{ outcome: "redirect", canonical_path: "/external/path" }],
    [{ outcome: "unexpected", canonical_path: null }],
    [[]],
  ])("rejects malformed resolver payloads", async (payload) => {
    mockFetchAPI.mockResolvedValue(payload);
    await expect(resolvePharmacyRoute("123")).rejects.toThrow(
      /Invalid .*pharmacy route/
    );
  });
});
