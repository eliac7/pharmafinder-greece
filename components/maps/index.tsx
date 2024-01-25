import dynamic from "next/dynamic";
import PharmacyThumbnailSkeleton from "./PharmacyThumbnailSkeleton";

const DynamicPharmacyMap = dynamic(
  () => import("@/components/maps/pharmacyMap"),
  {
    ssr: false,
  },
);

const DynamicThumbnailMap = dynamic(
  () => import("@/components/maps/thumbnailMap"),
  {
    loading: () => <PharmacyThumbnailSkeleton />,
    ssr: false,
  },
);

export { DynamicPharmacyMap, DynamicThumbnailMap };
