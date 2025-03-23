"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Dropdown({ label, options, onSelect, onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Thanh chứa dropdown button, search bar và nút Search */}
      <div className="flex items-center border rounded-lg px-2 py-1 bg-white shadow-sm">
        {/* Dropdown Button */}
        <button
          className="flex items-center px-4 py-2 border-r text-gray-800 bg-white hover:bg-gray-100 rounded-l-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {label}
          <span className="ml-2">
            <Image
              src="/images/corner-down-round.png"
              alt="Logo"
              width={16}
              height={16}
              className="w-4 h-4 max-w-full"
            />
          </span>
        </button>

        {/* Search Bar */}
        <input
          type="text"
          placeholder={`Search ${label.toLowerCase()}...`}
          className="flex-grow px-2 py-1 focus:outline-none text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
            }
          }}
        />

        {/* Nút Search */}
        <button
          className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10 text-gray-800">
          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false); // Đóng dropdown sau khi chọn
                    setSearchTerm(""); // Xóa từ khóa tìm kiếm
                  }}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
