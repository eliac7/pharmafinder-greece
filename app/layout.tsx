import Header from "@/components/global/header";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import Footer from "@/components/global/footer";

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
        className={`${comfortaaFont.className} relative m-0 flex h-full min-h-screen w-full flex-col justify-between bg-[#fafafa] 
        scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-slate-600 dark:bg-[#1f1f1f] dark:from-gray-700 dark:to-gray-900 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-400 md:mx-auto
        `}
      >
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
