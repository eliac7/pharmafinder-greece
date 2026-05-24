jest.mock("@/features/favorites", () => ({
  FavoriteButton: () => <button type="button">Favorite</button>,
}));

jest.mock("@/features/pharmacy-navigation", () => ({
  PharmacyNavigationDialog: () => <button type="button">Navigation</button>,
}));

import { render, screen } from "@testing-library/react";
import { PharmacyCard } from "./pharmacy-card";
import { useLocationStore } from "@/features/locate-user";
import type { Pharmacy } from "@/entities/pharmacy";

const pharmacy: Pharmacy = {
  id: 1,
  name: "Test Pharmacy",
  address: "Test Address",
  city: "Athens",
  prefecture: "Attica",
  prefecture_english: "Attica",
  phone: "2100000000",
  latitude: 37.9838,
  longitude: 23.7275,
  distance_km: 2,
  data_hours: [
    {
      date: null,
      open_time: "00:00:00",
      close_time: "23:59:00",
    },
  ],
};

describe("PharmacyCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-24T10:00:00+03:00"));
    useLocationStore.setState({
      latitude: 37.9838,
      longitude: 23.7275,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the arrival confidence badge", () => {
    render(<PharmacyCard pharmacy={pharmacy} timeFilter="now" />);

    expect(screen.getByText("Προλαβαίνετε περίπου σε 8'")).toBeInTheDocument();
  });

  it("renders optional freshness and trust indicators when provided by the backend", () => {
    render(
      <PharmacyCard
        pharmacy={{
          ...pharmacy,
          last_updated_at: "2026-05-24T08:30:00.000Z",
          duty_source: { name: "Backend Source" },
          confidence: "high",
        }}
        timeFilter="now"
      />
    );

    expect(screen.getByText(/Πηγή: Backend Source/)).toBeInTheDocument();
    expect(screen.getByText(/Αξιοπιστία: υψηλή/)).toBeInTheDocument();
  });
});
