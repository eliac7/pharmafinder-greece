import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/context/LocationContext";
import Header from "@/components/header";

const ubuntuFont = Ubuntu({
  display: "swap",
  subsets: ["greek", "latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PharmaFinder Greece",
  description: "Find on duty pharmacies in Greece",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ubuntuFont.className} bg-gradient-to-b from-primary-500 to-accent-light`}
      >
        <Header />
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
