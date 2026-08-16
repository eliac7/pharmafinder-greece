import { act, renderHook } from "@testing-library/react";

import { ApiError } from "@/shared/api/base";

const mockRevealProductHandle = jest.fn();
const mockCompleteProductChallenge = jest.fn();

jest.mock("@/entities/pharmacy", () => ({
  revealProductHandle: mockRevealProductHandle,
  completeProductChallenge: mockCompleteProductChallenge,
}));

import { useRevealWithChallenge } from "./use-reveal-with-challenge";

const detail = {
  public_id: "public-id",
  canonical_path: "/farmakeia/example--public-id",
  name: "Φαρμακείο",
  address: "Οδός 1",
  city: "Αθήνα",
  prefecture: "Αττικής",
  phone: null,
  location: { latitude: 37.9, longitude: 23.7 },
  is_frequent_duty: false,
  duty: {
    data_status: "unknown" as const,
    observed_at: null,
    is_on_duty: null,
    closes_at: null,
    periods: [],
  },
};

const challengeError = () => new ApiError(428, "Precondition Required", {
  status: 428,
  code: "CHALLENGE_REQUIRED",
  title: "Απαιτείται επιβεβαίωση",
  challenge: { type: "turnstile", request_token: "request-token-1" },
});

describe("useRevealWithChallenge", () => {
  beforeEach(() => jest.clearAllMocks());

  it("captures the challenge and retries the original opaque handle after clearance", async () => {
    mockRevealProductHandle
      .mockRejectedValueOnce(challengeError())
      .mockResolvedValueOnce(detail);
    mockCompleteProductChallenge.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useRevealWithChallenge());
    let firstResult;
    await act(async () => {
      firstResult = await result.current.reveal("opaque-handle");
    });

    expect(firstResult).toBeNull();
    expect(result.current.challenge).toEqual({
      handle: "opaque-handle",
      requestToken: "request-token-1",
    });

    let retriedDetail;
    await act(async () => {
      retriedDetail = await result.current.verifyChallenge("provider-token");
    });

    expect(mockCompleteProductChallenge).toHaveBeenCalledWith("request-token-1", "provider-token");
    expect(mockRevealProductHandle).toHaveBeenLastCalledWith("opaque-handle");
    expect(retriedDetail).toEqual(detail);
    expect(result.current.challenge).toBeNull();
  });

  it("keeps the protected detail closed and does not retry after invalid clearance", async () => {
    mockRevealProductHandle.mockRejectedValueOnce(challengeError());
    const invalid = new ApiError(400, "Bad Request", {
      status: 400,
      code: "CHALLENGE_INVALID",
      title: "Η επαλήθευση δεν είναι έγκυρη",
    });
    mockCompleteProductChallenge.mockRejectedValueOnce(invalid);

    const { result } = renderHook(() => useRevealWithChallenge());
    await act(async () => {
      await result.current.reveal("opaque-handle");
    });

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.verifyChallenge("invalid-provider-token");
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toBe(invalid);
    expect(result.current.challenge).toEqual({
      handle: "opaque-handle",
      requestToken: "request-token-1",
    });
    expect(result.current.challengeError).toBe("Η επαλήθευση δεν είναι έγκυρη");
    expect(mockRevealProductHandle).toHaveBeenCalledTimes(1);
  });
});
