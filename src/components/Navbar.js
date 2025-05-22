"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
          {" "}
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
        </Link>
      </div>

      <div className="hidden md:flex space-x-6 lg:space-x-16 text-base md:text-lg lg:text-2xl font-medium">
        <Link
          href="/"
          className={`relative ${
            pathname === "/" ? "text-orange-400 after:..." : "text-gray-700"
          } hover:text-orange-400 ...`}
        >
          Home
        </Link>
        <Link
          href="/catalog"
          className={`relative ${
            pathname === "/catalog"
              ? "text-orange-400 after:..."
              : "text-gray-700"
          } hover:text-orange-400 ...`}
        >
          Catalog
        </Link>
        <Link
          href="/info"
          className={`relative ${
            pathname === "/info" ? "text-orange-400 after:..." : "text-gray-700"
          } hover:text-orange-400 ...`}
        >
          Info
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center w-32 lg:w-48 px-4 lg:px-6 py-3 lg:py-3 
              bg-white text-orange-400 rounded-xl lg:rounded-2xl border 
                group hover:scale-105 transition-transform duration-200 
                text-lg md:text-lg lg:text-2xl justify-center"
            >
              <User className="h-4 w-4 lg:h-6 lg:w-6" />
              <span className="leading-none ml-3">Profile</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-32 lg:w-48 px-4 lg:px-6 py-3 lg:py-3 
              bg-orange-400 text-white rounded-xl lg:rounded-2xl border 
                group hover:scale-105 transition-transform duration-200 
                text-lg md:text-lg lg:text-2xl justify-center"
            >
              {" "}
              <LogOut className="h-4 w-4 lg:h-6 lg:w-6" />
              <span className="ml-3 leading-none">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center w-32 lg:w-48 px-4 lg:px-6 py-3 lg:py-3 
              bg-orange-400 text-white rounded-xl lg:rounded-2xl border 
                group hover:scale-105 transition-transform duration-200 
                text-lg md:text-lg lg:text-2xl justify-center"
          >
            <LogIn className="h-4 w-4 lg:h-6 lg:w-6" />
            <span className="ml-3 leading-none">Login</span>
          </Link>
        )}
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
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4 z-40 border-t border-gray-100 text-gray-900">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link href="/catalog" onClick={() => setIsMenuOpen(false)}>
            Catalog
          </Link>
          <Link href="/info" onClick={() => setIsMenuOpen(false)}>
            Info
          </Link>
          <div className="border-t border-gray-100 w-full flex flex-col items-center pt-4 space-y-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 ..."
                >
                  {/* <User className="h-5 w-5" /> */}
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 ..."
                >
                  {" "}
                  {/* <LogOut className="h-5 w-5" /> */}
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 ..."
              >
                {/* <LogIn className="h-5 w-5" /> */}
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
