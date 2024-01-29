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
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === "/";
  const toggleMobileNav = () => {
    setIsMobileNavOpen((prevState) => !prevState);
  };

  const handleScroll = () => {
    const offset = window.scrollY;
    setIsScrolled(offset > 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        "flex w-full items-center justify-center bg-transparent p-2 md:p-4",
        {
          "fixed top-0  z-[5000] bg-opacity-30 bg-clip-padding backdrop-blur-md backdrop-filter":
            isHomePage,
          "h-20 md:h-28": !isScrolled,
          "h-16 md:h-20": isScrolled,
        },
      )}
      aria-label="Header"
    >
      <div className="flex h-full w-1/2 place-items-center">
        <Link href="/" className="h-full">
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
                        "text-md flex w-full items-center justify-center rounded-lg px-3 py-3 font-bold text-gray-300 transition hover:text-gray-200",
                        {
                          "bg-complementary-400 !text-white": activeLink,
                          "hover:bg-slate-500 dark:hover:text-white":
                            !activeLink,
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
            className="block cursor-pointer text-white"
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
    </header>
  );
}

export default Header;
