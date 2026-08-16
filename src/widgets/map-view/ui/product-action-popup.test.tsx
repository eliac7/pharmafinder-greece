import { render, screen } from "@testing-library/react";

const mockClearProductPopup = jest.fn();

jest.mock("@/entities/pharmacy", () => ({
  formatPharmacyHours: () => "08:00 - 20:00",
  getPharmacyStatus: () => ({ status: "open", minutesUntilClose: null }),
}));

jest.mock("@/features/pharmacy-navigation", () => ({
  PharmacyNavigationDialog: () => null,
}));

jest.mock("@/shared/model/use-map-store", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({ setProductPopupTarget: mockClearProductPopup }),
}));

jest.mock("@/shared/ui/map", () => ({
  MapPopup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ProductActionPopup } from "./product-action-popup";

describe("ProductActionPopup", () => {
  it("keeps canonical navigation as an explicit popup action", () => {
    render(
      <ProductActionPopup
        detail={{
          public_id: "SVFNK9i0QHKA7JBxOGOVKQ",
          canonical_path: "/farmakeia/farmakeio-example--SVFNK9i0QHKA7JBxOGOVKQ",
          name: "Φαρμακείο Example",
          address: "Οδός 1",
          city: "Αθήνα",
          prefecture: "Αττικής",
          phone: "2100000000",
          location: { latitude: 37.98, longitude: 23.72 },
          is_frequent_duty: false,
          duty: {
            data_status: "fresh",
            observed_at: null,
            is_on_duty: true,
            closes_at: null,
            periods: [],
          },
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Λεπτομέρειες" })).toHaveAttribute(
      "href",
      "/farmakeia/farmakeio-example--SVFNK9i0QHKA7JBxOGOVKQ",
    );
    expect(screen.queryByText("opaque-marker-handle")).not.toBeInTheDocument();
  });
});
