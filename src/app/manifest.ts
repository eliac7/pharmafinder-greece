import { type MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PharmaFinder",
    short_name: "PharmaFinder",
    description: "Find pharmacies fast, with location-aware results.",
    id: "pharmafinder-greece",
    start_url: "/",
    scope: "/",
    orientation: "portrait",
    lang: "el",
    dir: "ltr",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#fbfbfb",
    theme_color: "#aec7c1",
    categories: ["health", "medical", "utilities"],
    prefer_related_applications: false,
    related_applications: [],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pharmacy.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile.png",
        sizes: "1024x1024",
        type: "image/png",
        form_factor: "narrow",
        label: "PharmaFinder - Βρες Φαρμακεία Κοντά Σου",
      },
      {
        src: "/screenshots/desktop.png",
        sizes: "1024x1024",
        type: "image/png",
        form_factor: "wide",
        label: "PharmaFinder - Χάρτης Φαρμακείων",
      },
    ],
  };
}
