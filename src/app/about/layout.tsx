import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-5xl px-6 mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="-ml-2 rounded-full"
            >
              <Link href="/" aria-label="Πίσω στον χάρτη">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative size-8 shrink-0">
                <Image
                  src="/pharmacy.png"
                  alt="Pharmafinder Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Pharmafinder
              </span>
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full hidden sm:flex"
          >
            <Link href="/">Πίσω στον Χάρτη</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
