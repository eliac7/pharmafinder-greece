import { type MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PharmaFinder",
    short_name: "PharmaFinder",
    description: "Find pharmacies fast, with location-aware results.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfb",
    theme_color: "#aec7c1",
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
  };
}
