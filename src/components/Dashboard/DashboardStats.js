"use client";

export default function DashboardStats({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          {stats.totalBooks ?? "-"}{" "}
        </div>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Total Books</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4CAF50]">
          {stats.availableBooks ?? "-"}
        </div>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Available Books
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF9800]">
          {stats.borrowedBooks ?? "-"}
        </div>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Borrowed Books
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">
          {stats.totalBorrowings ?? "-"}
        </div>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Total Borrowings Records
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center col-span-2 sm:col-span-1 shadow-sm">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2196F3]">
          {stats.totalUsers ?? "-"}
        </div>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Total Users</p>
      </div>
    </div>
  );
}
