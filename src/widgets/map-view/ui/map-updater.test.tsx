import { render, waitFor } from "@testing-library/react";

import { MapUpdater } from "./map-updater";

const mockMap = {
  flyTo: jest.fn(),
  getCenter: jest.fn(() => ({ lng: 23.7275, lat: 37.9838 })),
  once: jest.fn(),
};

let mockLocation: { latitude: number | null; longitude: number | null };
let mockRadius: number;
let mockFlyToTarget: {
  center: [number, number];
  zoom?: number;
  pharmacyId?: string;
} | null;

const mockClearFlyToTarget = jest.fn(() => {
  mockFlyToTarget = null;
});
const mockSetPopupTargetId = jest.fn();

jest.mock("@/shared/ui/map", () => ({
  useMap: () => ({ map: mockMap }),
}));

jest.mock("@/features/locate-user", () => ({
  useLocationStore: () => mockLocation,
}));

jest.mock("nuqs", () => ({
  useQueryState: () => [mockRadius],
  parseAsInteger: {
    withDefault: jest.fn((value) => value),
  },
}));

jest.mock("@/entities/pharmacy", () => ({
  DEFAULT_RADIUS: 5,
  radiusToZoom: jest.fn((radius: number) => radius + 10),
}));

jest.mock("@/shared/model/use-map-store", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({
      flyToTarget: mockFlyToTarget,
      clearFlyToTarget: mockClearFlyToTarget,
      setPopupTargetId: mockSetPopupTargetId,
    }),
}));

describe("MapUpdater", () => {
  beforeEach(() => {
    mockLocation = { latitude: null, longitude: null };
    mockRadius = 5;
    mockFlyToTarget = null;
    jest.clearAllMocks();
  });

  it("centers city mode on the provided city center", async () => {
    render(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => {
      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [22.4333, 38.9],
        zoom: 14,
        duration: 0,
      });
    });
  });

  it("re-centers city mode when city camera input changes", async () => {
    const { rerender } = render(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => expect(mockMap.flyTo).toHaveBeenCalledTimes(1));
    mockMap.flyTo.mockClear();

    rerender(
      <MapUpdater
        viewportMode="city"
        cityCenter={[23.7275, 37.9838]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => {
      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [23.7275, 37.9838],
        zoom: 14,
        duration: 800,
      });
    });
  });

  it("does not auto-center city mode when user location changes", async () => {
    const { rerender } = render(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => expect(mockMap.flyTo).toHaveBeenCalledTimes(1));
    mockMap.flyTo.mockClear();
    mockLocation = { latitude: 37.9838, longitude: 23.7275 };

    rerender(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    expect(mockMap.flyTo).not.toHaveBeenCalled();
  });

  it("auto-centers nearby mode when user location is resolved", async () => {
    const { rerender } = render(<MapUpdater viewportMode="nearby" />);

    await waitFor(() => expect(mockMap.flyTo).toHaveBeenCalledTimes(1));
    mockMap.flyTo.mockClear();
    mockLocation = { latitude: 37.9838, longitude: 23.7275 };

    rerender(<MapUpdater viewportMode="nearby" />);

    await waitFor(() => {
      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [23.7275, 37.9838],
        zoom: 15,
        duration: 2000,
      });
    });
  });

  it("keeps explicit fly-to targets working in city mode", async () => {
    const { rerender } = render(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => expect(mockMap.flyTo).toHaveBeenCalledTimes(1));
    mockMap.flyTo.mockClear();
    mockFlyToTarget = {
      center: [22.43, 38.91],
      zoom: 16,
      pharmacyId: "jVLkgJjOTbik43IeIBvHcg",
    };

    rerender(
      <MapUpdater
        viewportMode="city"
        cityCenter={[22.4333, 38.9]}
        cityZoom={14}
        cameraKey="lamia"
      />
    );

    await waitFor(() => {
      expect(mockSetPopupTargetId).toHaveBeenCalledWith(null);
      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [22.43, 38.91],
        zoom: 16,
        duration: 2000,
      });
      expect(mockMap.once).toHaveBeenCalledWith(
        "moveend",
        expect.any(Function)
      );
      expect(mockClearFlyToTarget).toHaveBeenCalled();
    });
  });
});
