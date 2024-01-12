export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen flex-1 flex-grow items-center justify-center overflow-auto">
      {children}
    </main>
  );
}
