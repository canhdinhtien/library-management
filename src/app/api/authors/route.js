import { connectToDatabase } from "../../../lib/dbConnect";

export async function GET(request) {
  console.log("--- GET /api/authors request received (Native Driver) ---");
  try {
    console.log("Attempting native MongoDB connection...");
    const { db } = await connectToDatabase();
    console.log("Native MongoDB connection successful.");

    if (!db) {
      throw new Error("Database connection failed (db object not received).");
    }

    console.log(
      "Attempting to get distinct author names using native driver..."
    );

    const authorsData = await db
      .collection("authors")
      .find({}, { projection: { name: 1, _id: 0 } })
      .toArray();

    const authorNames = authorsData
      .map((author) => author.name)
      .filter(Boolean)
      .sort();

    console.log(
      `Found ${authorNames.length} distinct author names:`,
      authorNames
    );

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
