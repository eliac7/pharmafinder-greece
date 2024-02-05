import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto w-full bg-transparent bg-white bg-opacity-40 bg-clip-padding p-2 text-center text-sm text-gray-700 backdrop-blur-lg backdrop-filter dark:bg-[#2f333d] dark:text-gray-300">
      <div>
        <span>
          Δημιουργήθηκε με
          <span role="img" aria-label="love" className="mx-1">
            ❤️
          </span>
          και λίγο Next.js, TypeScript, Tailwind CSS, Leaflet
        </span>
      </div>
      <div className="mt-3 flex items-center justify-center text-sm font-semibold leading-6 text-slate-700 dark:text-slate-400">
        <Link
          href="/privacy-policy"
          passHref
          className="hover:underline focus:underline"
        >
          Πολιτική Απορρήτου
        </Link>
      </div>
    </footer>
  );
}
