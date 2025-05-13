import { connectToDatabase } from "@/lib/dbConnect.js";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Lấy danh sách sách từ cơ sở dữ liệu
    const books = await db.collection("books").find().toArray();

    // Trả về danh sách sách
    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching books:", error);

    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const body = await request.json();

    const requiredFields = [
      "bookCode",
      "title",
      "genres",
      "price",
      "quantity",
      "coverImage",
      "author",
      "publisher",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    if (
      !mongoose.Types.ObjectId.isValid(body.author) ||
      !mongoose.Types.ObjectId.isValid(body.publisher)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid author or publisher ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newBook = {
      coverImage: body.coverImage,
      bookCode: body.bookCode,
      title: body.title,
      genres: body.genres,
      description: body.description,
      price: parseFloat(body.price),
      quantity: parseInt(body.quantity),
      availableQuantity:
        body.availableQuantity != null
          ? parseInt(body.availableQuantity)
          : parseInt(body.quantity),
      author: new mongoose.Types.ObjectId(body.author),
      publisher: new mongoose.Types.ObjectId(body.publisher),
      borrowedCount: 0,
    };

    const result = await db.collection("books").insertOne(newBook);

    return new Response(
      JSON.stringify({ message: "Book added successfully" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ error: "Book code already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error adding book:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to add book" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
