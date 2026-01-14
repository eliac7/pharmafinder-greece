import { cityApi } from "@/entities/city";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDateForTime, TIME_TRANSLATIONS } from "@/shared/lib/date";
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
  params: Promise<{ slug: string; time: string }>;
}

export default async function Image({ params }: Props) {
  const { slug, time } = await params;

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

  const dateString = getDateForTime(time as any) || undefined;
  const timeLabel =
    TIME_TRANSLATIONS[time as keyof typeof TIME_TRANSLATIONS] || time;

  return generateOgImage({
    title: cityName,
    type: "city",
    badge: {
      text: timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1),
      active: time === "now",
    },
    subtitle: dateString,
    logoBase64,
    fonts,
  });
}
