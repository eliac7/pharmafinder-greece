import Footer from "@/components/global/FooterComponent";
import Header from "@/components/global/HeaderComponent";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";

const comfortaaFont = Comfortaa({
  subsets: ["greek", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaFinder - Εφημερεύοντα φαρμακεία στην Ελλάδα",
  description:
    "Βρείτε εφημερεύοντα φαρμακεία κοντά σας, οποιαδήποτε στιγμή, οπουδήποτε στην Ελλάδα.",
  icons: {
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full scroll-smooth transition-colors duration-500"
    >
      <body
        className={`${comfortaaFont.className} scrollbar-w-8 relative m-0 flex h-full min-h-screen w-full flex-col justify-between scroll-smooth  bg-[#fafafa] scrollbar scrollbar-track-red-400 scrollbar-thumb-slate-700 dark:bg-[#1f1f1f] dark:from-gray-700 dark:to-gray-900 md:mx-auto
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
