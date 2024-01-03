"use client";

import Link from "next/link";
import cities from "@/data/options.json";
import { useRouter } from "next/navigation";
import Select from "@/components/select";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <Select />
    </div>
  );
}
