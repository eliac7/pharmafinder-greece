"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CurrentTime: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString("el-GR", {
      timeZone: "Europe/Athens",
      hour12: false,
    }),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("el-GR", {
          timeZone: "Europe/Athens",
          hour12: false,
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p
        className={clsx(
          "text-lg font-semibold text-slate-700 dark:text-white tablet:text-2xl",
          {
            "!text-white": isHomePage,
          },
        )}
      >
        {currentTime}
      </p>
      <p
        className={clsx(
          "text-xs text-slate-700 dark:text-white tablet:text-sm",
          {
            "!text-white": isHomePage,
          },
        )}
      >
        {new Date().toLocaleDateString("el-GR", {
          timeZone: "Europe/Athens",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </p>
    </div>
  );
};

export default CurrentTime;
