import { connectToDatabase } from "../../../lib/dbConnect";
import mongoose from "mongoose";

export async function GET(request) {
  try {
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
