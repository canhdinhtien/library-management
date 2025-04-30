"use client";

import { Search, Filter, ChevronDown, Edit, Trash2 } from "lucide-react";

export default function UsersManagementSection({
  users = [],
  onSearchChange,
  onFilterClick,
  onEditUser,
  onDeleteUser,
}) {
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
                  {/* {users.map((user) => (

                            ))} */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="sm:hidden mt-5 px-5 pb-5 space-y-4">
          <h4 className="text-base font-medium text-gray-500">Mobile View</h4>
          {/* {users.map((user) => (

                    ))} */}
        </div>
      </div>
    </div>
  );
}
