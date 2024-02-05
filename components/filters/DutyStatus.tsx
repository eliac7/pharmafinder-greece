"use client";

import { useEffect } from "react";
import Select from "../select";

interface IDutyStatusProps {
  timeQuery: "now" | "today" | "tomorrow" | "all";

  onTimeChange: (time: "now" | "today" | "tomorrow" | "all") => void;
  searchType: "nearby" | "city";
}

const Time = {
  now: "Τώρα",
  today: `Σήμερα (${new Date().toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })})`,
  tomorrow: `Αύριο (${new Date(
    new Date().setDate(new Date().getDate() + 1),
  ).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })})`,
  all: "Όλα",
};

export default function DutyStatus({
  timeQuery,
  onTimeChange,
  searchType,
}: IDutyStatusProps) {
  const timeLabel = timeQuery ? Time[timeQuery] : Time["now"];

  const isNearby = searchType === "nearby";
  const isAll = timeQuery === "all";

  const initialSelection = {
    label: timeLabel,
    value: timeQuery,
  };

  const handleTimeChange = (time: "now" | "today" | "tomorrow" | "all") => {
    if (searchType === "city" && time === "all") return;
    onTimeChange(time);
  };

  useEffect(() => {
    if (isAll && !isNearby) onTimeChange("now");
  }, [isAll, isNearby, onTimeChange]);

  return (
    <Select
      options={[
        { label: Time.now, value: "now" },
        { label: Time.today, value: "today" },
        { label: Time.tomorrow, value: "tomorrow" },
        ...(isNearby ? [{ label: "Όλα", value: "all" }] : []),
      ]}
      initialSelection={initialSelection}
      searchable={false}
      onChange={(time) => handleTimeChange(time.value as any)}
    />
  );
}
