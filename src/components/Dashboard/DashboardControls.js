"use client";

import {
  Users,
  BookOpen,
  RefreshCw,
  BookPlus,
  UserPlus,
  BookCopy,
} from "lucide-react";

export default function DashboardControls({
  activeTab,
  onTabChange,
  onRefresh,
  isLoading,
  onAddBook,
  onAddUser,
  onAddBorrow,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex bg-[#fff8e1] rounded-md p-1.5 self-start">
        <button
          onClick={() => onTabChange("books")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
            activeTab === "books" ? "bg-[#FF9800] text-white" : "text-gray-700"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          Books
        </button>
        <button
          onClick={() => onTabChange("borrows")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
            activeTab === "borrows"
              ? "bg-[#FF9800] text-white"
              : "text-gray-700"
          }`}
        >
          <BookCopy className="h-5 w-5" />
          Borrows
        </button>
        <button
          onClick={() => onTabChange("users")}
          className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
            activeTab === "users" ? "bg-[#FF9800] text-white" : "text-gray-700"
          }`}
        >
          <Users className="h-5 w-5" />
          Users
        </button>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center px-4 py-2.5 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
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
          <button
            onClick={onAddBook}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
          >
            <BookPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Book</span>
          </button>
        )}
        {activeTab === "borrows" && (
          <button
            onClick={onAddBorrow}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
          >
            <BookPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Borrow</span>
          </button>
        )}
        {activeTab === "users" && (
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
          >
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        )}
      </div>
    </div>
  );
}
