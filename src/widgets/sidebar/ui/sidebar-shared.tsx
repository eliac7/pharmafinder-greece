import Image from "next/image";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import Link from "next/link";

export function SidebarBranding() {
  return (
    <div className="flex justify-center md:justify-start items-center gap-3 mb-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="relative size-10 shrink-0">
          <Image
            src="/pharmacy.png"
            alt="Pharmafinder"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
          Pharmafinder
        </h1>
      </Link>
    </div>
  );
}

export function SidebarCopyright() {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <Link
          href="/about"
          className="font-semibold hover:text-foreground transition-colors w-fit"
        >
          Σχετικά
        </Link>
        <div className="space-y-0.5">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} Pharmafinder
          </p>
          <p className="flex gap-1">
            Ανάπτυξη:
            <a
              href="https://ilias.dev"
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-primary hover:underline transition-colors"
            >
              Ilias Nikolaos Thalassochoritis
            </a>
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
