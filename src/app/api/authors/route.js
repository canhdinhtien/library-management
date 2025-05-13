import { connectToDatabase } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    console.log("MongoDB Driver: GET /api/authors - Connection successful.");

    const authorsArray = await db.collection("authors").find({}).toArray();

    const authorsWithPopulatedData = await Promise.all(
      authorsArray.map(async (author) => {
        let populatedCoopPublisher = null;
        if (author.coopPublisher && ObjectId.isValid(author.coopPublisher)) {
          populatedCoopPublisher = await db
            .collection("publishers")
            .findOne(
              { _id: new ObjectId(author.coopPublisher) },
              { projection: { name: 1 } }
            );
        }
        return {
          ...author,
          coopPublisher: populatedCoopPublisher,
        };
      })
    );

    return NextResponse.json({ success: true, data: authorsWithPopulatedData });
  } catch (error) {
    console.error(
      "MongoDB Driver: Error fetching authors:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch authors",
        errorDetail: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Tạo tác giả mới
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const {
      authorCode,
      name,
      gender,
      image,
      bio,
      birthYear,
      deathYear,
      coopPublisher,
    } = body;

    if (!authorCode || !name || !birthYear || !coopPublisher) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: authorCode, name, birthYear, coopPublisher are required.",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(coopPublisher)) {
      return NextResponse.json(
        { success: false, message: "Invalid coopPublisher ID format." },
        { status: 400 }
      );
    }

    const publisherExists = await db
      .collection("publishers")
      .findOne({ _id: new ObjectId(coopPublisher) });
    if (!publisherExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Publisher with ID ${coopPublisher} not found.`,
        },
        { status: 400 }
      );
    }

    // Kiểm tra authorCode đã tồn tại chưa
    const existingAuthor = await db
      .collection("authors")
      .findOne({ authorCode });
    if (existingAuthor) {
      return NextResponse.json(
        {
          success: false,
          message: `Author with code ${authorCode} already exists.`,
        },
        { status: 409 }
      );
    }

    // Chuẩn bị dữ liệu để insert, chuyển đổi coopPublisher thành ObjectId
    const newAuthorDocument = {
      authorCode,
      name,
      birthYear: parseInt(birthYear, 10), // Đảm bảo là số
      coopPublisher: new ObjectId(coopPublisher), // Chuyển đổi sang ObjectId
      ...(gender && { gender }),
      ...(image && { image }),
      ...(bio && { bio }),
      ...(deathYear && { deathYear: parseInt(deathYear, 10) }),
      booksPublished: [],
    };

    const result = await db.collection("authors").insertOne(newAuthorDocument);

    const createdAuthor = await db
      .collection("authors")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        message: "Author created successfully",
        data: createdAuthor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "MongoDB Driver: Error creating author:",
      error.message,
      error.stack
    );
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const value = body[field];
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate key error: ${field} '${value}' already exists.`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create author",
        errorDetail: error.message,
      },
      { status: 500 }
    );
  }
}
