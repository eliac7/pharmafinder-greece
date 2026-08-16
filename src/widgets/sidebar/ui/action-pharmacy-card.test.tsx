import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRevealProductHandle = jest.fn();
const mockFlyTo = jest.fn();
const mockSetProductPopupTarget = jest.fn();

jest.mock("@/entities/pharmacy", () => ({
  revealProductHandle: mockRevealProductHandle,
  formatPharmacyHours: () => "08:00 - 20:00",
  getPharmacyStatus: () => ({ status: "open", statusColor: "", minutesUntilClose: null }),
}));

jest.mock("@/features/favorites", () => ({
  FavoriteButton: () => null,
}));

jest.mock("@/features/pharmacy-navigation", () => ({
  PharmacyNavigationDialog: () => null,
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
});
