import Footer from "@/components/global/FooterComponent";
import Header from "@/components/global/HeaderComponent";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LocationBannerChecker from "@/components/global/LocationBannerChecker";

const comfortaaFont = Comfortaa({
  subsets: ["greek", "latin"],
  display: "swap",
});

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
  metadataBase: new URL("https://pharmafinder.gr"),
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: "https://pharmafinder.gr",
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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const countryCode = headers().get("x-country-code");
  const cityName = headers().get("x-city-name");

  return (
    <html
      lang="en"
      className="h-full scroll-smooth transition-colors duration-500"
    >
      <body
        className={`${comfortaaFont.className} scrollbar-w-8 relative m-0 flex h-full min-h-screen w-full flex-col justify-between scroll-smooth bg-[#fafafa] transition-colors duration-300 scrollbar scrollbar-track-red-400 scrollbar-thumb-slate-700 dark:bg-[#1f1f1f] dark:from-gray-700 dark:to-gray-900 md:mx-auto
        `}
      >
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <Providers>
          <Header />
          {children}
          <Footer />
          <LocationBannerChecker
            countryCode={countryCode ?? ""}
            cityName={cityName ? decodeURIComponent(cityName) : ""}
          />
        </Providers>
      </body>
    </html>
  );
}
