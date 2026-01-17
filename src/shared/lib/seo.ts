import { TimeFilter } from "@/entities/pharmacy/model/types";
import { TIME_TRANSLATIONS } from "./date";

interface SeoOptions {
  cityName: string;
  time: TimeFilter;
  dateString?: string;
  slug: string;
}

export function buildSeoTitle({
  cityName,
  time,
}: {
  cityName: string;
  time: TimeFilter;
}) {
  const timeText = TIME_TRANSLATIONS[time];
  return time === "now"
    ? `Εφημερεύοντα Φαρμακεία ${cityName} – Ανοιχτά Τώρα`
    : `Εφημερεύοντα Φαρμακεία ${cityName} – ${timeText}`;
}

export function buildSeoDescription({
  cityName,
  time,
  dateString,
}: SeoOptions) {
  const timeText = TIME_TRANSLATIONS[time];

  if (time === "now") {
    return `Βρείτε όλα τα εφημερεύοντα φαρμακεία σε ${cityName} που είναι ανοιχτά τώρα. Δείτε χάρτη, τηλέφωνα και οδηγίες πλοήγησης.`;
  }

  return `Δείτε τη λίστα με τα εφημερεύοντα φαρμακεία σε ${cityName} για ${timeText}${
    dateString ? ` (${dateString})` : ""
  }. Άμεση ενημέρωση και χάρτης.`;
}

export function buildCanonicalUrl(slug: string, time: TimeFilter) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const path =
    time === "now" ? `/efimeries/${slug}` : `/efimeries/${slug}/${time}`;
  return `${baseUrl}${path}`;
}
