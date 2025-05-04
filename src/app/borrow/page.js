"use client";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const availableBooks = [
  { id: 1, title: "1984", author: "George Orwell" },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien" },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari" },
  { id: 4, title: "Dune", author: "Frank Herbert" },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
  { id: 6, title: "To Kill a Mockingbird", author: "Harper Lee" },
];

export default function BorrowPage() {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("library");

  const handleAddBook = (book) => {
    if (
      selectedBooks.length >= 5 ||
      selectedBooks.find((b) => b.id === book.id)
    )
      return;
    setSelectedBooks([...selectedBooks, book]);
  };

  const handleRemoveBook = (id) => {
    setSelectedBooks(selectedBooks.filter((book) => book.id !== id));
  };

  const handleSubmit = () => {
    const payload = {
      books: selectedBooks.map((b) => b.id),
      returnDate,
      note,
      deliveryMethod,
    };
    console.log("Borrow Request:", payload);
    // TODO: Send to backend
  };

  const filteredBooks = availableBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          📚 Borrow Books
        </h2>
        {/* Thông báo số sách còn lại có thể mượn */}
        {/* Notification for remaining books */}
        <div className="text-sm text-gray-600">
          You can borrow {5 - selectedBooks.length} more book(s).
        </div>

        <div className="space-y-4">
          {/* Selected Books */}
          <div>
            <strong className="text-lg">
              Selected Books ({selectedBooks.length}/5):
            </strong>
            {selectedBooks.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">
                No books selected yet.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {selectedBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="text-gray-700">
                      {book.title} - {book.author}
                    </span>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleRemoveBook(book.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search and Add Books */}
          {selectedBooks.length < 5 && (
            <div>
              <h3 className="font-semibold mb-2 text-lg">
                Search for books to borrow
              </h3>
              <input
                type="text"
                placeholder="Enter book title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              />
              <ul className="space-y-2">
                {filteredBooks.map((book) => (
                  <li
                    key={book.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="text-gray-700">
                      {book.title} - {book.author}
                    </span>
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => handleAddBook(book)}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expected Return Date */}
          <div>
            <label className="block font-medium text-lg">
              Expected Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-2 border border-gray-300 rounded-md p-2 w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-lg">
              Notes (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 border border-gray-300 rounded-md p-2 w-full"
              placeholder="Example: Urgent for an exam..."
            />
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block font-medium text-lg">Delivery Method</label>
            <div className="mt-2 space-x-4">
              <label>
                <input
                  type="radio"
                  value="library"
                  checked={deliveryMethod === "library"}
                  onChange={() => setDeliveryMethod("library")}
                />{" "}
                At the library
              </label>
              <label>
                <input
                  type="radio"
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={() => setDeliveryMethod("delivery")}
                />{" "}
                Home delivery
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedBooks.length === 0}
              className={`px-4 py-2 rounded-md text-white ${
                selectedBooks.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
              }`}
            >
              Confirm Borrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
