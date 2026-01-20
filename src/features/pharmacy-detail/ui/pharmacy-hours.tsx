import { Clock } from "lucide-react";
import { formatPharmacyHours, type Pharmacy } from "@/entities/pharmacy";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type PharmacyHoursProps = {
  hours: NonNullable<Pharmacy["data_hours"]>;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const toYmdLocal = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseYmd = (dateStr: string) => {
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);
  if (!yyyy || !mm || !dd) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getDayLabel = (dateStr: string) => {
  const parsedDate = parseYmd(dateStr);
  if (!parsedDate) return dateStr;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (dateStr === toYmdLocal(today)) return "ΣΗΜΕΡΑ";
  if (dateStr === toYmdLocal(tomorrow)) return "ΑΥΡΙΟ";

  return new Intl.DateTimeFormat("el-GR", { weekday: "long" })
    .format(parsedDate)
    .toUpperCase();
};

const getShortDate = (dateStr: string) => {
  const parsedDate = parseYmd(dateStr);
  if (!parsedDate) return dateStr;
  return `${pad2(parsedDate.getDate())}/${pad2(parsedDate.getMonth() + 1)}`;
};

const groupHoursByDate = (hours: PharmacyHoursProps["hours"]) =>
  hours.reduce<Record<string, PharmacyHoursProps["hours"]>>((acc, slot) => {
    if (!slot.date) return acc;
    acc[slot.date] = acc[slot.date] ? [...acc[slot.date], slot] : [slot];
    return acc;
  }, {});

export function PharmacyHours({ hours }: PharmacyHoursProps) {
  if (!hours || hours.length === 0) return null;

  const groupedHours = groupHoursByDate(hours);
  const sortedDates = Object.keys(groupedHours).sort();

  if (sortedDates.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 px-4 py-3 border-b">
        <div className="flex items-center gap-2.5">
          <Clock className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Ωράριο & Εφημερίες
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {sortedDates.map((date) => {
            const slots = groupedHours[date];
            const formattedHours = formatPharmacyHours(slots);

            return (
              <div
                key={date}
                className="flex flex-row items-baseline justify-between px-4 py-3 text-sm hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 shrink-0 w-[40%]">
                  <span className="font-semibold text-foreground text-xs md:text-sm">
                    {getDayLabel(date)}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-md">
                    {getShortDate(date)}
                  </span>
                </div>

                <div className="text-right text-foreground/90 font-medium tabular-nums leading-tight gap-y-2 flex flex-col">
                  {formattedHours ? (
                     formattedHours.split(',').map((part, i) => (
                        <div key={i}>{part.trim()}</div>
                     ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}