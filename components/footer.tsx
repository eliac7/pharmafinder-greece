export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-2 my-4 max-h-14 flex-1 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
          © {currentYear} . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
