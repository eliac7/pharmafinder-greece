import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockDrillMapAction = jest.fn();

let queryResponse = {
  mode: "clusters" as const,
  clusters: [{ handle: "opaque-cluster-handle", center: { latitude: 37.98, longitude: 23.72 }, count: 3 }],
  markers: [],
  returned_count: 3,
  matched_count: 3,
  zoom_required: false,
  duty_coverage: { status: "fresh" as const, complete: true, observed_at: null },
};

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: queryResponse, isFetching: false }),
}));

jest.mock("@/entities/pharmacy", () => ({
  TIME_OPTIONS: ["now", "today", "tomorrow"],
  drillMapAction: mockDrillMapAction,
  queryMapAction: jest.fn(),
}));

jest.mock("@/features/find-pharmacies", () => ({
  useProductNearbyPharmacies: () => ({ data: undefined }),
}));

jest.mock("nuqs", () => ({
  parseAsStringLiteral: () => ({ withDefault: () => "now" }),
  useQueryState: () => ["now"],
}));

jest.mock("@/shared/ui/map", () => ({
  useMap: () => ({
    map: { getZoom: () => 12, on: jest.fn(), off: jest.fn() },
    isLoaded: true,
  }),
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

import { ProductActionViewport } from "./product-action-viewport";

describe("ProductActionViewport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryResponse = {
      mode: "clusters",
      clusters: [{ handle: "opaque-cluster-handle", center: { latitude: 37.98, longitude: 23.72 }, count: 3 }],
      markers: [],
      returned_count: 3,
      matched_count: 3,
      zoom_required: false,
      duty_coverage: { status: "fresh", complete: true, observed_at: null },
    };
  });

  it("drills down through the opaque cluster handle", async () => {
    mockDrillMapAction.mockResolvedValue({
      mode: "markers",
      clusters: [],
      markers: [{ handle: "opaque-marker", name: "Φαρμακείο", public_id: null, latitude: 37.98, longitude: 23.72, city: "Αθήνα" }],
      returned_count: 1,
      matched_count: 1,
      zoom_required: false,
      duty_coverage: { status: "fresh", complete: true, observed_at: null },
    });

    render(<ProductActionViewport />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));

    await waitFor(() => {
      expect(mockDrillMapAction).toHaveBeenCalledWith("opaque-cluster-handle", 14);
      expect(screen.getAllByText("Φαρμακείο").length).toBeGreaterThan(0);
    });
  });
});
