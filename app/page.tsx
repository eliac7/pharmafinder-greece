"use client";
import GetLocation from "@/components/get-location";
import Link from "next/link";
import cities from "@/data/options.json";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <GetLocation />
      <select
        onChange={(e) => {
          router.push(`/by_city/${e.target.value}?time=now`);
        }}
      >
        <option value="">Select a city</option>
        {cities.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <Link
        href="/now"
        className="rounded-lg bg-gray-500 p-2 text-white hover:bg-gray-800"
      >
        Now
      </Link>
    </div>
  );
}
