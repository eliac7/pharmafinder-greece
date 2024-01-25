"use client";

import { useEffect, useState } from "react";

const CurrentTime: React.FC = () => {
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
      <p className="text-2xl font-semibold text-slate-700 dark:text-white">
        {currentTime}
      </p>
      <p className="text-sm text-slate-700 dark:text-white">
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
