import { AppSidebar } from "@/widgets/sidebar/ui/app-sidebar";
import { MapPageLayout } from "@/widgets/map-view/ui/map-page-layout";

export default function Page() {
  return (
    <MapPageLayout
      sidebar={<AppSidebar />}
      center={[23.7275, 37.9838]}
      zoom={13}
      minZoom={10}
    />
  );
}
