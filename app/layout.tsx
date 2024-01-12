import Header from "@/components/header";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";

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
    <html lang="en" className="h-full transition-colors duration-500">
      <body
        className={`${comfortaaFont.className} bg-gradient-to-b from-primary-500 to-accent-light dark:from-gray-700 dark:to-gray-900 bg-fixed m-0 flex flex-col min-h-screen h-full justify-between relative md:max-w-[95vw] w-full md:mx-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-900
        `}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
