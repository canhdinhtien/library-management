"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-4 bg-white shadow-md">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={100}
          height={50}
          className="w-auto h-8 max-w-full"
        />
        <h1 className="text-xl md:text-3xl font-bold text-black">
          Digital Library Hub
        </h1>
      </div>

      <div className="hidden md:flex space-x-4 lg:space-x-20 text-base md:text-lg lg:text-2xl font-medium">
        <Link
          href="/"
          className={`relative ${
            pathname === "/"
              ? "text-orange-400 after:content-[''] after:absolute after:left-[-10px] after:right-[-10px] after:bottom-[-8px] after:h-[4px] after:bg-orange-400 after:rounded-b-full after:w-auto"
              : "text-gray-700"
          } hover:text-orange-400 hover:after:bg-orange-400 hover:scale-110 transition-transform duration-200 inline-block`}
        >
          Home
        </Link>
        <Link
          href="/catalog"
          className={`relative ${
            pathname === "/catalog"
              ? "text-orange-400 after:content-[''] after:absolute after:left-[-10px] after:right-[-10px] after:bottom-[-8px] after:h-[4px] after:bg-orange-400 after:rounded-b-full after:w-auto"
              : "text-gray-700"
          } hover:text-orange-400 hover:after:bg-orange-400 hover:scale-110 transition-transform duration-200 inline-block`}
        >
          Catalog
        </Link>
        <Link
          href="/info"
          className={`relative ${
            pathname === "/info"
              ? "text-orange-400 after:content-[''] after:absolute after:left-[-10px] after:right-[-10px] after:bottom-[-8px] after:h-[4px] after:bg-orange-400 after:rounded-b-full after:w-auto"
              : "text-gray-700"
          } hover:text-orange-400 hover:after:bg-orange-400 hover:scale-110 transition-transform duration-200 inline-block`}
        >
          Info
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
        <Link
          href="/profile"
          className="flex items-center px-8 lg:px-16 py-3 lg:py-4 border rounded-lg lg:rounded-2xl text-orange-400 space-x-2 lg:space-x-3 group hover:scale-105 transition-transform duration-200 text-base md:text-lg lg:text-xl"
        >
          <Image
            src="/images/User.png"
            alt="User"
            width={16}
            height={16}
            className="h-[1em] w-auto"
          />
          <span className="leading-none">Profile</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center px-8 lg:px-16 py-3 lg:py-4 bg-orange-400 text-white rounded-lg lg:rounded-2xl border group hover:scale-105 transition-transform duration-200 text-base md:text-lg lg:text-xl"
        >
          <Image
            src="/images/Login.png"
            alt="Login"
            width={16}
            height={16}
            className="h-[1em] w-auto"
          />
          <span className="ml-2 leading-none">Login</span>
        </Link>
      </div>

      <div className="md:hidden">
        <button className="text-gray-700 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
