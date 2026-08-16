import { getPharmacyCanonicalPath } from "./public-url";

describe("getPharmacyCanonicalPath", () => {
  it("builds the canonical slug and compact-ID route", () => {
    expect(
      getPharmacyCanonicalPath({
        canonical_slug: "farmakeio-papadopoulos-athina",
        public_id: "jVLkgJjOTbik43IeIBvHcg",
      })
    ).toBe(
      "/farmakeia/farmakeio-papadopoulos-athina--jVLkgJjOTbik43IeIBvHcg"
    );
  });

  it("fails closed instead of falling back when public identity is malformed", () => {
    expect(() =>
      getPharmacyCanonicalPath({
        id: 123,
        canonical_slug: "farmakeio-papadopoulos-athina",
        public_id: "not-a-public-id",
      })
    ).toThrow("malformed canonical public identity");
  });

  it("keeps an old frontend working before the backend cutover", () => {
    expect(
      getPharmacyCanonicalPath({
        id: 123,
        canonical_slug: null,
        public_id: null,
      })
    ).toBe("/farmakeia/123");
  });
});
