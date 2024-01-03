"use client";
import React from "react";
import { links } from "@/data/links";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CurrentTime from "./current-time";

function Header() {
  const pathname = usePathname();

  return (
    <div className="mx-2 flex h-28 items-center justify-center rounded-b-2xl bg-transparent py-2">
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
      <div>
        <ul className="text-text flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium sm:w-[initial] sm:flex-nowrap sm:gap-5">
          {links.map((link) => {
            const linkPath = link.href.split("?")[0];
            const activeLink =
              (pathname === "/" && linkPath === "/") ||
              (pathname.startsWith(linkPath) &&
                pathname !== "/" &&
                linkPath !== "/");

            return (
              <React.Fragment key={link.href}>
                <li className="relative flex items-center justify-center text-center">
                  <Link
                    className={cn(
                      "flex w-full items-center justify-center px-3 py-3 hover:text-white transition dark:text-white dark:hover:text-gray-300 ",
                      activeLink && "bg-complementary-400 rounded-xl"
                    )}
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
      <div className="flex h-full w-1/2 items-center justify-end">
        <CurrentTime />
      </div>
    </div>
  );
}

export default Header;
