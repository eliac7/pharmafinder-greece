/**
 * Build SEO description for pharmacy shifts (efimeries) pages
 * @param opts - Options for building the description
 * @returns Formatted SEO description string
 */
export function buildSeoDescription(opts: {
  cityName: string;
  time?: "now" | "today" | "tomorrow";
  dateString: string | null;
}): string {
  const { cityName, time, dateString } = opts;

  if (!time || time === "now") {
    return `Βρείτε άμεσα εφημερεύοντα και ανοιχτά φαρμακεία στην πόλη ${cityName} κοντά σας, με τοποθεσία σε χάρτη και στοιχεία επικοινωνίας.`;
  }

  if (time === "today") {
    const dateText = dateString ? ` (${dateString})` : "";
    return `Δείτε ποια φαρμακεία εφημερεύουν σήμερα${dateText} στην πόλη ${cityName} και βρείτε το πιο κοντινό σας στον χάρτη.`;
  }

  const dateText = dateString ? ` (${dateString})` : "";
  return `Εφημερεύοντα φαρμακεία για αύριο${dateText} στην πόλη ${cityName}, με χάρτη και ενημερωμένες πληροφορίες.`;
}
