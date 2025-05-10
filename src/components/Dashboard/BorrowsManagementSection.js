"use client";

import { Search, Filter, ChevronDown, Edit, Trash2 } from "lucide-react";

export default function BorrowsManagementSection({
  borrows = [],
  onEditBorrow,
  onDeleteBorrow,
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h3 className="text-xl font-medium text-gray-500">
                Borrows Management
              </h3>
              <p className="text-base text-gray-500 mt-1">
                Manage your library&apos;s borrow records
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="w-full sm:w-72 pl-12 pr-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent text-gray-400"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-md text-base w-full justify-center sm:w-auto text-gray-400">
                  <Filter className="h-5 w-5" />
                  Filter
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-[#fff8e1]">
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Book
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Borrow Date
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden md:table-cell"
                    >
                      Expected Return Date
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-center text-sm font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Return Date
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-right text-sm font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {borrows.length > 0 ? (
                    borrows.map((borrow) => (
                      <tr key={borrow._id}>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 ">
                          {borrow.userName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 ">
                          {borrow.bookTitle}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {new Date(borrow.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(
                            borrow.expectedReturnDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {borrow.returnDate || "Not Returned"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => onEditBorrow(borrow._id)}
                            className="text-[#FF9800] hover:text-[#FF9800]/80"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDeleteBorrow(borrow._id)}
                            className="text-red-500 hover:text-red-500/80 ml-3"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-500"
                      >
                        No borrows records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
