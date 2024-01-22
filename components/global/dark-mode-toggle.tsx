"use client";

import { useTheme } from "next-themes";
import { CiDark } from "react-icons/ci";
import { BiSun } from "react-icons/bi";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="cursor-pointer rounded-full p-2 transition-colors duration-200 
      hover:bg-gray-200  dark:text-gray-400 dark:hover:bg-gray-800
      "
    >
      {theme === "dark" ? <BiSun size={24} /> : <CiDark size={24} />}
    </div>
  );
};

export default DarkModeToggle;
