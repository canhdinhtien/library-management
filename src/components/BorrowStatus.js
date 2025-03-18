"use client";

const BorrowStatus = ({ borrowedBooks, overdueBooks, stats }) => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Current Borrowed Books
      </h2>

      {/* Danh sách sách đang mượn */}
      <div className="border p-4 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Book Title</th>
              <th className="p-2">Author</th>
              <th className="p-2">Due Date</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((book) => (
              <tr key={book.id} className="border-b">
                <td className="p-2">{book.title}</td>
                <td className="p-2">{book.author}</td>
                <td className="p-2">{book.dueDate}</td>
                <td className="p-2">
                  <button className="px-3 py-1 bg-red-500 text-white rounded-md">
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sách quá hạn */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-center">Overdue Books</h2>
      <div className="border p-4 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Book Title</th>
              <th className="p-2">Author</th>
              <th className="p-2">Days Overdue</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {overdueBooks.map((book) => (
              <tr key={book.id} className="border-b">
                <td className="p-2">{book.title}</td>
                <td className="p-2">{book.author}</td>
                <td className="p-2 text-red-500">{book.daysOverdue}</td>
                <td className="p-2">
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded-md">
                    Renew
                  </button>
                  <button className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md">
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thống kê lịch sử mượn */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-center">
        Borrowing History Statistics
      </h2>
      <div className="border p-4 rounded-lg shadow-md">
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
