"use client";

import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BooksManagementSection({
  books = [],
  onEditBook: handleEditBook,
  onDeleteBook,
  onBookUpdated,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Lọc theo searchTerm
  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân trang
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(start, end);
  const hasMore = end < filteredBooks.length;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-5 md:p-8 bg-gray-50 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-[#FF9800] hidden sm:block" />
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Books Management
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Manage your library&#39;s book inventory
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search book..."
            className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#FF9800] focus:border-[#FF9800] focus:outline-none transition duration-200 shadow-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-[#fff8e1] text-left">
              <tr>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Title
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Author
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Genres
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Quantity
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700">
                  Available
                </th>
                <th className="px-5 sm:px-8 py-4 font-medium text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <tr
                    key={book._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-5 sm:px-8 py-5">
                      <div className="font-medium text-gray-900 truncate max-w-xs text-base">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1.5 md:hidden">
                        {book.authorName || "Unknown"}
                      </div>
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      {book.authorName || "Unknown"}
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700">
                      <div className="flex flex-wrap gap-1.5">
                        {book.genres?.slice(0, 3).map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-[#FFF3E0] text-[#FF9800] rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                        {book.genres?.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                            +{book.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-gray-700 text-base">
                      {book.quantity}
                    </td>
                    <td className="px-5 sm:px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          book.availableQuantity > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td className="px-5 sm:px-8 py-5">
                      <div className="flex justify-end space-x-2 sm:space-x-3">
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setShowEditModal(true);
                          }}
                          className="text-[#FF9800] hover:text-[#e68a00] p-1.5 rounded-full hover:bg-orange-50 transition-colors"
                          aria-label="Edit book"
                        >
                          <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <button
                          onClick={() => onDeleteBook(book._id)}
                          className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Delete book"
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
                      <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg">No books found</p>
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

      {filteredBooks.length > 0 && (
        <div className="flex justify-between items-center pt-5">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="text-base text-gray-600 px-5 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Book</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedBook = {
                  quantity: formData.get("quantity"),
                  genres: formData
                    .get("genres")
                    .split(",")
                    .map((g) => g.trim()),
                };
                fetch(`/api/admin/books/${editingBook._id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                  },
                  body: JSON.stringify({
                    quantity: parseInt(updatedBook.quantity),
                    genres: updatedBook.genres,
                  }),
                })
                  .then((response) => {
                    if (!response.ok) {
                      return response.json().then((err) => {
                        throw new Error(err.message || "Failed to update book");
                      });
                    }
                    return response.json();
                  })
                  .then((data) => {
                    toast.success("Book updated successfully");
                    setShowEditModal(false);
                    if (onBookUpdated) {
                      onBookUpdated(editingBook._id);
                    }
                    // handleEditBook(editingBook._id, updatedBook);
                  })
                  .catch((error) => {
                    toast.error(error.message);
                  });
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-500"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={editingBook.quantity}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Genres (comma-separated)
                </label>
                <input
                  type="text"
                  name="genres"
                  defaultValue={editingBook.genres.join(",")}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#F57C00] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
