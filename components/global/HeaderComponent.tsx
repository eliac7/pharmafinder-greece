"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import clsx from "clsx";

import dynamic from "next/dynamic";
import { GiHamburgerMenu } from "react-icons/gi";
import { LinksData } from "@/data/Links";

const Logo = dynamic(() => import("./HeaderLogo"), {
  ssr: false,
});

const CurrentTime = dynamic(() => import("./CurrentTime"), {
  ssr: false,
});

const DarkModeToggle = dynamic(() => import("./DarkModeToggle"), {
  ssr: false,
});

function Header() {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [headerVisible, setHeaderVisible] = useState<boolean>(true);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === "/";

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 200);
      setHeaderVisible(lastScrollY > currentScrollY || currentScrollY < 200);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        `duration-600 flex w-full flex-col items-center justify-center bg-transparent transition-transform ease-in-out`,
        {
          "fixed top-0 z-[5000] bg-opacity-30 bg-clip-padding": isHomePage,
          "md:h-32 md:p-4": !isScrolled && isHomePage,
          "h-16 md:h-20 md:p-1": isScrolled && isHomePage,
          "h-16 md:h-20 md:p-2": !isHomePage,
          "translate-y-0": headerVisible,
          "-translate-y-full": !headerVisible,
        },
      )}
      aria-label="Header"
    >
      <div className="container flex h-full w-full items-center justify-center rounded-lg bg-transparent px-3 backdrop-blur-xl backdrop-filter tablet:p-1">
        <div className="flex h-full w-1/2 place-items-center">
          <Link href="/" className="h-full w-fit">
            <Logo />
          </Link>
        </div>
        <div className="relative w-full">
          {/* Default Header */}
          <nav>
            <ul className="text-text sm:w-[initial] sm:flex-nowrap sm:gap-5 hidden w-full flex-wrap items-center justify-center gap-1 text-[0.9rem] font-medium md:flex">
              {LinksData.map((link) => {
                const linkPath = link.href.split("?")[0];
                const activeLink =
                  (pathname === "/" && linkPath === "/") ||
                  (pathname.startsWith(linkPath) &&
                    pathname !== "/" &&
                    linkPath !== "/");

                return (
                  <Fragment key={link.href}>
                    <li className="relative flex items-center justify-center text-center">
                      <Link
                        className={clsx(
                          "text-md flex w-full items-center justify-center rounded-lg px-3 py-3 font-bold transition hover:text-gray-200",
                          {
                            "bg-complementary-400 text-white": activeLink,
                            "hover:bg-slate-500 dark:hover:text-white":
                              !activeLink,
                            "text-gray-300": isHomePage,
                            "text-gray-700 dark:text-gray-200": !isHomePage,
                          },
                        )}
                        href={link.href}
                      >
                        {link.name}
                      </Link>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </nav>
          {/* Mobile Navigation */}
          <div className="flex items-center justify-center md:hidden">
            <GiHamburgerMenu
              size={20}
              className="block cursor-pointer text-black dark:text-white"
              onClick={() => toggleMobileNav()}
            />
          </div>
          {isMobileNavOpen && (
            <div
              ref={mobileNavRef}
              className="sm:hidden absolute left-0 top-10 z-[2000] w-[50vw] overflow-hidden rounded-lg bg-gray-500 shadow-md"
            >
              <nav>
                <ul className="text-text flex-col items-center justify-center gap-y-1 text-[0.9rem] font-medium">
                  {LinksData.map((link) => {
                    const linkPath = link.href.split("?")[0];
                    const activeLink =
                      (pathname === "/" && linkPath === "/") ||
                      (pathname.startsWith(linkPath) &&
                        pathname !== "/" &&
                        linkPath !== "/");

                    return (
                      <Fragment key={link.href}>
                        <li className="relative flex w-full items-center justify-center text-center">
                          <Link
                            className={cn(
                              "flex w-full items-center justify-center px-3 py-3 text-white transition hover:bg-gray-900 hover:text-gray-300 ",
                              activeLink &&
                                "bg-complementary-400 hover:bg-complementary-400",
                            )}
                            href={link.href}
                          >
                            {link.name}
                          </Link>
                        </li>
                      </Fragment>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}
        </div>
        <div className="flex h-full w-1/2 items-center justify-end gap-2">
          <DarkModeToggle />
          <CurrentTime />
        </div>
      </div>
    </header>
  );
}

export default Header;
