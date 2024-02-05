"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Logo() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { theme } = useTheme();

  // Determine imagePath based on whether it's the homepage or the theme type
  const imagePath = isHomePage
    ? "/logo.png"
    : theme === "dark"
      ? "/logo.png"
      : "/logo-dark.png";

  return (
    <Image
      className="filter:invert h-full items-center object-contain p-2 font-medium text-gray-900 md:p-0"
      src={imagePath}
      alt="PharmaFinder Logo"
      width={120}
      height={120}
    />
  );
}

export default Logo;
