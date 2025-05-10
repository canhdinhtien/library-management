import { connectToDatabase } from "@/lib/dbConnect";
import verifyToken from "../../../middleware/auth";

export async function GET() {
  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();

    // Lấy tổng số sách
    const books = await db.collection("books").find().toArray();
    var totalBooks = 0;
    for (const book of books) {
      totalBooks += book.quantity;
    }

    // Lấy số sách đang được mượn
    const borrows = await db.collection("borrows").find().toArray();
    var borrowedBooks = 0;
    for (const borrow of borrows) {
      if (
        borrow.status === "Borrowed" ||
        borrow.status === "Overdue" ||
        borrow.status === "Pending"
      ) {
        borrowedBooks += 1;
      }
    }

    // Lấy số sách có sẵn
    const availableBooks = totalBooks - borrowedBooks;

    // Lấy số lượt mượn sách
    const totalBorrowings = await db.collection("borrows").countDocuments();

    // Lấy tổng số người dùng
    const totalUsers = await db.collection("members").countDocuments();

    // Trả về dữ liệu thống kê
    return new Response(
      JSON.stringify({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalUsers,
        totalBorrowings,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
    });
  }
}
