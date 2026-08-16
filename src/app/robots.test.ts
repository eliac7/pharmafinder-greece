import robots from "./robots";

describe("robots sitemap publication", () => {
  it("points crawlers at the static sitemap index", () => {
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://pharmafinder.app";
    try {
      expect(robots().sitemap).toBe(
        "https://pharmafinder.app/sitemaps/sitemap-index.xml"
      );
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_APP_URL;
      } else {
        process.env.NEXT_PUBLIC_APP_URL = previous;
      }
    }
  });
});
