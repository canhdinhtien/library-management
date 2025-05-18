"use client";

import { Search, Filter, ChevronDown, Edit, Trash2, Users } from "lucide-react";
import { useState } from "react";

export default function StaffsManagementSection({
  staffs = [],
  onEditStaff,
  onDeleteStaff,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Lọc và tìm kiếm người dùng
  const filteredStaffs = Array.isArray(staffs)
    ? staffs.filter((staff) => {
        const matchesSearch = (staff.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );
        const matchesFilter =
          filterStatus === "All" ||
          (filterStatus === "Active" && staff.isVerified) ||
          (filterStatus === "Inactive" && !staff.isVerified);
        return matchesSearch && matchesFilter;
      })
    : [];

  return (
    <div className="space-y-6 p-5 md:p-8 bg-gray-50 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-[#FF9800] hidden sm:block" />
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Staff Management
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Manage staff accounts and roles
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#FF9800] focus:border-[#FF9800] focus:outline-none transition duration-200 shadow-sm"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-base w-full sm:w-auto text-gray-700 bg-white hover:bg-gray-50 transition"
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
              ? "All Staffs"
              : filterStatus === "Active"
              ? "Active Staffs"
              : "Inactive Staffs"}
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-[#fff8e1] text-left">
              <tr>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Name
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Email
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Phone
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Join Date
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaffs.length > 0 ? (
                filteredStaffs.map((staff) => (
                  <tr
                    key={staff.id || staff._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-5 sm:px-8 py-5 font-medium text-gray-900 truncate max-w-xs text-base">
                      {staff.name}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {staff.email}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {staff.phone}
                    </td>
                    <td className="px-5 sm:px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          staff.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {staff.isVerified ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {staff.joinDate
                        ? new Date(staff.joinDate).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2 sm:space-x-3">
                        <button
                          onClick={() => onEditStaff(staff.id || staff._id)}
                          className="text-[#FF9800] hover:text-[#e68a00] p-1.5 rounded-full hover:bg-orange-50 transition-colors"
                          aria-label="Edit staff"
                        >
                          <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <button
                          onClick={() => onDeleteStaff(staff.id || staff._id)}
                          className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Delete staff"
                        >
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg">No staff accounts found</p>
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
