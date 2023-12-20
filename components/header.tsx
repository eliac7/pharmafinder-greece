"use client";

import Image from "next/image";
import Link from "next/link";
import CurrentTime from "./current-time";

function Header() {
  return (
    <div className="container mx-auto grid h-20 grid-cols-3 items-center justify-center">
      <div></div>
      <div>
        <Link href="/">
          <Image
            className="title-font mb-4 h-full items-center font-medium text-gray-900 md:mb-0"
            src="/logo.png"
            alt="logo"
            width={120}
            height={120}
          />
        </Link>
      </div>
      <div>
        <CurrentTime />
      </div>
    </div>
  );
}

export default Header;
