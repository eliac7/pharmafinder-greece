import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Toaster } from "@/shared/ui/sonner";

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
  manifest: "/manifest.webmanifest",
  themeColor: "#aec7c1",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: process.env.NEXT_PUBLIC_APP_URL!,
    siteName: "PharmaFinder",
    description: "Βρείτε εφημερεύοντα φαρμακεία κοντά σας πιο εύκολα από ποτέ!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen w-full`}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
