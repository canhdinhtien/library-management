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
    <div className="relative w-full max-w-xs sm:max-w-sm" ref={dropdownRef}>
      <div className="flex items-center border rounded-lg px-2 py-2 bg-white shadow-sm w-full">
        <button
          className="flex items-center px-3 sm:px-4 py-2 border-r text-gray-800 bg-white hover:bg-gray-100 rounded-l-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {label}
          <span className="ml-2">
            <Image
              src="/images/corner-down-round.png"
              alt="Dropdown Arrow"
              width={16}
              height={16}
              className="w-4 h-4 max-w-full"
            />
          </span>
        </button>

        <input
          type="text"
          placeholder={`Search ${label.toLowerCase()}...`}
          className="flex-grow px-2 py-1 focus:outline-none text-gray-800 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          className="px-3 sm:px-4 py-2 bg-orange-400 text-white rounded-lg hover:scale-105 transition-transform duration-200"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10 text-gray-800 max-h-48 overflow-y-auto">
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                    setSearchTerm("");
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
