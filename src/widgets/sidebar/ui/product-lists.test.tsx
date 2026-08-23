import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRevealProductHandle = jest.fn();
const mockSetProductPopupTarget = jest.fn();
const mockNearbyQuery = jest.fn();
const mockCityQuery = jest.fn();

const item = {
  handle: "opaque-list-handle",
  name: "Φαρμακείο Λίστας",
  address_short: "Οδός 2",
  city: "Αθήνα",
  public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
  phone: null,
  distance_km: 1.1,
  latitude: 37.98,
  longitude: 23.72,
  is_frequent_duty: false,
  duty_summary: {
    data_status: "fresh" as const,
    observed_at: null,
    is_on_duty: true,
    closes_at: null,
    periods: [],
  },
};

const detail = {
  public_id: item.public_id,
  canonical_path: "/farmakeia/farmakeio-listas--SVFNK9i0QHKA7JBxOGOVKQ",
  name: item.name,
  address: item.address_short,
  city: item.city,
  prefecture: "Αττικής",
  phone: null,
  location: { latitude: item.latitude, longitude: item.longitude },
  is_frequent_duty: false,
  duty: { ...item.duty_summary, periods: [] },
};

jest.mock("@/entities/pharmacy", () => ({
  ...jest.requireActual("@/entities/pharmacy/lib/status"),
  DEFAULT_RADIUS: 2,
  normalizeRadius: (value: number) => ([2, 5, 10, 20].includes(value) ? value : 2),
  TIME_OPTIONS: ["now", "today", "tomorrow"],
  formatPharmacyHours: () => "08:00 - 20:00",
  getPharmacyStatus: () => ({ status: "open", statusColor: "", minutesUntilClose: null }),
  getDutySummaryStatus: () => ({ status: "open", statusColor: "", minutesUntilClose: null }),
  revealProductHandle: mockRevealProductHandle,
  useProductCityPharmacies: () => mockCityQuery(),
  queryCityAction: jest.fn(),
}));

jest.mock("@/features/find-pharmacies", () => ({
  useProductNearbyPharmacies: () => mockNearbyQuery(),
}));

jest.mock("nuqs", () => ({
  parseAsInteger: { withDefault: () => 2 },
  parseAsStringLiteral: () => ({ withDefault: () => "now" }),
  useQueryState: (key: string) => (key === "radius" ? [2] : ["now"]),
}));

jest.mock("@/features/favorites", () => ({ FavoriteButton: () => null }));
jest.mock("@/features/pharmacy-navigation", () => ({ PharmacyNavigationDialog: () => null }));
jest.mock("@/features/locate-user", () => ({
  useLocationStore: () => ({ latitude: 37.98, longitude: 23.72 }),
}));
jest.mock("@/features/locate-user/model/use-locate-me", () => ({
  useLocateMe: () => ({ locate: jest.fn(), isLoading: false }),
}));
jest.mock("@/shared/model/use-map-store", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({ flyTo: jest.fn(), setProductPopupTarget: mockSetProductPopupTarget }),
}));
jest.mock("@/shared/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("@/shared/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile: false, setSnapPoint: jest.fn() }),
}));
jest.mock("@/shared/lib/hooks/use-visual-viewport-snap-points", () => ({
  useVisualViewportSnapPoints: () => ({ defaultSnap: 0.5 }),
}));

import { ProductCityList } from "./product-city-list";
import { ProductNearbyList } from "./product-nearby-list";

describe("bounded v1 pharmacy lists", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRevealProductHandle.mockResolvedValue(detail);
    mockNearbyQuery.mockReturnValue({
      data: { items: [item], returned_count: 1, has_more: false, duty_coverage: { status: "fresh" } },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });
    mockCityQuery.mockReturnValue({
      data: { items: [item], returned_count: 1, has_more: false, next_cursor: null, duty_coverage: { status: "fresh" } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("opens the popup from a nearby v1 card", async () => {
    render(<ProductNearbyList />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockRevealProductHandle).toHaveBeenCalledWith(item.handle);
      expect(mockSetProductPopupTarget).toHaveBeenCalled();
    });
  });

  it("opens the popup from a city v1 card", async () => {
    render(<ProductCityList citySlug="athina" time="now" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockRevealProductHandle).toHaveBeenCalledWith(item.handle);
      expect(mockSetProductPopupTarget).toHaveBeenCalled();
    });
  });
});
