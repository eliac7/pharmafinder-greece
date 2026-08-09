import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { useNavigationPreferenceStore } from "../model/use-navigation-preference";
import { PharmacyNavigationDialog } from "./pharmacy-navigation-dialog";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const pharmacy = {
  name: "Φαρμακείο Δοκιμή",
  address: "Σταδίου 1, Αθήνα",
  phone: "2101234567",
  latitude: 37.98381,
  longitude: 23.727539,
};

describe("PharmacyNavigationDialog", () => {
  const writeText = jest.fn();
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    localStorage.clear();
    useNavigationPreferenceStore.setState({
      preferredProvider: "ask",
      _hasHydrated: true,
    });
    writeText.mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("opens and renders provider, copy, and call actions", () => {
    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Google Maps/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://www.google.com/maps/dir/")
    );
    expect(screen.getByRole("link", { name: /Apple Maps/ })).toHaveAttribute(
      "href",
      expect.stringContaining("https://maps.apple.com/")
    );
    expect(screen.getByRole("link", { name: /Waze/ })).toHaveAttribute(
      "href",
      expect.stringContaining("utm_source=pharmafinder_greece")
    );
    expect(screen.getByRole("button", { name: "Αντιγραφή" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Κλήση" })).toHaveAttribute(
      "href",
      "tel:2101234567"
    );
    expect(
      screen.getByRole("checkbox", { name: "Να θυμάσαι την επιλογή μου" })
    ).not.toBeChecked();
  });

  it("does not save a provider when remember is not selected", () => {
    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));
    fireEvent.click(screen.getByRole("link", { name: /Google Maps/ }));

    expect(
      useNavigationPreferenceStore.getState().preferredProvider
    ).toBe("ask");
  });

  it("saves a remembered provider and uses it for direct navigation", async () => {
    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Να θυμάσαι την επιλογή μου" })
    );
    fireEvent.click(screen.getByRole("link", { name: /Waze/ }));

    expect(
      useNavigationPreferenceStore.getState().preferredProvider
    ).toBe("waze");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: "Οδηγίες" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://waze.com/ul")
    );
  });

  it("bypasses the chooser when a valid provider is already saved", () => {
    useNavigationPreferenceStore.setState({
      preferredProvider: "apple-maps",
      _hasHydrated: true,
    });

    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    expect(screen.getByRole("link", { name: "Οδηγίες" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://maps.apple.com/")
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("falls back to the chooser when the saved provider has no URL", () => {
    useNavigationPreferenceStore.setState({
      preferredProvider: "google-maps",
      _hasHydrated: true,
    });

    render(
      <PharmacyNavigationDialog
        pharmacy={{ ...pharmacy, latitude: null, longitude: null }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Να θυμάσαι την επιλογή μου" })
    ).not.toBeInTheDocument();
  });

  it("disables provider actions when coordinates are missing", () => {
    render(
      <PharmacyNavigationDialog
        pharmacy={{ ...pharmacy, latitude: null, longitude: null }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));

    expect(screen.getByRole("button", { name: /Google Maps/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Apple Maps/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Waze/ })).toBeDisabled();
    expect(screen.getByText(/Δεν υπάρχουν διαθέσιμες συντεταγμένες/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Αντιγραφή" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Κλήση" })).toBeInTheDocument();
  });

  it("copies navigation details and shows success toast", async () => {
    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));
    fireEvent.click(screen.getByRole("button", { name: "Αντιγραφή" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Φαρμακείο Δοκιμή")
    );
    expect(toast.success).toHaveBeenCalledWith("Τα στοιχεία αντιγράφηκαν!");
  });

  it("shows an error toast when copying fails", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    render(<PharmacyNavigationDialog pharmacy={pharmacy} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));
    fireEvent.click(screen.getByRole("button", { name: "Αντιγραφή" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Αποτυχία αντιγραφής"));
  });

  it("hides the call action when phone is missing", () => {
    render(<PharmacyNavigationDialog pharmacy={{ ...pharmacy, phone: "" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Οδηγίες" }));

    expect(screen.queryByRole("link", { name: "Κλήση" })).not.toBeInTheDocument();
  });
});
