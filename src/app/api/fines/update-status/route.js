import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

async function updateBookStatus(borrowId) {
  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const borrow = db.collection("borrows").updateOne(
      {
        _id: new ObjectId(borrowId),
        returnDate: null,
      },
      {
        $set: { is_fine_paid: true },
      }
    );

    if (!borrow) throw new Error("Failed to update book status");

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
    const { borrowId } = await request.json();
    const result = await updateBookStatus(borrowId);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
