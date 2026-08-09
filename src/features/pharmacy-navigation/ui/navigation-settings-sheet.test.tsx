import { fireEvent, render, screen } from "@testing-library/react";

import { useNavigationPreferenceStore } from "../model/use-navigation-preference";
import { NavigationSettingsSheet } from "./navigation-settings-sheet";

describe("NavigationSettingsSheet", () => {
  beforeEach(() => {
    localStorage.clear();
    useNavigationPreferenceStore.setState({
      preferredProvider: "ask",
      _hasHydrated: true,
    });
  });

  it("opens accessibly and changes the preferred provider", () => {
    render(<NavigationSettingsSheet />);

    fireEvent.click(screen.getByRole("button", { name: "Ρυθμίσεις" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Προεπιλεγμένη εφαρμογή πλοήγησης",
      })
    ).toBeInTheDocument();

    const googleMaps = screen.getByRole("radio", { name: /Google Maps/ });
    fireEvent.click(googleMaps);

    expect(googleMaps).toBeChecked();
    expect(
      useNavigationPreferenceStore.getState().preferredProvider
    ).toBe("google-maps");
  });

  it("can reset the preference to ask every time", () => {
    useNavigationPreferenceStore.setState({ preferredProvider: "waze" });
    render(<NavigationSettingsSheet />);

    fireEvent.click(screen.getByRole("button", { name: "Ρυθμίσεις" }));
    fireEvent.click(
      screen.getByRole("radio", { name: /Να με ρωτάει κάθε φορά/ })
    );

    expect(
      useNavigationPreferenceStore.getState().preferredProvider
    ).toBe("ask");
  });
});
