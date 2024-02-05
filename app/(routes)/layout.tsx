import { FiltersProvider } from "@/context/FiltersContext";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex h-screen flex-1 flex-grow flex-col items-center justify-center overflow-auto">
      <FiltersProvider>{children}</FiltersProvider>
    </main>
  );
}
