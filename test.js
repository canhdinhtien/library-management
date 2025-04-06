// testDb.js (ở thư mục gốc hoặc src/)
import mongoose from "mongoose";
import dbConnect from "./src/lib/dbConnect.js"; // điều chỉnh path nếu cần
import dotenv from "dotenv";

dotenv.config(); // Load .env

(async () => {
  try {
    await dbConnect(); // Kết nối MongoDB

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📦 Collections in database:");
    collections.forEach((col) => console.log(` - ${col.name}`));

    await mongoose.connection.close(); // Đóng kết nối sau khi test
    console.log("✅ Kết nối đã được đóng.");
  } catch (err) {
    console.error("❌ Lỗi khi kết nối:", err);
  }
})();
