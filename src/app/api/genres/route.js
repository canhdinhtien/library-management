import { connectToDatabase } from "../../../lib/dbConnect";

export async function GET(request) {
  console.log("--- GET /api/genres request received (Native Driver) ---");
  try {
    console.log("Attempting native MongoDB connection...");
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    console.log("Native MongoDB connection successful.");

    // Kiểm tra xem kết nối có thành công không
    if (!db) {
      throw new Error("Database connection failed (db object not received).");
    }

    console.log("Attempting to get distinct genres using native driver...");

    // Lấy danh sách thể loại
    const genres = await db
      .collection("books")
      .distinct("genres")
      .then((results) => results.filter(Boolean).sort());

    console.log(`Found ${genres.length} distinct genres:`, genres);

    // Trả về danh sách thể loại
    return new Response(JSON.stringify(genres), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("!!! Error in /api/genres route (Native Driver):", error);
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);

    const statusCode = 500;
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch genres",
        details: "Check server logs for more information.",
      }),
      {
        headers: { "content-type": "application/json" },
        status: statusCode,
      }
    );
  }
}
