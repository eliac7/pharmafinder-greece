import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";

export default function SidebarLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <main className="relative w-full h-screen overflow-hidden">
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <SidebarTrigger className="bg-card/80 backdrop-blur-sm shadow-md border border-border rounded-full hover:bg-card/90 size-10" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
