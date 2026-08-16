import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRevealProductHandle = jest.fn();
const mockSetProductPopupTarget = jest.fn();

jest.mock("@/entities/pharmacy", () => ({
  TIME_OPTIONS: ["now", "today", "tomorrow"],
  revealProductHandle: mockRevealProductHandle,
  useProductCityPharmacies: () => ({
    data: {
      items: [
        {
          handle: "opaque-marker-handle",
          name: "Φαρμακείο Μαρκαδόρος",
          address_short: "Οδός 1",
          city: "Αθήνα",
          public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
          phone: null,
          distance_km: null,
          latitude: 37.98,
          longitude: 23.72,
          is_frequent_duty: false,
          duty_summary: {
            data_status: "fresh",
            observed_at: null,
            is_on_duty: true,
            closes_at: null,
            periods: [],
          },
        },
      ],
      returned_count: 1,
      has_more: false,
      next_cursor: null,
      duty_coverage: { status: "fresh", complete: true, observed_at: null },
    },
  }),
}));

jest.mock("nuqs", () => ({
  parseAsStringLiteral: () => ({ withDefault: () => "now" }),
  useQueryState: () => ["now"],
}));

jest.mock("@/shared/model/use-map-store", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({ setProductPopupTarget: mockSetProductPopupTarget }),
}));

jest.mock("@/shared/ui/map", () => ({
  MapMarker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MarkerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MarkerTooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("./product-action-marker", () => ({
  ProductActionMarkerContent: () => <span aria-hidden="true">marker</span>,
}));

jest.mock("./product-action-popup", () => ({
  ProductActionPopupTarget: () => null,
}));

import { PharmacyMarkers } from "./pharmacy-markers";

describe("PharmacyMarkers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reveals the opaque marker handle and opens the popup", async () => {
    const detail = {
      public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
      canonical_path: "/farmakeia/farmakeio-markadoros--SVFNK9i0QHKA7JBxOGOVKQ",
      name: "Φαρμακείο Μαρκαδόρος",
      address: "Οδός 1",
      city: "Αθήνα",
      prefecture: "Αττικής",
      phone: null,
      location: { latitude: 37.98, longitude: 23.72 },
      is_frequent_duty: false,
      duty: {
        data_status: "fresh" as const,
        observed_at: null,
        is_on_duty: true,
        closes_at: null,
        periods: [],
      },
    };
    mockRevealProductHandle.mockResolvedValue(detail);

    render(<PharmacyMarkers citySlug="athina" timeFilter="now" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockRevealProductHandle).toHaveBeenCalledWith("opaque-marker-handle");
      expect(mockSetProductPopupTarget).toHaveBeenCalledWith({
        detail,
        center: [23.72, 37.98],
        timeFilter: "now",
      });
    });
  });
});
