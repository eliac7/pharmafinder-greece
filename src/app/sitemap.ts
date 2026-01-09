import { MetadataRoute } from "next";
import { cityApi } from "@/entities/city/api/city.api";
import { logger } from "@/shared/lib/logger";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const cities = await cityApi.getCities();

    if (cities && Array.isArray(cities) && cities.length > 0) {
      const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
        url: `${baseUrl}/efimeries/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }));

      routes.push(...cityRoutes);
    }
  } catch (error) {
    logger.error(
      { error, context: "sitemap" },
      "Failed to fetch cities for sitemap"
    );
  }

  return routes;
}
