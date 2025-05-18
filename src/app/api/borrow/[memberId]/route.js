import { connectToDatabase } from "../../../../lib/dbConnect.js";
import mongoose from "mongoose";
import { getUserBorrowedBooks } from "../../../../services/borrowService.js";

export async function GET(req, context) {
  // Lấy ID thành viên từ context
  const { params } = context;
  const { memberId } = await params;
  console.log("Received memberId:", memberId); // Log giá trị memberId

  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    console.log("Mongoose connection state:", mongoose.connection.readyState);
    console.log("Before fetching borrowed books for memberId:", memberId);
    // Lấy danh sách sách đã mượn của thành viên
    const borrowedBooks = await getUserBorrowedBooks(memberId);
    console.log("After fetching borrowed books:", borrowedBooks);

    // Trả về danh sách sách đã mượn
    return new Response(JSON.stringify(borrowedBooks), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/borrow/[memberId]:", error); // Log lỗi chi tiết
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
