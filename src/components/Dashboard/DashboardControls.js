
"use client";

import {
  Users,
  BookOpen,
  RefreshCw,
  BookPlus,
  UserPlus,
  BookCopy,
} from "lucide-react";
import { useState } from "react";
import AddBookModal from "./AddBookModal";

export default function DashboardControls({
  activeTab,
  onTabChange,
  onRefresh,
  isLoading,
  onAddBook,
  onAddUser,
  onAddBorrow,
}) {
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const handleOpenAddBookModal = () => {
    setIsAddBookModalOpen(true);
  };

  const handleCloseAddBookModal = () => {
    setIsAddBookModalOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Tab Buttons */}
      <div className="flex flex-col sm:flex-row bg-[#fff8e1] rounded-md p-1.5 self-start w-full sm:w-auto">
        <button
          onClick={() => onTabChange("books")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium transition-colors
            ${
              activeTab === "books"
                ? "bg-[#FF9800] text-white"
                : "text-gray-700"
            }
            border-b sm:border-b-0 sm:border-r border-gray-300
            ${activeTab === "books" ? "z-10" : ""}
          `}
          style={{ borderRadius: "0.5rem 0.5rem 0 0", borderRightWidth: 1 }}
        >
          <BookOpen className="h-5 w-5" />
          Books
        </button>
        <button
          onClick={() => onTabChange("borrows")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium transition-colors
            ${
              activeTab === "borrows"
                ? "bg-[#FF9800] text-white"
                : "text-gray-700"
            }
            border-b sm:border-b-0 sm:border-r border-gray-300
            ${activeTab === "borrows" ? "z-10" : ""}
          `}
        >
          <BookCopy className="h-5 w-5" />
          Borrows
        </button>
        <button
          onClick={() => onTabChange("users")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium transition-colors
            ${
              activeTab === "users"
                ? "bg-[#FF9800] text-white"
                : "text-gray-700"
            }
            border-b-0 sm:border-b-0 sm:border-r-0
            ${activeTab === "users" ? "z-10" : ""}
          `}
        >
          <Users className="h-5 w-5" />
          Users
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 self-end sm:self-center w-full sm:w-auto">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          aria-label="Refresh data"
        >
          <RefreshCw
            className={`text-gray-500 h-5 w-5 mr-2 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
          <span className="hidden sm:inline text-gray-700">Refresh</span>
        </button>
        {activeTab === "books" && (
          <>
            <button
              onClick={handleOpenAddBookModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
            >
              <BookPlus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Book</span>
            </button>
            <AddBookModal
              isOpen={isAddBookModalOpen}
              onClose={handleCloseAddBookModal}
            />
          </>
        )}
        {activeTab === "borrows" && (
          <button
            onClick={onAddBorrow}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
          >
            <BookPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Borrow</span>
          </button>
        )}
        {activeTab === "users" && (
          <button
            onClick={onAddUser}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
          >
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        )}
      </div>
    </div>
  );
}
