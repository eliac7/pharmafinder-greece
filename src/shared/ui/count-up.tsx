"use client";

import { useEffect, useState } from "react";
import { formatGreekNumber } from "@/shared/lib/formatters";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

export function CountUp({ end, duration = 2000, suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);

      const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      setCount(Math.floor(ease(percentage) * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span>
      {formatGreekNumber(count)}
      {suffix}
    </span>
  );
}
