import { connectToDatabase } from "../../../lib/dbConnect";

export async function GET(request) {
  console.log("--- GET /api/authors request received (Native Driver) ---");
  try {
    console.log("Attempting native MongoDB connection...");
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    console.log("Native MongoDB connection successful.");

    // Kiểm tra xem kết nối có thành công không
    if (!db) {
      throw new Error("Database connection failed (db object not received).");
    }

    console.log(
      "Attempting to get distinct author names using native driver..."
    );

    // Lấy danh sách tác giả
    const authorsData = await db
      .collection("authors")
      .find({}, { projection: { name: 1, _id: 0 } })
      .toArray();

    // Lấy danh sách tên tác giả
    const authorNames = authorsData
      .map((author) => author.name)
      .filter(Boolean)
      .sort();

    console.log(
      `Found ${authorNames.length} distinct author names:`,
      authorNames
    );

    // Trả về danh sách tên tác giả
    return new Response(JSON.stringify(authorNames), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("!!! Error in /api/authors route (Native Driver):", error);
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    // console.error("Error Stack:", error.stack);

    const statusCode = 500;
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch authors",
        details: "Check server logs for more information.",
      }),
      {
        headers: { "content-type": "application/json" },
        status: statusCode,
      }
    );
  }
}
