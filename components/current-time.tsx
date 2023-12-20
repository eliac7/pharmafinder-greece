"use client";
import React, { useState, useEffect } from "react";

const CurrentTime: React.FC = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date()); // Set time on client-side mount

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>{time ? time.toLocaleTimeString() : "Loading time..."}</div>;
};

export default CurrentTime;
