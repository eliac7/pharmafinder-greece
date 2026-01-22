import { Metadata } from "next";
import { statisticsApi } from "@/entities/statistics/api/statistics.api";
import { cityApi } from "@/entities/city/api/city.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Activity,
  AlertTriangle,
  Code2,
  Github,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Store,
} from "lucide-react";
import { CountUp } from "@/shared/ui/count-up";

export const metadata: Metadata = {
  title: "Σχετικά με την εφαρμογή",
  description:
    "Η αποστολή μας, τα δεδομένα και η τεχνολογία πίσω από το Pharmafinder.",
};

export default async function AboutPage() {
  const [stats, cities] = await Promise.all([
    statisticsApi.getStatistics().catch(() => null),
    cityApi.getCities().catch(() => []),
  ]);

  const safeStats = stats && "counts" in stats ? stats : null;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <section className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Βρίσκουμε Φαρμακείο. <br className="hidden md:inline" />
            <span className="text-primary">Άμεσα & Αξιόπιστα.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Πιστεύουμε ότι η εύρεση ενός ανοιχτού φαρμακείου δεν πρέπει να είναι
            αγώνας δρόμου. Το{" "}
            <span className="font-semibold text-foreground">Pharmafinder</span>{" "}
            συγκεντρώνει διάσπαρτα δεδομένα σε έναν ενιαίο, ταχύτατο χάρτη, για
            να βρίσκεις αυτό που χρειάζεσαι, όταν το χρειάζεσαι.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Σύνολο Φαρμακείων
              </CardTitle>
              <Store className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp end={safeStats?.counts.total ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Πανελλαδική κάλυψη
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Πόλεις & Περιοχές
              </CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp end={cities.length} suffix="+" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Δίκτυο σε όλη τη χώρα
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Εφημερεύουν Τώρα
              </CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <CountUp end={safeStats?.counts.on_duty_today ?? 0} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live ενημέρωση
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              Συχνές Ερωτήσεις
            </h2>
            <p className="text-muted-foreground mt-2">
              Όλα όσα θέλετε να γνωρίζετε για την υπηρεσία.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">
                Πόσο συχνά ανανεώνονται τα δεδομένα;
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ο αλγόριθμός μας σαρώνει τις επίσημες πηγές κάθε λίγες ώρες,
                διασφαλίζοντας ότι έχετε πρόσβαση στις πιο πρόσφατες εφημερίες.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">
                Είναι τα δεδομένα 100% ακριβή;
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Παρόλο που προσπαθούμε για το βέλτιστο, οι εφημερίες μπορεί να
                αλλάξουν χωρίς προειδοποίηση. Πάντα προτείνουμε ένα γρήγορο
                τηλεφώνημα πριν ξεκινήσετε.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Η υπηρεσία είναι δωρεάν;</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ναι, το Pharmafinder είναι και θα παραμείνει μια δωρεάν, Open
                Source υπηρεσία για όλους τους πολίτες.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Πώς μπορώ να βοηθήσω;</h3>
              <p className="text-muted-foreground leading-relaxed">
                Αν βρείτε κάποιο λάθος ή έχετε μια πρόταση, μπορείτε να κάνετε
                αναφορά μέσω της εφαρμογής ή να συνεισφέρετε στον κώδικα στο
                GitHub.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">
                Πώς εντοπίζεται η τοποθεσία μου;
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Κατά την πρώτη επίσκεψη, η εφαρμογή ζητάει την άδειά σας για
                εντοπισμό μέσω GPS. Αν αρνηθείτε, χρησιμοποιούμε τη διεύθυνση IP
                σας για κατά προσέγγιση εντοπισμό. Η τοποθεσία αποθηκεύεται μόνο
                τοπικά στη συσκευή σας.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <section className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                Διαφάνεια & Δεδομένα
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Αξιοποιούμε δημόσια δεδομένα και τα επαληθεύουμε μέσω έξυπνων
              αλγορίθμων για να εξασφαλίσουμε τη μέγιστη δυνατή ακρίβεια. Η
              πλατφόρμα ενημερώνεται συνεχώς για να αντανακλά τις τελευταίες
              αλλαγές στις εφημερίες.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <p>
                Τα δεδομένα παρέχονται για ενημερωτικούς σκοπούς. Συνιστούμε
                πάντα την τηλεφωνική επιβεβαίωση με το φαρμακείο πριν την
                μετακίνηση, ειδικά για επείγοντα περιστατικά.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Τεχνολογία</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Το Pharmafinder είναι ένα Open Source project, κατασκευασμένο με
              εργαλεία αιχμής για ταχύτητα και σταθερότητα.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Next.js 16
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                React 19
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Python / FastAPI
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                MapLibre GL
              </Badge>
            </div>

            <Button variant="outline" className="gap-2" asChild>
              <a
                href="http://github.com/eliac7/pharmafinder-greece/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                Προβολή κώδικα στο GitHub
              </a>
            </Button>
          </div>
        </section>

        <Separator />

        <section className="text-center space-y-6 py-8 bg-muted/30 rounded-3xl border border-dashed">
          <div className="mx-auto bg-background p-3 rounded-full w-fit shadow-sm">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Βρήκατε κάποιο λάθος;</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Η βοήθειά σας είναι πολύτιμη. Αν εντοπίσετε κάποια ανακρίβεια,
              ενημερώστε μας για να τη διορθώσουμε άμεσα.
            </p>
          </div>
          <Button size="lg" asChild>
            <a href="mailto:iliascodes@gmail.com?subject=Pharmafinder%20Feedback">
              Αναφορά Προβλήματος
            </a>
          </Button>
        </section>

        <div className="text-center text-sm text-muted-foreground pb-8">
          Υλοποιήθηκε από{" "}
          <a
            href="https://ilias.dev"
            target="_blank"
            className="font-medium text-foreground hover:underline"
          >
            Ilias Nikolaos Thalassochoritis
          </a>
        </div>
      </div>
    </div>
  );
}
