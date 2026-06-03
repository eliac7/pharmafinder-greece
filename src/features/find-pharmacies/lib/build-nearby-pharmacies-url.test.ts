import { buildNearbyPharmaciesUrl } from "./build-nearby-pharmacies-url";

describe("buildNearbyPharmaciesUrl", () => {
  it("omits the default now time filter", () => {
    expect(buildNearbyPharmaciesUrl({ timeFilter: "now" })).toBe("/");
  });

  it("adds today as a nearby time filter", () => {
    expect(buildNearbyPharmaciesUrl({ timeFilter: "today" })).toBe(
      "/?time=today"
    );
  });

  it("adds tomorrow as a nearby time filter", () => {
    expect(buildNearbyPharmaciesUrl({ timeFilter: "tomorrow" })).toBe(
      "/?time=tomorrow"
    );
  });

  it("preserves a valid radius", () => {
    expect(
      buildNearbyPharmaciesUrl({ timeFilter: "today", radius: "10" })
    ).toBe("/?time=today&radius=10");
  });

  it("ignores an invalid radius", () => {
    expect(
      buildNearbyPharmaciesUrl({ timeFilter: "today", radius: "7" })
    ).toBe("/?time=today");
  });
});
