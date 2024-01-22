"use client";

import Select from "../select";

interface IDutyStatusProps {
  timeQuery: "now" | "today" | "tomorrow";
  onTimeChange: (time: "now" | "today" | "tomorrow") => void;
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
};

export default function DutyStatus({
  timeQuery,
  onTimeChange,
}: IDutyStatusProps) {
  const timeLabel = timeQuery ? Time[timeQuery] : Time["now"];

  const initialSelection = {
    label: timeLabel,
    value: timeQuery,
  };

  return (
    <Select
      options={[
        { label: Time.now, value: "now" },
        { label: Time.today, value: "today" },
        { label: Time.tomorrow, value: "tomorrow" },
      ]}
      initialSelection={initialSelection}
      searchable={false}
      onChange={(e) => {
        onTimeChange(e.value as "now" | "today" | "tomorrow");
      }}
    />
  );
}
