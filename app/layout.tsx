import Header from "@/components/header";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import Information from "@/components/information";

const comfortaaFont = Comfortaa({
  subsets: ["greek", "latin"],
  display: "swap",
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
    <html lang="en" className="h-full">
      <body
        className={`${comfortaaFont.className} bg-gradient-to-b from-primary-500  to-accent-light bg-fixed m-0 flex flex-col min-h-screen h-full justify-between relative  "}`}
      >
        <Header />
        <Providers>
          <main className="flex h-full flex-1 flex-grow items-center justify-center">
            {children}
          </main>
        </Providers>
        <Information />
      </body>
    </html>
  );
}
