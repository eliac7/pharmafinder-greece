/** @jest-environment node */
import { GET } from "./route";

describe("legacy sitemap endpoint", () => {
  it("permanently redirects to the generated sitemap index", () => {
    const response = GET(new Request("https://pharmafinder.app/sitemap.xml"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://pharmafinder.app/sitemaps/sitemap-index.xml"
    );
  });
});
