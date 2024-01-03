import dynamic from "next/dynamic";

const DynamicPharmacyMap = dynamic(
  () => import("@/components/maps/pharmacyMap"),
  {
    ssr: false,
  }
);

const DynamicThumbnailMap = dynamic(
  () => import("@/components/maps/thumbnailMap"),
  {
    ssr: false,
  }
);

export { DynamicPharmacyMap, DynamicThumbnailMap };
