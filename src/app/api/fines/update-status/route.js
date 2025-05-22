import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// Hàm cập nhật trạng thái sách
async function updateBookStatus(borrowId) {
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    // Cập nhật trạng thái sách
    const borrow = db.collection("borrows").updateOne(
      {
        _id: new ObjectId(borrowId),
        returnDate: null,
      },
      {
        $set: { is_fine_paid: true },
      }
    );

    // Kiểm tra xem có cập nhật được không
    if (!borrow) throw new Error("Failed to update book status");

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({ message: "Book status updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating book status:", error);
    throw new Error("Failed to update book status");
  }
}

export async function PUT(request) {
  try {
    // Kết nối đến cơ sở dữ liệu
    await connectToDatabase();
    // Lấy borrowId từ request body
    const { borrowId } = await request.json();
    // Cập nhật trạng thái sách
    const result = await updateBookStatus(borrowId);
    // Trả về kết quả
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
