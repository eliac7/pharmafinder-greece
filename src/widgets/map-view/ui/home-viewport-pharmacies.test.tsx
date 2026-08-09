import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  HomeViewportPharmacies,
  roundViewportBounds,
} from "./home-viewport-pharmacies";

const mockGetViewportOnDuty = jest.fn();
const mockToastError = jest.fn();
let mockTime = "now";
let mockRadius = 2;
let mockLocation = { latitude: 37.9838, longitude: 23.7275 };
let mockBounds = { west: 23.61, south: 37.91, east: 23.84, north: 38.07 };
const mockHandlers: Record<string, (event: unknown) => void> = {};

const mockMap = {
  on: jest.fn((name: string, handler: (event: unknown) => void) => {
    mockHandlers[name] = handler;
  }),
  off: jest.fn((name: string) => {
    delete mockHandlers[name];
  }),
  getBounds: jest.fn(() => ({
    getWest: () => mockBounds.west,
    getSouth: () => mockBounds.south,
    getEast: () => mockBounds.east,
    getNorth: () => mockBounds.north,
  })),
};

jest.mock("@/shared/ui/map", () => ({
  useMap: () => ({ map: mockMap, isLoaded: true }),
}));

jest.mock("@/features/locate-user", () => ({
  useLocationStore: () => mockLocation,
}));

jest.mock("@/features/find-pharmacies", () => ({
  useNearbyPharmacies: () => ({ isFetching: false }),
}));

jest.mock("nuqs", () => ({
  useQueryState: (key: string) =>
    key === "time" ? [mockTime] : [mockRadius],
  parseAsStringLiteral: () => ({ withDefault: jest.fn() }),
  parseAsInteger: { withDefault: jest.fn() },
}));

jest.mock("@/entities/pharmacy", () => ({
  DEFAULT_RADIUS: 2,
  TIME_OPTIONS: ["now", "today", "tomorrow"],
  pharmacyApi: { getViewportOnDuty: (...args: unknown[]) => mockGetViewportOnDuty(...args) },
}));

jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

jest.mock("./pharmacy-markers", () => ({
  PharmacyMarkers: ({ pharmacies }: { pharmacies?: unknown[] }) => (
    <div data-testid="markers" data-count={pharmacies?.length ?? "nearby"} />
  ),
}));

function renderViewport() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HomeViewportPharmacies />
    </QueryClientProvider>
  );
}

function finishMove(originalEvent?: Event) {
  act(() => {
    mockHandlers.movestart({ originalEvent });
    mockHandlers.moveend({});
  });
}

describe("HomeViewportPharmacies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = "now";
    mockRadius = 2;
    mockLocation = { latitude: 37.9838, longitude: 23.7275 };
    mockBounds = { west: 23.61, south: 37.91, east: 23.84, north: 38.07 };
    mockGetViewportOnDuty.mockResolvedValue({
      count: 1,
      data: [{ id: 101 }],
      success: true,
      message: null,
    });
  });

  it("rounds bounds to four decimals", () => {
    expect(
      roundViewportBounds({
        west: 23.612345,
        south: 37.912345,
        east: 23.845678,
        north: 38.076543,
      })
    ).toEqual({ west: 23.6123, south: 37.9123, east: 23.8457, north: 38.0765 });
  });

  it("shows the button after user movement without requesting", () => {
    renderViewport();
    finishMove(new Event("pointerdown"));

    expect(
      screen.getByRole("button", { name: "Αναζήτηση σε αυτή την περιοχή" })
    ).toBeInTheDocument();
    expect(mockGetViewportOnDuty).not.toHaveBeenCalled();
  });

  it("ignores programmatic map movement", () => {
    renderViewport();
    finishMove();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(mockGetViewportOnDuty).not.toHaveBeenCalled();
  });

  it("makes one request on click and replaces markers after success", async () => {
    renderViewport();
    finishMove(new Event("pointerdown"));
    fireEvent.click(
      screen.getByRole("button", { name: "Αναζήτηση σε αυτή την περιοχή" })
    );

    await waitFor(() => expect(mockGetViewportOnDuty).toHaveBeenCalledTimes(1));
    expect(mockGetViewportOnDuty).toHaveBeenCalledWith(
      mockBounds,
      "now",
      expect.any(AbortSignal)
    );
    await waitFor(() => expect(screen.getByTestId("markers")).toHaveAttribute("data-count", "1"));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps the action available and preserves markers after an error", async () => {
    mockGetViewportOnDuty.mockRejectedValueOnce(new Error("API Error: 429"));
    renderViewport();
    finishMove(new Event("pointerdown"));
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(screen.getByRole("button")).toBeEnabled();
    expect(screen.getByTestId("markers")).toHaveAttribute("data-count", "nearby");
  });

  it("refetches the committed viewport when the time filter changes", async () => {
    const view = renderViewport();
    finishMove(new Event("pointerdown"));
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(mockGetViewportOnDuty).toHaveBeenCalledTimes(1));

    mockTime = "today";
    view.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <HomeViewportPharmacies />
      </QueryClientProvider>
    );

    await waitFor(() => expect(mockGetViewportOnDuty).toHaveBeenCalledTimes(2));
    expect(mockGetViewportOnDuty.mock.calls[1][1]).toBe("today");
  });

  it("returns to nearby markers when radius or location changes", async () => {
    const queryClient = new QueryClient();
    const view = render(
      <QueryClientProvider client={queryClient}>
        <HomeViewportPharmacies />
      </QueryClientProvider>
    );
    finishMove(new Event("pointerdown"));
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("markers")).toHaveAttribute("data-count", "1"));

    mockRadius = 5;
    view.rerender(
      <QueryClientProvider client={queryClient}>
        <HomeViewportPharmacies />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByTestId("markers")).toHaveAttribute("data-count", "nearby"));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
