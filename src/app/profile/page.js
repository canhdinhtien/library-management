"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import BorrowStatus from "../../components/BorrowStatus";
export default function Profile() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    averageDays: 0,
    genres: [],
  });

  // Định nghĩa hàm fetchBorrowedBooks bên ngoài useEffect
  const fetchBorrowedBooks = async () => {
    try {
      const memberId = "67f7a353d1e1d39a9c57f09e"; // Thay thế bằng ID người dùng thực tế
      const response = await fetch(
        `http://localhost:5000/api/borrows/${memberId}`
      );
      const data = await response.json();

      // Lọc sách qua borrow.status
      const borrowed = data.filter((borrow) => borrow.status === "Borrowed");
      const overdue = data.filter((borrow) => borrow.status === "Overdue");

      console.log("Borrowed books:", borrowed);
      console.log("Overdue books:", overdue);
      setBorrowedBooks(borrowed);
      setOverdueBooks(overdue);

      // Tính toán thống kê
      const totalBorrowed = data.reduce((sum, borrow) => {
        return (
          sum +
          borrow.books.reduce((bookSum, book) => bookSum + book.quantity, 0)
        );
      }, 0);

      const recentBooks = data
        .flatMap((borrow) => borrow.books.map((book) => book.book))
        .slice(-5); // Lấy 5 sách gần nhất
      const genres = [...new Set(recentBooks.map((book) => book.category))];

      const totalDays = data
        .filter((borrow) => borrow.status === "Returned") // Lọc các bản ghi có status là "Returned"
        .reduce((sum, borrow) => {
          const borrowDays =
            (new Date(borrow.returnDate) - new Date(borrow.borrowDate)) /
            (1000 * 60 * 60 * 24); // Tính số ngày mượn
          return sum + borrowDays;
        }, 0);

      const returnedCount = data.filter(
        (borrow) => borrow.status === "Returned"
      ).length; // Đếm số bản ghi có status là "Returned"

      const averageDays = returnedCount > 0 ? totalDays / returnedCount : 0; // Tránh chia cho 0

      setStats({
        totalBorrowed,
        averageDays: averageDays.toFixed(2),
        genres,
      });

      console.log("Statistics:", {
        totalBorrowed,
        averageDays: averageDays.toFixed(2),
        genres,
      });
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
    }
  };

  // Gọi fetchBorrowedBooks trong useEffect
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  return (
    <div className="text-gray-800">
      <Navbar />
      <BorrowStatus
        borrowedBooks={borrowedBooks}
        overdueBooks={overdueBooks}
        stats={stats}
        fetchBorrowedBooks={fetchBorrowedBooks} // Truyền hàm fetchBorrowedBooks vào BorrowStatus
      />
    </div>
  );
}
