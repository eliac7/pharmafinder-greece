"use client";
import { useEffect, useState, Fragment, useRef } from "react";
import { links } from "@/data/links";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CurrentTime from "./current-time";

import dynamic from "next/dynamic";
import { GiHamburgerMenu } from "react-icons/gi";
import clsx from "clsx";
const DarkModeToggle = dynamic(() => import("./dark-mode-toggle"), {
  ssr: false,
});

function Header() {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prevState) => !prevState);
  };
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <header
      className="mx-2 flex h-20 items-center justify-center rounded-b-2xl bg-transparent py-2 shadow-[rgba(0,0,0,0.20)_0px_25px_32px_-10px] md:h-28"
      aria-label="Header"
    >
      <div className="flex h-full w-1/2 place-items-center">
        <Link href="/" className="h-full">
          <Image
            className="title-font mb-4 h-full items-center object-contain font-medium text-gray-900 md:mb-0"
            src="/logo.png"
            alt="logo"
            width={120}
            height={120}
          />
        </Link>
      </div>
      <div className="relative w-full">
        {/* Default Header */}
        <nav>
          <ul className="text-text sm:w-[initial] sm:flex-nowrap sm:gap-5 hidden w-full flex-wrap items-center justify-center gap-1 text-[0.9rem] font-medium md:flex">
            {links.map((link) => {
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
                        "flex w-full items-center justify-center rounded-xl px-3 py-3 text-gray-200 transition dark:text-gray-400 ",
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
            className="GiHamburgerMenu block cursor-pointer"
            onClick={() => toggleMobileNav()}
          />
        </div>
        {isMobileNavOpen && (
          <div
            ref={mobileNavRef}
            className="sm:hidden absolute left-0 top-10 z-[600] w-[50vw] rounded-lg bg-gray-500 shadow-md"
          >
            <nav>
              <ul className="text-text flex-col items-center justify-center gap-y-1 text-[0.9rem] font-medium before:h-0 before:w-0 before:-translate-y-5 before:transform before:border-[10px] before:border-solid before:border-transparent before:border-b-gray-500 before:text-gray-500">
                {links.map((link) => {
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
