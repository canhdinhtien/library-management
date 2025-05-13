import { connectToDatabase } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    console.log("MongoDB Driver: GET /api/publishers - Connection successful.");

    const publishersArray = await db
      .collection("publishers")
      .find({})
      .toArray();

    const publishersWithPopulatedData = await Promise.all(
      publishersArray.map(async (publisher) => {
        let populatedBooks = [];
        if (publisher.booksPublished && publisher.booksPublished.length > 0) {
          populatedBooks = await db
            .collection("books")
            .find(
              {
                _id: {
                  $in: publisher.booksPublished
                    .map((id) =>
                      ObjectId.isValid(id) ? new ObjectId(id) : null
                    )
                    .filter((id) => id),
                },
              },
              { projection: { title: 1 } }
            )
            .toArray();
        }

        return {
          ...publisher,
          booksPublished: populatedBooks,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: publishersWithPopulatedData,
    });
  } catch (error) {
    console.error(
      "MongoDB Driver: Error fetching publishers:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch publishers",
        errorDetail: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Tạo nhà xuất bản mới
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Lấy các trường từ body theo PublisherSchema
    // Nhớ rằng schema của bạn không có 'description' hoặc 'logo' trực tiếp
    // Nếu bạn muốn lưu logoUrl, frontend cần gửi trường đó
    const {
      publisherCode,
      name,
      address,
      phone,
      logoUrl, // << Giả sử bạn thêm trường này vào schema và frontend gửi nó
    } = body;

    // ----- VALIDATION CƠ BẢN -----
    if (!publisherCode || !name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: publisherCode and name are required.",
        },
        { status: 400 }
      );
    }

    // Kiểm tra publisherCode đã tồn tại chưa
    const existingPublisher = await db
      .collection("publishers")
      .findOne({ publisherCode });
    if (existingPublisher) {
      return NextResponse.json(
        {
          success: false,
          message: `Publisher with code ${publisherCode} already exists.`,
        },
        { status: 409 }
      );
    }

    const newPublisherDocument = {
      publisherCode,
      name,
      ...(address && { address }),
      ...(phone && { phone }),
      ...(logoUrl && { logoUrl }), // << Nếu bạn có trường logoUrl
      booksPublished: [],
      authorsCollaborated: [],
    };

    const result = await db
      .collection("publishers")
      .insertOne(newPublisherDocument);
    const createdPublisher = await db
      .collection("publishers")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        message: "Publisher created successfully",
        data: createdPublisher,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "MongoDB Driver: Error creating publisher:",
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
        message: "Failed to create publisher",
        errorDetail: error.message,
      },
      { status: 500 }
    );
  }
}
