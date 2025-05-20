import { connectToDatabase } from "../../../lib/dbConnect";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Hàm tạo ID sách mới (Dùng ObjectId của mongoose)
const generateBookId = () => {
  return new mongoose.Types.ObjectId();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const authorName = searchParams.get("author");
    const title = searchParams.get("title");
    const featured = searchParams.get("featured") === "true";
    const searchTerm = searchParams.get("searchTerm");

    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    let pipeline = [];

    // Xây dựng pipeline cho các sách nổi bật
    if (featured) {
      pipeline = [
        { $sort: { rating: -1 } },
        { $limit: 4 },
        {
          $lookup: {
            from: "authors",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: "$authorInfo",
        },
        {
          $addFields: {
            authorName: "$authorInfo.name",
          },
        },
        {
          $project: {
            authorInfo: 0,
          },
        },
      ];
    } else {
      // Xây dựng query cho các sách khác
      const query = {};

      if (title && title.trim() !== "") {
        query.title = { $regex: title, $options: "i" };
      }

      if (searchTerm && searchTerm.trim() !== "") {
        query.$or = [
          { title: { $regex: searchTerm, $options: "i" } },
          { authorName: { $regex: searchTerm, $options: "i" } },
          { genres: { $regex: searchTerm, $options: "i" } },
        ];
      } else {
        if (authorName && authorName.trim() !== "") {
          // Tìm tác giả theo tên
          const authorMatch = await db.collection("authors").findOne({
            name: { $regex: authorName, $options: "i" },
          });

          // Nếu không tìm thấy tác giả, trả về mảng rỗng
          if (!authorMatch) {
            return new Response(JSON.stringify([]), {
              headers: { "content-type": "application/json" },
              status: 200,
            });
          }
          if (
            authorMatch._id &&
            mongoose.Types.ObjectId.isValid(authorMatch._id)
          ) {
            query.author = new mongoose.Types.ObjectId(authorMatch._id);
          } else {
            console.warn(`Invalid ObjectId found for author: ${authorName}`);
            return new Response(JSON.stringify([]), {
              headers: { "content-type": "application/json" },
              status: 200,
            });
          }
        }
      }

      if (genre && genre.trim() !== "") {
        query.genres = { $regex: genre, $options: "i" };
      }

      pipeline = [
        { $match: query },
        { $limit: 100 },
        {
          $lookup: {
            from: "authors",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            authorName: {
              $ifNull: ["$authorInfo.name", "Unknown Author"],
            },
          },
        },
        {
          $project: {
            authorInfo: 0,
          },
        },
      ];
    }

    // Lấy danh sách sách từ cơ sở dữ liệu
    const books = await db.collection("books").aggregate(pipeline).toArray();

    // Trả về danh sách sách
    return new Response(JSON.stringify(books), {
      headers: {
        "content-type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("API Error fetching books:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch books" }),
      {
        headers: { "content-type": "application/json" },
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const {
      bookCode,
      title,
      price,
      quantity,
      borrowedCount,
      author,
      publisher,
      coverImage,
      description,
      genres,
      availableQuantity,
      authorName,
    } = await request.json();

    // Kiểm tra các trường bắt buộc
    if (!bookCode || !title || !price || !quantity || !author || !publisher) {
      return new Response(
        JSON.stringify({ message: "All required fields must be provided" }),
        { status: 400 }
      );
    }

    // Kết nối đến cơ sở dữ liệu MongoDB
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    // Tạo sách mới
    const newBook = {
      _id: new mongoose.Types.ObjectId(),
      bookCode,
      title,
      price,
      quantity,
      borrowedCount,
      author: new mongoose.Types.ObjectId(author),
      publisher,
      coverImage,
      description,
      genres,
      availableQuantity,
      authorName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Chèn sách vào collection "books"
    await db.collection("books").insertOne(newBook);

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({ message: "Book created successfully", book: newBook }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating book:", error.stack || error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create book" }),
      { status: 500 }
    );
  }
}
