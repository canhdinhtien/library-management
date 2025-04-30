"use client";

import { Search, Filter, ChevronDown, Edit, Trash2 } from "lucide-react";

export default function StaffManagementSection({
  staffs = [],
  onSearchChange,
  onFilterClick,
  onEditStaff,
  onDeleteStaff,
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h3 className="text-xl font-medium text-gray-500">
                Staff Management
              </h3>{" "}
              <p className="text-base text-gray-500 mt-1">
                Manage staff accounts and roles
              </p>{" "}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search staff..."
                  onChange={onSearchChange}
                  className="w-full sm:w-72 pl-12 pr-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9800] focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <button
                  onClick={onFilterClick}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-md text-base w-full justify-center sm:w-auto text-gray-600 hover:bg-gray-50"
                >
                  <Filter className="h-5 w-5" /> Filter{" "}
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
                      Phone Number
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
                  {staffs.length > 0 ? (
                    staffs.map((staff) => (
                      <tr key={staff._id}>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {staff.username}
                        </td>{" "}
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {staff.email}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.role}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              staff.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {staff.isVerified ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(staff.createdAt).toLocaleDateString()}{" "}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => onEditStaff(staff._id)}
                            className="text-[#FF9800] hover:text-[#F57C00] mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStaff(staff._id)}
                            className="text-red-600 hover:text-red-800"
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
                        No staff accounts found.
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
