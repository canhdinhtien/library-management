"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, LogIn, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, authLoading, logout } = useAuth();

  const renderUserControls = (isMobile = false) => {
    if (authLoading) {
      return (
        <div
          className={`flex items-center ${
            isMobile ? "justify-start px-4 py-2" : "justify-center"
          } text-gray-500 
                        ${
                          isMobile ? "w-full" : "w-32 lg:w-48 px-4 lg:px-6 py-3"
                        }`}
        >
          <Loader2
            className={`h-5 w-5 animate-spin ${isMobile ? "mr-2" : ""}`}
          />
          <span className={`${isMobile ? "" : "ml-2 text-sm"}`}>
            Loading...
          </span>
        </div>
      );
    }

    if (user) {
      if (user.role === "admin" || user.role === "employee") {
        return (
          <Link
            href="/login"
            onClick={() => isMobile && setIsMenuOpen(false)}
            className={`flex items-center group transition-transform duration-200 
                          ${
                            isMobile
                              ? "w-full px-4 py-2 text-gray-700 hover:bg-gray-100 justify-start"
                              : "w-32 lg:w-48 px-4 lg:px-6 py-3 bg-orange-400 text-white rounded-xl lg:rounded-2xl border group-hover:scale-105 text-lg md:text-lg lg:text-2xl justify-center"
                          }`}
          >
            <LogIn
              className={`${
                isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 lg:h-6 lg:w-6"
              }`}
            />
            <span className={`leading-none ${isMobile ? "" : "ml-3"}`}>
              Login
            </span>
          </Link>
        );
      } else {
        return (
          <>
            <Link
              href={"/profile"}
              onClick={() => isMobile && setIsMenuOpen(false)}
              className={`flex items-center group transition-transform duration-200 
                          ${
                            isMobile
                              ? "w-full px-4 py-2 text-gray-700 hover:bg-gray-100 justify-start"
                              : "w-32 lg:w-48 px-4 lg:px-6 py-3 bg-white text-orange-400 rounded-xl lg:rounded-2xl border group-hover:scale-105 text-lg md:text-lg lg:text-2xl justify-center"
                          }`}
            >
              <User
                className={`${
                  isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 lg:h-6 lg:w-6"
                }`}
              />
              <span className={`leading-none ${isMobile ? "" : "ml-3"}`}>
                Profile
              </span>
            </Link>
            <button
              onClick={() => {
                logout();
                if (isMobile) setIsMenuOpen(false);
              }}
              className={`flex items-center group transition-transform duration-200 
                          ${
                            isMobile
                              ? "w-full px-4 py-2 text-gray-700 hover:bg-gray-100 justify-start"
                              : "w-32 lg:w-48 px-4 lg:px-6 py-3 bg-orange-400 text-white rounded-xl lg:rounded-2xl border group-hover:scale-105 text-lg md:text-lg lg:text-2xl justify-center"
                          }`}
            >
              <LogOut
                className={`${
                  isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 lg:h-6 lg:w-6"
                }`}
              />
              <span className={`leading-none ${isMobile ? "" : "ml-3"}`}>
                Logout
              </span>
            </button>
          </>
        );
      }
    } else {
      // Chưa đăng nhập
      return (
        <Link
          href="/login"
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={`flex items-center group transition-transform duration-200 
                        ${
                          isMobile
                            ? "w-full px-4 py-2 text-gray-700 hover:bg-gray-100 justify-start"
                            : "w-32 lg:w-48 px-4 lg:px-6 py-3 bg-orange-400 text-white rounded-xl lg:rounded-2xl border group-hover:scale-105 text-lg md:text-lg lg:text-2xl justify-center"
                        }`}
        >
          <LogIn
            className={`${isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 lg:h-6 lg:w-6"}`}
          />
          <span className={`leading-none ${isMobile ? "" : "ml-3"}`}>
            Login
          </span>
        </Link>
      );
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
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

      <div className="hidden md:flex flex-1 items-center justify-center space-x-6 lg:space-x-16 text-base md:text-lg lg:text-2xl font-medium">
        {" "}
        <Link
          href="/"
          className={`relative ${
            pathname === "/"
              ? "text-orange-400 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-orange-400"
              : "text-gray-700"
          } hover:text-orange-400 transition-colors`}
        >
          Home
        </Link>
        <Link
          href="/catalog"
          className={`relative ${
            pathname === "/catalog"
              ? "text-orange-400 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-orange-400"
              : "text-gray-700"
          } hover:text-orange-400 transition-colors`}
        >
          Catalog
        </Link>
        <Link
          href="/info"
          className={`relative ${
            pathname === "/info"
              ? "text-orange-400 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-orange-400"
              : "text-gray-700"
          } hover:text-orange-400 transition-colors`}
        >
          Info
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {renderUserControls(false)}
      </div>

      <div className="md:hidden">
        <button
          className="text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-stretch text-left space-y-1 py-3 z-40 border-t border-gray-100">
          {" "}
          <Link
            href="/"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Catalog
          </Link>
          <Link
            href="/info"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Info
          </Link>
          <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col items-stretch space-y-1">
            {" "}
            {renderUserControls(true)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
