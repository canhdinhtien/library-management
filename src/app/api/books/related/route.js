import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    // Lấy query parameters từ URL
    const { searchParams } = new URL(request.url);
    const genresParam = searchParams.get("genres");
    const bookId = searchParams.get("bookId"); // Lấy bookId từ query parameters

    if (!genresParam) {
      return new Response(
        JSON.stringify({ success: false, message: "Genres are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Chuyển đổi genres từ chuỗi thành mảng
    const genres = genresParam.split(",");

    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");

    // Tìm sách có genres chứa ít nhất một thể loại trong danh sách genres, ngoại trừ sách hiện tại
    const books = await booksCollection
      .aggregate([
        {
          $match: {
            genres: { $in: genres },
            _id: { $ne: new ObjectId(bookId) }, // Loại trừ sách hiện tại
          },
        },
        {
          $lookup: {
            from: "authors", // Tên collection chứa thông tin tác giả
            localField: "author", // Trường trong collection books
            foreignField: "_id", // Trường trong collection authors
            as: "authorDetails", // Tên trường mới chứa thông tin tác giả
          },
        },
        {
          $unwind: "$authorDetails", // Giải nén mảng authorDetails thành đối tượng
        },
        {
          $project: {
            _id: 1,
            title: 1,
            genres: 1,
            coverImage: 1,
            author: "$authorDetails.name", // Chỉ lấy trường name từ authorDetails
          },
        },
      ])
      .toArray();

    console.log("Related books:", books); // Log danh sách sách liên quan
    // Kiểm tra xem có sách nào không
    if (!books || books.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No related books found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, books }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching related books:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
