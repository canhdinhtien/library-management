import { connectToDatabase } from "@/lib/dbConnect.js";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    // Lấy danh sách sách từ cơ sở dữ liệu
    const books = await db.collection("books").find().toArray();

    // Trả về danh sách sách
    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching books:", error);

    // Trả về lỗi nếu có
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
