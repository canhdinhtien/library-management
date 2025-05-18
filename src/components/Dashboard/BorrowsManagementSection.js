"use client";

import { Search, Filter, Edit, Trash2, BookOpen } from "lucide-react";
import { useState } from "react";

export default function BorrowsManagementSection({
  borrows = [],
  onEditBorrow,
  onDeleteBorrow,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Lọc và tìm kiếm người dùng
  const filteredBorrows = Array.isArray(borrows)
    ? borrows.filter((borrow) => {
        const matchesSearch = (borrow.userName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );
        const matchesFilter =
          filterStatus === "All" ||
          borrow.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
      })
    : [];

  return (
    <div className="space-y-6 p-5 md:p-8 bg-gray-50 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-[#FF9800] hidden sm:block" />
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Borrows Management
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Manage your library&#39;s borrow records
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#FF9800] focus:border-[#FF9800] focus:outline-none transition duration-200 shadow-sm"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-2 py-3 w-full border border-gray-300 rounded-lg text-base text-gray-700 focus:ring-2 focus:ring-[#FF9800] focus:border-[#FF9800] focus:outline-none transition duration-200 shadow-sm cursor-pointer"
            >
              <option value="All">All Borrows</option>
              <option value="Pending">Pending</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-[#fff8e1] text-left">
              <tr>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  User
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Book
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Borrow Date
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Expected Return
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700 text-center">
                  Status
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBorrows.length > 0 ? (
                filteredBorrows.map((borrow, index) => (
                  <tr
                    key={`${borrow._id}-${index}`}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-5 sm:px-8 py-5">
                      <div className="font-medium text-gray-900 truncate max-w-xs text-base">
                        {borrow.userName || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {borrow.bookTitle}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {borrow.borrowDate
                        ? new Date(borrow.borrowDate).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {borrow.expectedReturnDate
                        ? new Date(
                            borrow.expectedReturnDate
                          ).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          borrow.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : borrow.status === "Borrowed"
                            ? "bg-blue-100 text-blue-800"
                            : borrow.status === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : borrow.status === "Returned"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {borrow.status}
                      </span>
                    </td>
                    <td className="px-5 sm:px-8 py-5">
                      <div className="flex justify-end space-x-2 sm:space-x-3">
                        <button
                          onClick={() => onEditBorrow(borrow._id)}
                          className="text-[#FF9800] hover:text-[#e68a00] p-1.5 rounded-full hover:bg-orange-50 transition-colors"
                          aria-label="Edit borrow"
                        >
                          <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        {/* <button
                          onClick={() => onDeleteBorrow(borrow._id)}
                          className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Delete borrow"
                        >
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg">No borrow records found</p>
                      {searchTerm && (
                        <p className="text-base text-gray-400 mt-2">
                          Try adjusting your search criteria
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
