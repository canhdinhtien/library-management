"use client";

import { Search, Filter, ChevronDown, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function UsersManagementSection({
  users = [],
  onEditUser,
  onDeleteUser,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Lọc và tìm kiếm người dùng
  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.name?.toLowerCase() || "").includes(
      searchTerm.toLowerCase()
    );
    const matchesFilter =
      filterStatus === "All" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h3 className="text-xl font-medium text-gray-500">
                User Management
              </h3>
              <p className="text-base text-gray-500 mt-1">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72 pl-12 pr-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent text-gray-400"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-md text-base w-full justify-center sm:w-auto text-gray-400"
                  onClick={() => {
                    const nextStatus =
                      filterStatus === "All"
                        ? "Active"
                        : filterStatus === "Active"
                        ? "Inactive"
                        : "All";
                    setFilterStatus(nextStatus);
                  }}
                >
                  <Filter className="h-5 w-5" />
                  {filterStatus === "All"
                    ? "All Users"
                    : filterStatus === "Active"
                    ? "Active Users"
                    : "Inactive Users"}
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
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Books
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider hidden md:table-cell"
                    >
                      Join Date
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id || user._id}>
                        <td className="px-5 py-4 text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {user.books?.join(", ") || "No books"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm">
                          <button
                            onClick={() => onEditUser(user.id)}
                            className="text-[#FF9800] hover:text-[#F57C00] mr-4"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 mr-2"
                          >
                            <Trash2 className="h-4 w-4" />
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
                        No user accounts found.
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
