"use client";

import { useTheme } from "next-themes";
import { CiDark, CiSun } from "react-icons/ci";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const DarkModeToggle = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { theme, setTheme } = useTheme();
  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={clsx(
        "cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-200  dark:text-gray-400 dark:hover:bg-gray-800",
        {
          "!text-white hover:!bg-primary-700": isHomePage,
        },
      )}
    >
      {theme === "dark" ? <CiSun size={24} /> : <CiDark size={24} />}
    </div>
  );
};

export default DarkModeToggle;
