import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-linear-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <Image
            src="/not-found.png"
            alt="404 - Η σελίδα δεν βρέθηκε"
            width={280}
            height={280}
            className="relative drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>

        <div className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Ωχ! Χαθήκαμε...
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί. Μην ανησυχείτε,
            μπορούμε να σας βοηθήσουμε να βρείτε το δρόμο σας!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Link href="/">
              <MapPin className="size-5" />
              Βρείτε Φαρμακεία
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="size-5" />
              Αρχική Σελίδα
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl max-w-md">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">💡 Tip:</span>{" "}
            Χρησιμοποιήστε την αναζήτηση στην αρχική σελίδα για να βρείτε
            εφημερεύοντα φαρμακεία κοντά σας.
          </p>
        </div>
      </div>
    </main>
  );
}
