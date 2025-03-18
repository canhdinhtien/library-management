"use client";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto text-center">
        {/* Logo & Tên */}
        <h2 className="text-xl font-bold mb-2">📚 Digital Library Hub</h2>

        {/* Danh sách liên kết */}
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/home" className="hover:text-yellow-400">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-yellow-400">
            Catalog
          </Link>
          <Link href="/info" className="hover:text-yellow-400">
            Info
          </Link>
          <Link href="/profile" className="hover:text-yellow-400">
            Profile
          </Link>
        </div>

        {/* Thông tin bản quyền */}
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Digital Library Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
