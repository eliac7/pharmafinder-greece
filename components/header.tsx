import Image from "next/image";

function Header() {
  return (
    <div className="container mx-auto flex md:flex-row items-center justify-center ">
      <Image
        className="title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        src="/logo.png"
        alt="logo"
        width={180}
        height={180}
      />
    </div>
  );
}

export default Header;
