"use client";

import { useTheme } from "next-themes";
import { CiDark, CiSun } from "react-icons/ci";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const DarkModeToggle = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <div
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={clsx(
        "cursor-pointer rounded-full p-2 text-black hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800",
        {
          "!text-white hover:!bg-primary-700": isHomePage,
        },
      )}
    >
      {resolvedTheme === "dark" ? <CiSun size={24} /> : <CiDark size={24} />}
    </div>
  );
};

export default DarkModeToggle;
