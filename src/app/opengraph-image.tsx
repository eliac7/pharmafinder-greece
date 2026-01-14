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

export default async function Image() {
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
    title: "Pharmafinder Greece",
    type: "generic",
    subtitle: "Βρείτε εφημερεύοντα φαρμακεία κοντά σας, άμεσα & αξιόπιστα.",
    badge: {
      text: "Πανελλαδική Κάλυψη",
      active: true,
    },
    logoBase64,
    fonts,
  });
}
