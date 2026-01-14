export const revalidate = 3600;
import {
  pharmacyApi,
  getPharmacyStatus,
  type PharmacyStatusResult,
} from "@/entities/pharmacy";
import { ReportDialog } from "@/features/pharmacy-detail";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Map, MapMarker, MarkerContent } from "@/shared/ui/map";
import { ArrowLeft, MapPin, Navigation, Phone, Star } from "lucide-react";
import { cn } from "@/shared";
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
    description: `Τηλέφωνο: ${pharmacy.phone}. Διεύθυνση: ${pharmacy.address}, ${pharmacy.city}. Δείτε ώρες εφημερίας και οδηγίες χάρτη.`,
  };
}

function StatusBadge({
  status,
  statusColor,
  minutes,
}: {
  status: PharmacyStatusResult["status"];
  statusColor: string;
  minutes: number | null;
}) {
  const label =
    status === "open"
      ? "Ανοιχτό"
      : status === "closing-soon"
      ? `Κλείνει σε ${minutes} λεπτά`
      : status === "scheduled"
      ? "Προγραμματισμένο"
      : "Κλειστό";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusColor
      )}
    >
      {label}
    </span>
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center max-w-5xl px-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/" aria-label="Πίσω">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <span className="ml-2 font-semibold line-clamp-1">
            {pharmacy.name}
          </span>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-md bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl md:text-2xl leading-tight">
                      {pharmacy.name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {pharmacy.city}, {pharmacy.prefecture}
                    </p>
                    {isFrequentDuty && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                        <Star className="size-3.5 fill-current" />
                        Συχνά Εφημερεύον
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <StatusBadge
                      status={statusResult.status}
                      statusColor={statusResult.statusColor}
                      minutes={statusResult.minutesUntilClose}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-5 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {pharmacy.phone}
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="w-full gap-2" asChild>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="size-4" />
                    Οδηγίες Πλοήγησης
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2"
                  asChild
                >
                  <a href={`tel:${pharmacy.phone}`}>
                    <Phone className="size-4" />
                    Κλήση
                  </a>
                </Button>
              </div>
              <ReportDialog
                pharmacyId={pharmacy.id}
                pharmacyName={pharmacy.name}
              />
            </div>
          </div>

          <div className="h-[300px] md:h-auto md:min-h-[400px] rounded-xl overflow-hidden border shadow-sm relative">
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
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <div className="relative flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                        <MapPin className="size-6" />
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              </Map>
            ) : (
              <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                Ο χάρτης δεν είναι διαθέσιμος
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
