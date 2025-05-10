import { connectToDatabase } from "../../../lib/dbConnect";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// // Secret key để mã hóa và giải mã token (nên lưu trữ trong môi trường biến)
// const JWT_SECRET = process.env.JWT_SECRET;

// // Hàm xác thực JWT
// const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);  // Giải mã token
//   } catch (error) {
//     return null;  // Nếu không giải mã được, trả về null
//   }
// };

// Hàm tạo ID sách mới (Dùng ObjectId của mongoose)
const generateBookId = () => {
  return new mongoose.Types.ObjectId(); // Tạo ObjectId cho sách mới
};

export async function GET(request) {
  try {
    // // Lấy token từ header Authorization
    // const authHeader = request.headers.get("Authorization");
    // if (!authHeader) {
    //   return new Response(
    //     JSON.stringify({ message: 'Authorization header is required' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    // const token = authHeader.split(" ")[1]; // Lấy token sau từ "Bearer <token>"
    // if (!token) {
    //   return new Response(
    //     JSON.stringify({ message: 'Token is required' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    // // Xác thực token
    // const user = verifyToken(token);
    // if (!user) {
    //   return new Response(
    //     JSON.stringify({ message: 'Invalid or expired token' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const authorName = searchParams.get("author");
    const title = searchParams.get("title");
    const featured = searchParams.get("featured") === "true";

    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    let pipeline = [];

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
      const query = {};

      if (title && title.trim() !== "") {
        query.title = { $regex: title, $options: "i" };
      }

      if (authorName && authorName.trim() !== "") {
        const authorMatch = await db.collection("authors").findOne({
          name: { $regex: authorName, $options: "i" },
        });

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

      if (genre && genre.trim() !== "") {
        query.category = { $regex: genre, $options: "i" };
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
            authorName: { $ifNull: ["$authorInfo.name", "Unknown Author"] },
          },
        },
        {
          $project: {
            authorInfo: 0,
          },
        },
      ];
    }

    const books = await db.collection("books").aggregate(pipeline).toArray();

    return new Response(JSON.stringify(books), {
      headers: { "content-type": "application/json" },
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
    // // Lấy token từ header Authorization
    // const authHeader = request.headers.get("Authorization");
    // if (!authHeader) {
    //   return new Response(
    //     JSON.stringify({ message: 'Authorization header is required' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    // const token = authHeader.split(" ")[1]; // Lấy token sau từ "Bearer <token>"
    // if (!token) {
    //   return new Response(
    //     JSON.stringify({ message: 'Token is required' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    // // Xác thực token
    // const user = verifyToken(token);
    // if (!user) {
    //   return new Response(
    //     JSON.stringify({ message: 'Invalid or expired token' }),
    //     { headers: { "Content-Type": "application/json" }, status: 401 }
    //   );
    // }

    // Nhận dữ liệu sách từ request body
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
      _id: new mongoose.Types.ObjectId(), // Tạo ObjectId cho sách
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Chèn sách vào collection "books"
    await db.collection("books").insertOne(newBook);

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
