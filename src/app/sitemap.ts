import type { MetadataRoute } from "next";
import { cityApi } from "@/entities/city/api/city.api";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
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
    // 1. Fetch Cities
    const cities = await cityApi.getCities();
    if (cities && Array.isArray(cities) && cities.length > 0) {
      const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
        url: `${baseUrl}/efimeries/${city.slug}/today`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      }));
      routes.push(...cityRoutes);
    }

    // 2. Fetch Pharmacies (Lightweight)
    const pharmacies = await pharmacyApi.getSitemapData();
    if (pharmacies && Array.isArray(pharmacies) && pharmacies.length > 0) {
      const pharmacyRoutes: MetadataRoute.Sitemap = pharmacies.map(
        (pharmacy) => ({
          url: `${baseUrl}/farmakeia/${pharmacy.id}`,
          lastModified: pharmacy.updated_at
            ? new Date(pharmacy.updated_at)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        }),
      );
      routes.push(...pharmacyRoutes);
    }
  } catch (error) {
    logger.error(
      { error, context: "sitemap" },
      "Failed to generate full sitemap",
    );
  }

  return routes;
}
