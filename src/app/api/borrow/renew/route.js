import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";
export async function PUT(req) {
  // Lấy borrowId từ request body
  const { db } = await connectToDatabase();
  const { borrowId } = await req.json();

  try {
    // Lấy bản ghi mượn sách hiện tại
    const borrowRecord = await db.collection("borrows").findOne({
      _id: new ObjectId(borrowId),
      returnDate: null, // Chỉ gia hạn nếu sách chưa được trả
    });

    // Kiểm tra xem có bản ghi mượn sách không
    if (!borrowRecord) {
      return new Response(
        JSON.stringify({ error: "Borrow record not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tính toán ngày trả dự kiến mới (tăng thêm 7 ngày)
    const currentDueDate = borrowRecord.expectedReturnDate || new Date();
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 7); // Tăng thêm 7 ngày

    // Cập nhật bản ghi mượn sách
    const borrow = await db.collection("borrows").updateOne(
      {
        _id: new ObjectId(borrowId),
        returnDate: null, // Chỉ gia hạn nếu sách chưa được trả
      },
      {
        $set: { expectedReturnDate: newDueDate },
        $inc: { renewCount: 1 },
      }
    );

    // Kiểm tra xem có cập nhật được không
    if (!borrow.matchedCount) {
      return new Response(
        JSON.stringify({ error: "Borrow record not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({ message: "Book renewed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error renewing book:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
