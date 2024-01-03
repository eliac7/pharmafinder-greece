"use client";
import GetLocation from "@/components/get-location";
import Link from "next/link";
import cities from "@/data/options.json";
import { useRouter } from "next/navigation";
import Select from "@/components/select";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <GetLocation />

      <Select />

      <Link
        href="/now"
        className="rounded-lg bg-gray-500 p-2 text-white hover:bg-gray-800"
      >
        Now
      </Link>
    </div>
  );
}
