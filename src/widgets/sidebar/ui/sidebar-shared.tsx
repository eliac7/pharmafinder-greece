import Image from "next/image";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function SidebarBranding() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative size-10 shrink-0">
        <Image
          src="/pharmacy.png"
          alt="Pharmafinder"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
        Pharmafinder
      </h1>
    </div>
  );
}

export function SidebarCopyright() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Pharmafinder</span>
        <span className="flex gap-1">
          Made by{" "}
          <a
            href="https://ilias.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:text-primary hover:underline transition-colors"
          >
            Ilias Thalassochoritis
          </a>
        </span>
      </div>
      <ThemeToggle />
    </div>
  );
}
