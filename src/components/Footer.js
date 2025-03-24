"use client";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="text-gray-700 py-6 mt-10">
      <div className="container mx-auto text-center">
        <div className="flex flex-col items-center justify-center w-full h-[6vh]">
          <div className="flex items-center space-x-1">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={80}
              height={40}
              className="h-[1.5em] w-auto object-contain"
            />
            <h1 className="text-base md:text-lg lg:text-2xl font-bold text-black">
              Digital Library Hub
            </h1>
          </div>
        </div>

        <div className="flex justify-center space-x-6 mb-4 text-xl font-medium">
          <Link href="/home" className="hover:text-orange-400">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-orange-400">
            Catalog
          </Link>
          <Link href="/info" className="hover:text-orange-400">
            Info
          </Link>
        </div>

        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Digital Library Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
