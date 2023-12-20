import Header from "@/components/header";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntuFont = Ubuntu({
  display: "swap",
  subsets: ["greek", "latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PharmaFinder Greece",
  description: "Find on duty pharma cies in Greece",
  icons: {
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ubuntuFont.className} bg-gradient-to-b from-primary-500 to-accent-light bg-fixed m-0"}`}
      >
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
