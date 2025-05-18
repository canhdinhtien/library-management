import { connectToDatabase } from "@/lib/dbConnect.js";
// import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const authorName = searchParams.get("author");
    const title = searchParams.get("title");
    const featured = searchParams.get("featured") === "true";
    const searchTerm = searchParams.get("searchTerm");

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
        { $unwind: "$authorInfo" },
        {
          $addFields: {
            authorName: "$authorInfo.name",
          },
        },
        {
          $project: {
            _id: 1,
            bookCode: 1,
            title: 1,
            genres: 1,
            description: 1,
            price: 1,
            quantity: 1,
            availableQuantity: 1,
            borrowedCount: 1,
            coverImage: 1,
            author: "$authorInfo.name",
            authorName: 1,
            publisher: 1,
          },
        },
      ];
    } else {
      const query = {};

      if (title && title.trim() !== "") {
        query.title = { $regex: title, $options: "i" };
      }

      if (searchTerm && searchTerm.trim() !== "") {
        query.$or = [
          { title: { $regex: searchTerm, $options: "i" } },
          { genres: { $regex: searchTerm, $options: "i" } },
        ];
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
          return new Response(JSON.stringify([]), {
            headers: { "content-type": "application/json" },
            status: 200,
          });
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
            _id: 1,
            bookCode: 1,
            title: 1,
            genres: 1,
            description: 1,
            price: 1,
            quantity: 1,
            availableQuantity: 1,
            borrowedCount: 1,
            coverImage: 1,
            author: "$authorInfo.name",
            authorName: 1,
            publisher: 1,
          },
        },
      ];
    }

    const books = await db.collection("books").aggregate(pipeline).toArray();

    return new Response(JSON.stringify(books), {
      headers: {
        "content-type": "application/json",
        "Cache-Control": "no-store",
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

// Add PUT request handler to update book quantity and genres
export async function PUT(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const body = await request.json();
    const { id, quantity, genres } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid book ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      quantity < 0
    ) {
      return new Response(JSON.stringify({ error: "Invalid quantity" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid genres" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the book
    const result = await db.collection("books").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          quantity: quantity,
          availableQuantity: quantity,
          genres: genres,
        },
      } // Update quantity, availableQuantity, and genres
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Book not found or no changes applied" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Book updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating book:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update book" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
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
      availableQuantity: parseInt(body.quantity),
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
