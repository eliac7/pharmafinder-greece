import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { LocationChoicePanel } from "./location-choice-panel";
import { useLocationStore } from "@/features/locate-user";
import { useMapStore } from "@/shared/model/use-map-store";

jest.mock("@/features/search-city", () => ({
  CitySearchModal: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));

describe("LocationChoicePanel", () => {
  const getCurrentPosition = jest.fn();

  beforeEach(() => {
    getCurrentPosition.mockReset();
    useLocationStore.setState({ latitude: null, longitude: null });
    useMapStore.setState({ isManualLocationAdjusting: false });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition,
      },
    });
  });

  it("does not request browser geolocation on initial render", () => {
    render(<LocationChoicePanel />);

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("requests browser geolocation after the user chooses location", () => {
    render(<LocationChoicePanel />);

    fireEvent.click(screen.getByRole("button", { name: /χρήση τοποθεσίας/i }));

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("enables manual map location adjustment from the panel", () => {
    render(<LocationChoicePanel />);

    fireEvent.click(screen.getByRole("button", { name: /ορισμός στον χάρτη/i }));

    expect(useMapStore.getState().isManualLocationAdjusting).toBe(true);
  });
});
