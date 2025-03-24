"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white shadow-md">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={100}
          height={50}
          className="h-[2em] w-auto object-contain"
        />
        <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-black">
          Digital Library Hub
        </h1>
      </div>

      <div className="hidden md:flex space-x-6 lg:space-x-16 text-base md:text-lg lg:text-2xl font-medium">
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

      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/profile"
          className="flex items-center w-32 lg:w-48 px-4 lg:px-6 py-3 lg:py-3 
           bg-white text-orange-400 rounded-xl lg:rounded-2xl border 
           group hover:scale-105 transition-transform duration-200 
           text-lg md:text-lg lg:text-2xl justify-center"
        >
          <Image
            src="/images/User.png"
            alt="User"
            width={16}
            height={16}
            className="h-[1.0em] w-auto "
          />
          <span className="leading-none ml-3">Profile</span>
        </Link>

        <Link
          href="/login"
          className="flex items-center w-32 lg:w-48 px-4 lg:px-6 py-3 lg:py-3 
             bg-orange-400 text-white rounded-xl lg:rounded-2xl border 
             group hover:scale-105 transition-transform duration-200 
           text-lg md:text-lg lg:text-2xl justify-center"
        >
          <Image
            src="/images/Login.png"
            alt="Login"
            width={20}
            height={20}
            className="h-[1.0em] w-auto"
          />
          <span className="ml-3 leading-none">Login</span>
        </Link>
      </div>

      <div className="md:hidden">
        <button
          className="text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4 z-50">
          <Link
            href="/"
            className="text-gray-700 hover:text-orange-400 text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="text-gray-700 hover:text-orange-400 text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Catalog
          </Link>
          <Link
            href="/info"
            className="text-gray-700 hover:text-orange-400 text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Info
          </Link>
          <Link
            href="/profile"
            className="text-gray-700 hover:text-orange-400 text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/login"
            className="text-gray-700 hover:text-orange-400 text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
