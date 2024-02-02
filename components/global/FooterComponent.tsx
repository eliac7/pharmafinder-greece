export default function Footer() {
  return (
    <footer className="mx-auto flex w-full flex-col items-center justify-center bg-transparent bg-white bg-opacity-40 bg-clip-padding p-2 text-center text-sm text-gray-700 backdrop-blur-lg backdrop-filter dark:bg-[#2f333d] dark:text-gray-300 md:flex-row">
      <div className="hidden md:flex md:flex-1"></div>
      <div className="flex-1 basis-1/2 text-center">
        <span>
          Δημιουργήθηκε με{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>{" "}
          και λίγο Next.js, TypeScript, Tailwind CSS, Leaflet
        </span>
      </div>
    </footer>
  );
}
