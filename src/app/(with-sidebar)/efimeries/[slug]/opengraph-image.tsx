import { cityApi } from "@/entities/city";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  generateOgImage,
  loadGoogleFont,
  alt as sharedAlt,
  size as sharedSize,
  contentType as sharedContentType,
} from "@/features/opengraph";

export const alt = sharedAlt;
export const size = sharedSize;
export const contentType = sharedContentType;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let cityName = "Ελλάδα";
  try {
    const cityRes = await cityApi.getCityBySlug(slug);
    if (cityRes.data?.name) {
      cityName = cityRes.data.name;
    }
  } catch {
    cityName = slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  const logoBuffer = await readFile(
    join(process.cwd(), "public", "pharmacy.png")
  );
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const fonts = await Promise.all([
    loadGoogleFont("Inter", 400).then((data) => ({
      name: "Inter",
      data,
      weight: 400 as const,
      style: "normal" as const,
    })),
    loadGoogleFont("Inter", 700).then((data) => ({
      name: "Inter",
      data,
      weight: 700 as const,
      style: "normal" as const,
    })),
  ]);

  return generateOgImage({
    title: cityName,
    type: "city",
    badge: {
      text: "Ανοιχτά Τώρα",
      active: true,
    },
    logoBase64,
    fonts,
  });
}
