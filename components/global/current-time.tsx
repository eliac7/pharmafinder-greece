"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
    <div className="pr-2">
      <p className="text-2xl font-semibold text-white">{currentTime}</p>
      <p className="text-sm text-white">
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

export default dynamic(() => Promise.resolve(CurrentTime), {
  ssr: false,
});
