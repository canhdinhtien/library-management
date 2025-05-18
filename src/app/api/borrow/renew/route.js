import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  const { db } = await connectToDatabase();
  try {
    const body = await req.json();
    const { borrowId } = body;
    if (!borrowId) {
      return new Response(JSON.stringify({ error: "Missing borrowId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Tìm bản ghi borrow chưa trả
    const borrowRecord = await db.collection("borrows").findOne({
      _id: new ObjectId(borrowId),
      returnDate: null,
    });

    if (!borrowRecord) {
      return new Response(
        JSON.stringify({
          error: "Borrow record not found or already returned",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if ((borrowRecord.renewCount || 0) >= 2) {
      return new Response(
        JSON.stringify({
          error:
            "You have reached the maximum number of renewals for this book.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tăng hạn trả thêm 7 ngày từ hạn cũ
    const currentDueDate =
      borrowRecord.expectedReturnDate || borrowRecord.dueDate || new Date();
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    // Update vào database
    await db.collection("borrows").updateOne(
      { _id: new ObjectId(borrowId) },
      {
        $set: { expectedReturnDate: newDueDate },
        $inc: { renewCount: 1 },
      }
    );

    return new Response(
      JSON.stringify({ message: "Book renewed successfully", newDueDate }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error renewing book:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
