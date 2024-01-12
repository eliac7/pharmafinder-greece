import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Image src="/not-found.png" alt="Not found" width={400} height={400} />
      <p className="text-2xl font-semibold">
        Η σελίδα που ζητήσατε δεν βρέθηκε
      </p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary-900 p-2 text-xl text-white transition-colors duration-500 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        Πίσω στην αρχική
      </Link>
    </div>
  );
}
