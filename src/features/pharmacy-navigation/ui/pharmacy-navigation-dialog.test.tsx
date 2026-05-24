import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

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
