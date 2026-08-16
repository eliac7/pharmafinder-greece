import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/shared/api/base";

const mockRevealProductHandle = jest.fn();
const mockCompleteProductChallenge = jest.fn();
const mockFlyTo = jest.fn();
const mockSetProductPopupTarget = jest.fn();

jest.mock("@/entities/pharmacy", () => ({
  revealProductHandle: mockRevealProductHandle,
  completeProductChallenge: mockCompleteProductChallenge,
  formatPharmacyHours: () => "08:00 - 20:00",
  getPharmacyStatus: () => ({ status: "open", statusColor: "", minutesUntilClose: null }),
}));

jest.mock("@/features/favorites", () => ({
  FavoriteButton: () => null,
}));

jest.mock("@/features/pharmacy-navigation", () => ({
  PharmacyNavigationDialog: () => null,
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn() },
}));

jest.mock("@/shared/model/use-map-store", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({
      flyTo: mockFlyTo,
      setProductPopupTarget: mockSetProductPopupTarget,
    }),
}));

import { ActionPharmacyCard } from "./action-pharmacy-card";

describe("ActionPharmacyCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reveals the opaque handle and opens the map popup instead of navigating", async () => {
    const detail = {
      public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
      canonical_path: "/farmakeia/example--SVFNK9i0QHKA7JBxOGOVKQ",
      name: "Φαρμακείο Μαρία",
      address: "Οδός 1",
      city: "Νίκαια",
      prefecture: "Αττικής",
      phone: "2100000000",
      location: { latitude: 37.94, longitude: 23.64 },
      duty: {
        data_status: "unknown" as const,
        observed_at: null,
        is_on_duty: null,
        closes_at: null,
        periods: [],
      },
    };
    mockRevealProductHandle.mockResolvedValue(detail);

    render(
      <ActionPharmacyCard
        item={{
          handle: "opaque-handle",
          name: detail.name,
          address_short: detail.address,
          city: detail.city,
          public_id: detail.public_id,
          phone: detail.phone,
          distance_km: 1.2,
          latitude: detail.location.latitude,
          longitude: detail.location.longitude,
          is_frequent_duty: false,
          duty_summary: { ...detail.duty, periods: [{ opens_at: "08:00:00", closes_at: "20:00:00" }] },
        }}
        timeFilter="now"
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Οδός 1")).toBeInTheDocument();
    expect(screen.getByText("1.2km")).toBeInTheDocument();
    expect(screen.getByText("Εφημερεύει: 08:00 - 20:00")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRevealProductHandle).toHaveBeenCalledWith("opaque-handle");
      expect(mockSetProductPopupTarget).toHaveBeenCalledWith({
        detail,
        center: [23.64, 37.94],
        timeFilter: "now",
      });
      expect(mockFlyTo).toHaveBeenCalledWith([23.64, 37.94], 16, detail.public_id);
    });
  });

  it("renders the challenge, avoids the generic toast, and retries the same handle after verification", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
    const detail = {
      public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
      canonical_path: "/farmakeia/example--SVFNK9i0QHKA7JBxOGOVKQ",
      name: "Φαρμακείο Μαρία",
      address: "Οδός 1",
      city: "Νίκαια",
      prefecture: "Αττικής",
      phone: "2100000000",
      location: { latitude: 37.94, longitude: 23.64 },
      duty: {
        data_status: "unknown" as const,
        observed_at: null,
        is_on_duty: null,
        closes_at: null,
        periods: [],
      },
    };
    const challenge = new ApiError(428, "Precondition Required", {
      status: 428,
      code: "CHALLENGE_REQUIRED",
      title: "Απαιτείται επιβεβαίωση",
      challenge: { type: "turnstile", request_token: "request-token-1" },
    });
    mockRevealProductHandle
      .mockRejectedValueOnce(challenge)
      .mockResolvedValueOnce(detail);
    mockCompleteProductChallenge.mockResolvedValue({ success: true });

    render(
      <ActionPharmacyCard
        item={{
          handle: "opaque-handle",
          name: detail.name,
          address_short: detail.address,
          city: detail.city,
          public_id: detail.public_id,
          phone: detail.phone,
          distance_km: 1.2,
          latitude: detail.location.latitude,
          longitude: detail.location.longitude,
          is_frequent_duty: false,
          duty_summary: { ...detail.duty, periods: [] },
        }}
        timeFilter="now"
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("turnstile")).toBeInTheDocument());

    const { toast } = jest.requireMock("sonner") as { toast: { error: jest.Mock } };
    expect(toast.error).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("turnstile"));
    await waitFor(() => expect(mockCompleteProductChallenge).toHaveBeenCalledWith("request-token-1", "test-turnstile-token"));
    await waitFor(() => expect(mockRevealProductHandle).toHaveBeenCalledTimes(2));
    expect(mockRevealProductHandle).toHaveBeenLastCalledWith("opaque-handle");
    expect(mockSetProductPopupTarget).toHaveBeenCalledWith(expect.objectContaining({ detail }));
  });
});
