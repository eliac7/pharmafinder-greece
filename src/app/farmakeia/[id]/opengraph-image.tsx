import { pharmacyApi, getPharmacyStatus } from "@/entities/pharmacy";
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
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));

  if (!pharmacy || Object.keys(pharmacy).length === 0) {
    return null;
  }

  const statusResult = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? false,
    pharmacy.next_day_close_time ?? null,
    "now"
  );

  const statusLabel =
    statusResult.status === "open"
      ? "Ανοιχτό"
      : statusResult.status === "closing-soon"
      ? "Κλείνει Σύντομα"
      : "Κλειστό";

  const statusColor =
    statusResult.status === "open"
      ? "#10b981"
      : statusResult.status === "closing-soon"
      ? "#f59e0b"
      : "#ef4444";

  // Load Logo
  const logoBuffer = await readFile(
    join(process.cwd(), "public", "pharmacy.png")
  );
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  // Load Fonts
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
    title: pharmacy.name,
    type: "pharmacy",
    subtitle: `${pharmacy.address}, ${pharmacy.city}`,
    badge: {
      text: statusLabel,
      active: statusResult.status === "open" || statusResult.status === "closing-soon",
      color: statusColor,
    },
    logoBase64,
    fonts,
  });
}