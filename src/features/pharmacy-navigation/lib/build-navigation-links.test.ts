import { buildNavigationLinks } from "./build-navigation-links";

describe("buildNavigationLinks", () => {
  const pharmacy = {
    name: "Φαρμακείο Δοκιμή",
    address: "Σταδίου 1, Αθήνα",
    phone: "2101234567",
    latitude: 37.98381,
    longitude: 23.727539,
  };

  it("builds provider URLs for valid coordinates", () => {
    const links = buildNavigationLinks(pharmacy);

    expect(links.hasCoordinates).toBe(true);
    expect(links.googleMapsUrl).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=37.98381%2C23.727539&travelmode=driving&dir_action=navigate"
    );
    expect(links.appleMapsUrl).toBe(
      "https://maps.apple.com/?daddr=37.98381%2C23.727539&dirflg=d"
    );
    expect(links.wazeUrl).toBe(
      "https://waze.com/ul?ll=37.98381%2C23.727539&navigate=yes&zoom=17&utm_source=pharmafinder_greece"
    );
  });

  it("omits provider URLs when coordinates are missing", () => {
    const links = buildNavigationLinks({
      ...pharmacy,
      latitude: null,
      longitude: null,
    });

    expect(links.hasCoordinates).toBe(false);
    expect(links.googleMapsUrl).toBeNull();
    expect(links.appleMapsUrl).toBeNull();
    expect(links.wazeUrl).toBeNull();
    expect(links.copyText).toBe(`${pharmacy.name}\n${pharmacy.address}`);
  });

  it("normalizes string coordinates and trims phone numbers", () => {
    const links = buildNavigationLinks({
      ...pharmacy,
      phone: " 2101234567 ",
      latitude: "37.98381",
      longitude: "23.727539",
    });

    expect(links.hasCoordinates).toBe(true);
    expect(links.telUrl).toBe("tel:2101234567");
  });

  it("omits tel URL when phone is missing", () => {
    const links = buildNavigationLinks({
      ...pharmacy,
      phone: "",
    });

    expect(links.telUrl).toBeNull();
  });

  it("includes the Google Maps URL in copy text when coordinates exist", () => {
    const links = buildNavigationLinks(pharmacy);

    expect(links.copyText).toContain(pharmacy.name);
    expect(links.copyText).toContain(pharmacy.address);
    expect(links.copyText).toContain("Google Maps: https://www.google.com/maps/dir/");
  });
});
