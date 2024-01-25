"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

function Logo() {
  const { theme } = useTheme();
  const imagePath = theme === "dark" ? "/logo.png" : "/logo-dark.png";

  return (
    <Image
      className="title-font filter:invert mb-4 h-full items-center object-contain font-medium text-gray-900 md:mb-0"
      src={imagePath}
      alt="PharmaFinder Logo"
      width={120}
      height={120}
    />
  );
}

export default Logo;
