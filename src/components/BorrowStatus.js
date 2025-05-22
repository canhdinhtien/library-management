// "use client";
import { useState } from "react";

const BorrowStatus = ({
  borrowedBooks,
  overdueBooks,
  stats,
  fetchBorrowedBooks,
}) => {
  const [editing, setEditing] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const renewBook = async (borrowId, bookId) => {
    const currentDueDate = new Date(
      borrowedBooks.find((borrow) => borrow._id === borrowId).expectedReturnDate
    );

    const newDate = new Date(newDueDate);

    // Kiểm tra ngày mới phải lớn hơn ngày hiện tại
    if (newDate <= currentDueDate) {
      const errorMessage =
        "New due date must be later than the current due date.";
      setErrorMessage(errorMessage);
      console.log("Error: ", errorMessage);
      toast(`Error: ${errorMessage}`);
      setEditing(null); // Thoát trạng thái chỉnh sửa
      setErrorMessage(errorMessage);
    }

    // Kiểm tra ngày mới không vượt quá 1 tháng kể từ ngày hiện tại
    const oneMonthLater = new Date(currentDueDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    if (newDate > oneMonthLater) {
      const errorMessage =
        "New due date cannot be more than one month from the current due date.";
      setErrorMessage(errorMessage);
      toast(`Error: ${errorMessage}`);
      setEditing(null); // Thoát trạng thái chỉnh sửa
      return;
    }
    // Kiểm tra số lần gia hạn
    const bookToRenew = borrowedBooks
      .find((borrow) => borrow._id === borrowId)
      .books.find((book) => book.book._id === bookId);
    if (bookToRenew.renewCount >= 2) {
      const errorMessage =
        "You have reached the maximum number of renewals for this book.";
      setErrorMessage(errorMessage);
      toast(`Error: ${errorMessage}`);
      setEditing(null); // Thoát trạng thái chỉnh sửa
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/borrow/renew/${borrowId}/${bookId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newDueDate }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Book renewed successfully:", data);
        toast("Book renewed successfully!");
        setErrorMessage(""); // Xóa thông báo lỗi
        fetchBorrowedBooks(); // Cập nhật lại danh sách sách mượn
        setEditing(null);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message); // Lưu thông báo lỗi từ backend
      }
    } catch (error) {
      console.error("Error renewing book:", error);
    }
  };
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Current Borrowed Books
      </h2>

      {/* Danh sách sách đang mượn */}
      <div className="border md:p-4 pb-2 rounded-lg shadow-md min-w-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-center w-1/4">Book Title</th>
              <th className="p-2 text-center w-1/4 sm:table-cell hidden">
                Author
              </th>
              <th className="p-2 text-center w-1/4">Due Date</th>
              <th className="p-2 text-center w-1/4">Action</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((borrow) =>
              borrow.books.map((book) => (
                <tr key={book._id} className="border-b ">
                  <td className="p-2 text-center w-1/4">{book.book.title}</td>
                  <td className="p-2 text-center w-1/4 sm:table-cell hidden">
                    {book.book.author.name}
                  </td>
                  <td className="p-2 text-center w-1/4">
                    {editing === book._id ? (
                      <input
                        type="date"
                        className="border rounded p-1"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                      />
                    ) : (
                      new Date(borrow.expectedReturnDate).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    )}
                  </td>
                  <td className="p-2 text-center w-1/4">
                    <div className="flex justify-center items-center flex-col md:flex-row ">
                      {editing === book._id ? (
                        <>
                          <button
                            className="m-1 px-3 py-1 bg-green-500 text-white rounded-md group hover:bg-green-600 hover:scale-110 transition-transform duration-200 w-full md:w-auto"
                            onClick={() =>
                              renewBook(borrow._id, book.book._id, newDueDate)
                            }
                          >
                            Update
                          </button>
                          <button
                            className="m-1 px-3 py-1 bg-gray-400 text-white rounded-md group hover:bg-gray-500 hover:scale-110 transition-transform duration-200 w-full md:w-auto"
                            onClick={() => setEditing(null)} // Thoát trạng thái chỉnh sửa
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="m-1 px-3 py-1 bg-orange-400 text-white rounded-md group hover:bg-orange-500 hover:scale-110 transition-transform duration-200 w-full md:w-auto"
                            onClick={() => {
                              setEditing(book._id);
                              setNewDueDate(
                                new Date(borrow.expectedReturnDate)
                                  .toISOString()
                                  .split("T")[0]
                              ); // Đặt giá trị mặc định cho ô nhập
                            }}
                          >
                            Renew
                          </button>
                          <button className="m-1 px-3 py-1 bg-red-500 text-white rounded-md group hover:bg-red-600 hover:scale-110 transition-transform duration-200 w-full md:w-auto">
                            Return
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sách quá hạn */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-center">Overdue Books</h2>
      <div className="border md:p-4 pb-2 rounded-lg shadow-md min-w-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-center w-1/4">Book Title</th>
              <th className="p-2 text-center w-1/4 sm:table-cell hidden">
                Author
              </th>
              <th className="p-2 text-center w-1/4">Days Overdue</th>
              <th className="p-2 text-center w-1/4">Action</th>
            </tr>
          </thead>
          <tbody>
            {overdueBooks.map((overdue) =>
              overdue.books.map((book) => {
                // Tính số ngày quá hạn
                const overdueDays = Math.max(
                  0,
                  Math.floor(
                    (new Date() - new Date(overdue.expectedReturnDate)) /
                      (1000 * 60 * 60 * 24) // Chuyển từ milliseconds sang ngày
                  )
                );

                return (
                  <tr key={book._id} className="border-b ">
                    <td className="p-2 text-center w-1/4">{book.book.title}</td>
                    <td className="p-2 text-center w-1/4 sm:table-cell hidden">
                      {book.book.author.name}
                    </td>
                    <td className="p-2 text-center w-1/4 text-red-500">
                      {editing === book._id ? (
                        <input
                          type="date"
                          className="border rounded p-1"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                        />
                      ) : (
                        `${overdueDays}`
                      )}
                    </td>
                    <td className="p-2 text-center w-1/4">
                      <div className="flex justify-center items-center flex-col md:flex-row ">
                        <button className="m-1 px-3 py-1 bg-red-500 text-white rounded-md group hover:bg-red-600 hover:scale-110 transition-transform duration-200 w-full md:w-auto">
                          Return
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Thống kê lịch sử mượn */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-center">
        Borrowing History Statistics
      </h2>
      <div className="border p-4 rounded-lg shadow-md min-w-[300px]">
        <p>
          <strong>Total books borrowed:</strong> {stats.totalBorrowed}
        </p>
        <p>
          <strong>Average borrowing time:</strong> {stats.averageDays} days
        </p>
        <p>
          <strong>Most borrowed genres:</strong> {stats.genres.join(", ")}
        </p>
      </div>
    </section>
  );
};

export default BorrowStatus;
