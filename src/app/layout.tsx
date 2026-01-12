import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/application/providers/providers";
import { Toaster } from "@/shared/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PharmaFinder - Εφημερεύοντα φαρμακεία στην Ελλάδα",
    template: "%s | PharmaFinder",
  },
  description:
    "Βρείτε εφημερεύοντα φαρμακεία κοντά σας, οποιαδήποτε στιγμή, οπουδήποτε στην Ελλάδα.",
  icons: {
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: process.env.NEXT_PUBLIC_APP_URL!,
    siteName: "PharmaFinder",
    description: "Βρείτε εφημερεύοντα φαρμακεία κοντά σας πιο εύκολα από ποτέ!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 628,
        alt: "PharmaFinder",
      },
    ],
  },
};

export default function RootLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  const hasSidebar = sidebar !== null;

  return (
    <html lang="el" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen w-full`}>
        <Providers>
          {hasSidebar ? (
            <SidebarProvider>
              {sidebar}
              <main className="relative w-full h-screen overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <SidebarTrigger className="bg-card/80 backdrop-blur-sm shadow-md border border-border rounded-full hover:bg-card/90 size-10" />
                </div>
                {children}
              </main>
            </SidebarProvider>
          ) : (
            <>{children}</>
          )}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
