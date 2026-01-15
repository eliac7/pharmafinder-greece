export const revalidate = 3600;
import {
  getPharmacyStatus,
  pharmacyApi,
  type PharmacyStatusResult,
} from "@/entities/pharmacy";
import { ReportDialog, SharePharmacyDialog } from "@/features/pharmacy-detail";
import { FavoriteButton } from "@/features/favorites";
import { cn } from "@/shared";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Map, MapMarker, MarkerContent } from "@/shared/ui/map";
import {
  ArrowLeft,
  Compass,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

function PharmacyStatusBadge({
  status,
  minutes,
}: {
  status: PharmacyStatusResult["status"];
  minutes: number | null;
}) {
  const config = {
    open: {
      label: "Ανοιχτό Τώρα",
      className:
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25",
      dot: "bg-emerald-500",
    },
    "closing-soon": {
      label: `Κλείνει σε ${minutes}'`,
      className:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/25",
      dot: "bg-amber-500",
    },
    scheduled: {
      label: "Προγραμματισμένο",
      className:
        "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/25",
      dot: "bg-blue-500",
    },
    closed: {
      label: "Κλειστό",
      className:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/25",
      dot: "bg-rose-500",
    },
  };

  const current = config[status] || config.closed;

  return (
    <Badge
      variant="outline"
      className={cn("gap-2 px-3 py-1.5 text-sm", current.className)}
    >
      <span className="relative flex h-2 w-2">
        {status === "open" && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              current.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            current.dot
          )}
        />
      </span>
      {current.label}
    </Badge>
  );
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
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-muted/50"
          >
            <Link href="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
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
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {pharmacy.address},{" "}
                <span className="text-foreground font-medium">
                  {pharmacy.city}
                </span>
              </p>
            </div>
            <PharmacyStatusBadge
              status={statusResult.status}
              minutes={statusResult.minutesUntilClose}
            />
          </div>

          <div className="h-px w-full bg-border/50" />

          <div className="grid grid-cols-2 gap-3">
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
            <div className="p-5 rounded-3xl bg-card border shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Compass className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Τοποθεσία</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pharmacy.address}, {pharmacy.city}, {pharmacy.prefecture}
                  </p>
                </div>
              </div>
            </div>

            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="relative group rounded-3xl overflow-hidden border bg-muted aspect-video">
                <iframe
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${pharmacy.latitude},${pharmacy.longitude}&heading=0&pitch=10&fov=80`}
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
          >
            <MapMarker
              longitude={pharmacy.longitude}
              latitude={pharmacy.latitude}
            >
              <MarkerContent>
                <div className="relative group cursor-pointer">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  <div className="relative flex items-center justify-center p-3 rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background transform group-hover:scale-110 transition-transform">
                    <MapPin className="size-6" />
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-xs font-bold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {pharmacy.name}
                  </div>
                </div>
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
