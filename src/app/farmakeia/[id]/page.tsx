export const revalidate = 3600;
import { getPharmacyStatus, pharmacyApi } from "@/entities/pharmacy";
import { ReportDialog, SharePharmacyDialog } from "@/features/pharmacy-detail";
import { FavoriteButton } from "@/features/favorites";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Map, MapMarker, MarkerContent } from "@/shared/ui/map";
import { MapPin, Navigation, Phone, Star } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PharmacyMapMarkerContent } from "./pharmacy-map-marker";
import { PharmacyHours, PharmacyStatusBadge } from "@/features/pharmacy-detail";
import { BackButton } from "./back-button";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));

  if (!pharmacy || Object.keys(pharmacy).length === 0) {
    return { title: "Φαρμακείο Δεν Βρέθηκε" };
  }

  return {
    title: `${pharmacy.name} | Φαρμακείο ${pharmacy.city}`,
    description: `Τηλέφωνο: ${pharmacy.phone}. ${pharmacy.address}.`,
  };
}

export default async function PharmacyPage({ params }: Props) {
  const { id } = await params;
  const pharmacy = await pharmacyApi.getPharmacyDetails(Number(id));

  if (!pharmacy || Object.keys(pharmacy).length === 0) {
    notFound();
  }

  const statusResult = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? false,
    pharmacy.next_day_close_time ?? null,
    "now"
  );

  const isFrequentDuty =
    pharmacy.is_frequent_duty ?? (pharmacy.data_hours?.length ?? 0) > 20;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col min-h-[50vh] md:h-screen md:overflow-y-auto relative z-10 bg-background">
        <header className="sticky top-0 z-50 p-6 bg-background/80 backdrop-blur-xl border-b md:border-none flex items-center justify-between">
          <BackButton />
          <span className="md:hidden font-medium text-sm truncate max-w-50">
            {pharmacy.name}
          </span>
          <SharePharmacyDialog
            pharmacyName={pharmacy.name}
            pharmacyAddress={pharmacy.address}
          />
        </header>

        <main className="px-6 pb-32 md:pb-10 max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 pt-2">
            {isFrequentDuty && (
              <Badge
                variant="secondary"
                className="gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/80 dark:hover:bg-amber-900/40"
              >
                <Star className="size-3 fill-current" />
                ΣΥΧΝΑ ΕΦΗΜΕΡΕΥΟΝ
              </Badge>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                {pharmacy.name}
              </h1>
              <FavoriteButton pharmacyId={pharmacy.id} />
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="size-5 text-muted-foreground shrink-0 mt-1" />
              <p className="text-lg text-muted-foreground leading-snug">
                {pharmacy.address}
              </p>
            </div>
            <PharmacyStatusBadge
              status={statusResult.status}
              minutes={statusResult.minutesUntilClose}
            />
          </div>

          <div className="h-px w-full bg-border/50" />

          <div className="hidden md:grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-14 md:h-20 text-lg rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-[1.02] transition-transform"
              asChild
            >
              <a href={`tel:${pharmacy.phone}`}>
                <div className="flex items-center gap-2">
                  <Phone className="size-5" />
                  <span>Κλήση</span>
                </div>
                <span className="text-xs font-normal opacity-80 hidden md:block">
                  {pharmacy.phone}
                </span>
              </a>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="h-14 md:h-20 text-lg rounded-2xl flex flex-col items-center justify-center gap-1 bg-muted/50 hover:bg-muted border border-transparent hover:border-border hover:scale-[1.02] transition-all"
              asChild
            >
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="size-5" />
                  <span>Οδηγίες</span>
                </div>
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            <PharmacyHours hours={pharmacy.data_hours ?? []} />

            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="relative group rounded-3xl overflow-hidden border bg-muted aspect-video">
                <iframe
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${pharmacy.latitude},${pharmacy.longitude}&pitch=10&fov=80`}
                />
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pharmacy.latitude},${pharmacy.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors"
                >
                  <Button
                    variant="secondary"
                    className="shadow-lg backdrop-blur-md bg-background/80 hover:bg-background"
                  >
                    Άνοιγμα Street View
                  </Button>
                </a>
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <ReportDialog
                pharmacyId={pharmacy.id}
                pharmacyName={pharmacy.name}
              />
            </div>
          </div>
        </main>
      </div>

      <div className="md:w-[50%] lg:w-[55%] h-[40vh] md:h-screen md:sticky md:top-0 order-first md:order-last bg-muted relative border-b md:border-l border-border">
        {pharmacy.latitude && pharmacy.longitude ? (
          <Map
            center={[pharmacy.longitude, pharmacy.latitude]}
            zoom={15}
            attributionControl={false}
            interactive={false}
          >
            <MapMarker
              longitude={pharmacy.longitude}
              latitude={pharmacy.latitude}
            >
              <MarkerContent>
                <PharmacyMapMarkerContent
                  pharmacyId={pharmacy.id}
                  pharmacyName={pharmacy.name}
                />
              </MarkerContent>
            </MapMarker>
          </Map>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
            <MapPin className="size-12 mb-4 opacity-20" />
            <p>Ο χάρτης δεν είναι διαθέσιμος</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-gradient-to-t from-background via-background/50 to-transparent md:hidden" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="w-full rounded-xl shadow-lg" asChild>
            <a href={`tel:${pharmacy.phone}`}>
              <Phone className="size-4 mr-2" />
              Κλήση
            </a>
          </Button>
          <Button
            size="lg"
            variant="default"
            className="w-full rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
            asChild
          >
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="size-4 mr-2" />
              Πλοήγηση
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
