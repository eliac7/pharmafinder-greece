import Information from "./information";

export default function Footer() {
  return (
    <footer className="mx-auto mt-2 flex w-full items-center justify-center rounded-t-lg bg-transparent bg-white bg-opacity-40 bg-clip-padding p-2 text-center text-sm text-gray-700 backdrop-blur-lg backdrop-filter dark:bg-[#2f333d] dark:text-gray-300 md:flex-row">
      <div className="hidden md:flex md:flex-1"></div>
      <div className="flex-1 basis-1/2 text-center">
        <span>
          Made with{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>{" "}
          and a bit of Next.js, Tailwind CSS, TypeScript, Leaflet
        </span>
      </div>
      <div className="flex w-fit items-center justify-center md:flex-1 md:justify-end">
        <Information />
      </div>
    </footer>
  );
}
