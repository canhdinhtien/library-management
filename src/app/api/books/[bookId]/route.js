import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/dbConnect.js";

export async function PUT(req, { params }) {
  try {
    const { id } = params; // Lấy id sách từ URL params
    const updateData = await req.json(); // Lấy dữ liệu cập nhật từ body request

    // Kết nối tới database
    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");

    // Tìm sách hiện tại để lấy quantity gốc
    const currentBook = await booksCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!currentBook) {
      return NextResponse.json(
        { success: false, message: "Book not found." },
        { status: 404 }
      );
    }

    // Chỉ cho phép sửa 2 trường: quantity (số lượng) và genres (thể loại)
    const updateFields = {};

    // Nếu quantity được cập nhật, tính toán sự thay đổi và áp dụng cho availableQuantity
    if (typeof updateData.quantity === "number") {
      const quantityDifference = updateData.quantity - currentBook.quantity;
      updateFields.quantity = updateData.quantity;

      // Cập nhật availableQuantity tương ứng với sự thay đổi của quantity
      const newAvailableQuantity =
        currentBook.availableQuantity + quantityDifference;
      updateFields.availableQuantity = Math.max(0, newAvailableQuantity); // Đảm bảo availableQuantity không âm
    }


    if (Array.isArray(updateData.genres)) {
      updateFields.genres = updateData.genres;
    }

    // Kiểm tra xem có gì để cập nhật không
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }


    // Thực hiện cập nhật sách với _id là id lấy từ params
    const updateResult = await booksCollection.updateOne(
      { _id: new ObjectId(id) }, // Tìm sách theo _id MongoDB ObjectId (đã sửa từ *id)
      { $set: updateFields } // Cập nhật các trường cho trước
    );

    // Nếu không có bản ghi nào bị thay đổi
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "No changes applied." },
        { status: 400 }
      );
    }

    // Trả về kết quả thành công

    return NextResponse.json(
      {
        success: true,
        message: "Book updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {

    // Bắt lỗi và trả về thông báo lỗi
    console.error("Error updating book:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 } // Đổi thành 500 vì đây là lỗi server
    );
  }
}
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const borrows = db.collection("borrows");

    // Kiểm tra còn ai đang mượn sách này không
    const isBorrowed = await borrows.findOne({
      bookId: new ObjectId(id),
      status: { $ne: "Returned" },
    });
    if (isBorrowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to delete: Book is still on loan ",
        },
        { status: 400 }
      );
    }

    // Get the authorId of the book being deleted
    const book = await books.findOne({ _id: new ObjectId(id) });
    if (!book) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }
    const authorId = book.author;


    // Delete the book
    const result = await books.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    // Count the number of books by the same author
    const bookCount = await books.countDocuments({ author: authorId });

    // If the count is 0, delete the author
    if (bookCount === 0) {
      const authors = db.collection("authors");
      await authors.deleteOne({ _id: authorId });
    }

    return NextResponse.json(
      { success: true, message: "Book deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}






import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { message: "Missing book ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const ratings = db.collection("ratings");
    const members = db.collection("members");

    // Pipeline cho MongoDB aggregation
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          // Tính toán điểm trung bình
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          averageRating: 1, // Hiển thị điểm trung bình
          reviews: 1,
        },
      },
    ];

    const book = await books.aggregate(aggregatePipeline).toArray();

    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: book[0], message: "Book fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// POST: Đánh giá mới và trả về những đánh giá đã có
export async function POST(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const body = await request.json();
    const { rating, text, memberId } = body;

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // 👉 Gọi lại aggregation pipeline như trong GET
    const members = db.collection("members");
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },

                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          reviews: 1,
          averageRating: 1,
        },
      },
    ];

    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    return NextResponse.json(
      {
        success: true,
        data: updatedBook[0],
        message: "Review added and book updated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );

  }
}





import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";
export async function PUT(req) {
  // Lấy borrowId từ request body
  const { db } = await connectToDatabase();
  const { borrowId } = await req.json();

  try {
    // Lấy bản ghi mượn sách hiện tại
    const borrowRecord = await db.collection("borrows").findOne({
      _id: new ObjectId(borrowId),
    });

    // Kiểm tra xem có bản ghi mượn sách không
    if (!borrowRecord) {
      return new Response(
        JSON.stringify({ error: "Borrow record not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tính toán ngày trả dự kiến mới (tăng thêm 7 ngày)
    const currentDueDate = borrowRecord.expectedReturnDate || new Date();
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + 7); // Tăng thêm 7 ngày

    // Cập nhật bản ghi mượn sách
    const borrow = await db.collection("borrows").updateOne(
      {
        _id: new ObjectId(borrowId),
      },
      {
        $set: { expectedReturnDate: newDueDate },
        $inc: { renewCount: 1 },
      }
    );

    // Kiểm tra xem có cập nhật được không
    if (!borrow.matchedCount) {
      return new Response(
        JSON.stringify({ error: "Borrow record not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({ message: "Book renewed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error renewing book:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}





import { connectToDatabase } from "@/lib/dbConnect.js";
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






import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { message: "Missing book ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const ratings = db.collection("ratings");
    const members = db.collection("members");

    // Pipeline cho MongoDB aggregation
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          // Tính toán điểm trung bình
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          averageRating: 1, // Hiển thị điểm trung bình
          reviews: 1,
        },
      },
    ];

    const book = await books.aggregate(aggregatePipeline).toArray();

    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: book[0], message: "Book fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// POST: Đánh giá mới và trả về những đánh giá đã có
export async function POST(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const body = await request.json();
    const { rating, text, memberId } = body;

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // 👉 Gọi lại aggregation pipeline như trong GET
    const members = db.collection("members");
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },

                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          reviews: 1,
          averageRating: 1,
        },
      },
    ];

    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    return NextResponse.json(
      {
        success: true,
        data: updatedBook[0],
        message: "Review added and book updated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );

  }
}





import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     // Lấy dữ liệu từ request body
//     const { bookId, userId, returnDate } = await req.json();
//     // Kết nối đến cơ sở dữ liệu
//     const { db } = await connectToDatabase();

//     // Tìm sách theo ID
//     const book = await db
//       .collection("books")
//       .findOne({ _id: new ObjectId(String(bookId)) });
//     if (!book) {
//       console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Book not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra số lượng sách còn lại
//     if (book.availableQuantity <= 0) {
//       console.log("Book is not available with ID:", bookId);
//       return new Response(JSON.stringify({ error: "Book is not available" }), {
//         status: 400,
//       });
//     }

//     // Tìm thành viên theo ID tài khoản
//     const member = await db
//       .collection("members")
//       .findOne({ accountId: new ObjectId(String(userId)) });
//     if (!member) {
//       console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Member not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra xem người dùng đã mượn cuốn sách này chưa
//     const existingBorrow = await db.collection("borrows").findOne({
//       member: member._id,
//       bookId: new ObjectId(String(bookId)),
//       status: { $in: ["Pending", "Borrowed"] }, // Kiểm tra cả trạng thái "Pending" và "Borrowed"
//     });

//     if (existingBorrow) {
//       console.log("User has already borrowed this book");
//       return new Response(
//         JSON.stringify({ error: "User has already borrowed this book" }),
//         {
//           status: 400,
//         }
//       );
//     }

//     // Kiểm tra người dùng có sách quá hạn hay không
//     const overdueBorrows = await db
//       .collection("borrows")
//       .find({
//         member: member._id,
//         status: "Overdue",
//       })
//       .toArray();
//     if (overdueBorrows.length > 0) {
//       console.log("User has overdue borrows");
//       return new Response(
//         JSON.stringify({ error: "User has overdue borrows" }),
//         { status: 400 }
//       );
//     }

//     // Cập nhật số lượng sách đã mượn và số lượng sách còn lại
//     await db
//       .collection("books")
//       .updateOne(
//         { _id: new ObjectId(String(bookId)) },
//         { $inc: { borrowedCount: +1, availableQuantity: -1 } }
//       );

//     // Tìm borrowCode lớn nhất hiện tại
//     const lastBorrow = await db
//       .collection("borrows")
//       .find()
//       .sort({ borrowCode: -1 })
//       .limit(1)
//       .toArray();
//     let nextBorrowCode = "MUON001"; // Giá trị mặc định nếu chưa có bản ghi nào
//     if (lastBorrow.length > 0) {
//       const lastCode = lastBorrow[0].borrowCode; // Lấy borrowCode cuối cùng
//       const lastNumber = parseInt(lastCode.replace("MUON", ""), 10); // Loại bỏ "MUON" và chuyển thành số
//       nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`; // Tăng giá trị và định dạng lại
//     }

//     // Lưu thông tin mượn sách vào bảng borrow
//     const borrow = {
//       borrowCode: nextBorrowCode,
//       member: new ObjectId(String(member._id)),
//       borrowDate: new Date(),
//       bookId: new ObjectId(String(bookId)),
//       expectedReturnDate: new Date(
//         new Date().setDate(new Date().getDate() + 60)
//       ),
//       is_fine_paid: false,
//       status: "Pending",
//       renewCount: 0,
//     };
//     const result = await db.collection("borrows").insertOne(borrow);
//     // Trả về kết quả
//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }

export async function POST(req) {
  try {
    const { bookId, userId, returnDate } = await req.json();
    const { db } = await connectToDatabase();

    // 1. Kiểm tra sách tồn tại
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(String(bookId)) });
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    // 2. Kiểm tra số lượng sách còn lại
    if (book.availableQuantity <= 0) {
      return new Response(JSON.stringify({ error: "Book is not available" }), {
        status: 400,
      });
    }

    // 3. Kiểm tra thành viên tồn tại
    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(String(userId)) });
    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // 4. Không cho mượn lại sách nếu đã mượn (Pending/Borrowed)
    const existingBorrow = await db.collection("borrows").findOne({
      member: member._id,
      bookId: new ObjectId(String(bookId)),
      status: { $in: ["Pending", "Borrowed"] },
    });
    if (existingBorrow) {
      return new Response(
        JSON.stringify({ error: "User has already borrowed this book" }),
        { status: 400 }
      );
    }

    // 5. Không cho mượn nếu còn sách quá hạn
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        member: member._id,
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      return new Response(
        JSON.stringify({ error: "User has overdue borrows" }),
        { status: 400 }
      );
    }

    // 6. Cập nhật số lượng sách
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(String(bookId)) },
        { $inc: { borrowedCount: 1, availableQuantity: -1 } }
      );

    // 7. Sinh mã mượn tự động
    const lastBorrow = await db
      .collection("borrows")
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001";
    if (lastBorrow.length > 0) {
      const lastCode = lastBorrow[0].borrowCode;
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10);
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // 8. Lưu thông tin mượn sách
    const borrow = {
      borrowCode: nextBorrowCode,
      member: new ObjectId(String(member._id)),
      borrowDate: new Date(),
      bookId: new ObjectId(String(bookId)),
      expectedReturnDate: new Date(
        new Date().setDate(new Date().getDate() + 60)
      ),
      is_fine_paid: false,
      status: "Pending",
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);

    // Get the newly created borrow object
    const newBorrow = await db
      .collection("borrows")
      .findOne({ _id: result.insertedId });

    return new Response(JSON.stringify({ success: true, data: newBorrow }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

}






import { connectToDatabase } from "@/lib/dbConnect.js";
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






import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { message: "Missing book ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const ratings = db.collection("ratings");
    const members = db.collection("members");

    // Pipeline cho MongoDB aggregation
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          // Tính toán điểm trung bình
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          averageRating: 1, // Hiển thị điểm trung bình
          reviews: 1,
        },
      },
    ];

    const book = await books.aggregate(aggregatePipeline).toArray();

    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: book[0], message: "Book fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// POST: Đánh giá mới và trả về những đánh giá đã có
export async function POST(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const body = await request.json();
    const { rating, text, memberId } = body;

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // 👉 Gọi lại aggregation pipeline như trong GET
    const members = db.collection("members");
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },

                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          reviews: 1,
          averageRating: 1,
        },
      },
    ];

    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    return NextResponse.json(
      {
        success: true,
        data: updatedBook[0],
        message: "Review added and book updated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );

  }
}





import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     // Lấy dữ liệu từ request body
//     const { bookId, userId, returnDate } = await req.json();
//     // Kết nối đến cơ sở dữ liệu
//     const { db } = await connectToDatabase();

//     // Tìm sách theo ID
//     const book = await db
//       .collection("books")
//       .findOne({ _id: new ObjectId(String(bookId)) });
//     if (!book) {
//       console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Book not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra số lượng sách còn lại
//     if (book.availableQuantity <= 0) {
//       console.log("Book is not available with ID:", bookId);
//       return new Response(JSON.stringify({ error: "Book is not available" }), {
//         status: 400,
//       });
//     }

//     // Tìm thành viên theo ID tài khoản
//     const member = await db
//       .collection("members")
//       .findOne({ accountId: new ObjectId(String(userId)) });
//     if (!member) {
//       console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Member not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra xem người dùng đã mượn cuốn sách này chưa
//     const existingBorrow = await db.collection("borrows").findOne({
//       member: member._id,
//       bookId: new ObjectId(String(bookId)),
//       status: { $in: ["Pending", "Borrowed"] }, // Kiểm tra cả trạng thái "Pending" và "Borrowed"
//     });

//     if (existingBorrow) {
//       console.log("User has already borrowed this book");
//       return new Response(
//         JSON.stringify({ error: "User has already borrowed this book" }),
//         {
//           status: 400,
//         }
//       );
//     }

//     // Kiểm tra người dùng có sách quá hạn hay không
//     const overdueBorrows = await db
//       .collection("borrows")
//       .find({
//         member: member._id,
//         status: "Overdue",
//       })
//       .toArray();
//     if (overdueBorrows.length > 0) {
//       console.log("User has overdue borrows");
//       return new Response(
//         JSON.stringify({ error: "User has overdue borrows" }),
//         { status: 400 }
//       );
//     }

//     // Cập nhật số lượng sách đã mượn và số lượng sách còn lại
//     await db
//       .collection("books")
//       .updateOne(
//         { _id: new ObjectId(String(bookId)) },
//         { $inc: { borrowedCount: +1, availableQuantity: -1 } }
//       );

//     // Tìm borrowCode lớn nhất hiện tại
//     const lastBorrow = await db
//       .collection("borrows")
//       .find()
//       .sort({ borrowCode: -1 })
//       .limit(1)
//       .toArray();
//     let nextBorrowCode = "MUON001"; // Giá trị mặc định nếu chưa có bản ghi nào
//     if (lastBorrow.length > 0) {
//       const lastCode = lastBorrow[0].borrowCode; // Lấy borrowCode cuối cùng
//       const lastNumber = parseInt(lastCode.replace("MUON", ""), 10); // Loại bỏ "MUON" và chuyển thành số
//       nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`; // Tăng giá trị và định dạng lại
//     }

//     // Lưu thông tin mượn sách vào bảng borrow
//     const borrow = {
//       borrowCode: nextBorrowCode,
//       member: new ObjectId(String(member._id)),
//       borrowDate: new Date(),
//       bookId: new ObjectId(String(bookId)),
//       expectedReturnDate: new Date(
//         new Date().setDate(new Date().getDate() + 60)
//       ),
//       is_fine_paid: false,
//       status: "Pending",
//       renewCount: 0,
//     };
//     const result = await db.collection("borrows").insertOne(borrow);
//     // Trả về kết quả
//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }

export async function POST(req) {
  try {
    const { bookId, userId, returnDate } = await req.json();
    const { db } = await connectToDatabase();

    // 1. Kiểm tra sách tồn tại
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(String(bookId)) });
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    // 2. Kiểm tra số lượng sách còn lại
    if (book.availableQuantity <= 0) {
      return new Response(JSON.stringify({ error: "Book is not available" }), {
        status: 400,
      });
    }

    // 3. Kiểm tra thành viên tồn tại
    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(String(userId)) });
    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // 4. Không cho mượn lại sách nếu đã mượn (Pending/Borrowed)
    const existingBorrow = await db.collection("borrows").findOne({
      member: member._id,
      bookId: new ObjectId(String(bookId)),
      status: { $in: ["Pending", "Borrowed"] },
    });
    if (existingBorrow) {
      return new Response(
        JSON.stringify({ error: "User has already borrowed this book" }),
        { status: 400 }
      );
    }

    // 5. Không cho mượn nếu còn sách quá hạn
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        member: member._id,
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      return new Response(
        JSON.stringify({ error: "User has overdue borrows" }),
        { status: 400 }
      );
    }

    // 6. Cập nhật số lượng sách
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(String(bookId)) },
        { $inc: { borrowedCount: 1, availableQuantity: -1 } }
      );

    // 7. Sinh mã mượn tự động
    const lastBorrow = await db
      .collection("borrows")
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001";
    if (lastBorrow.length > 0) {
      const lastCode = lastBorrow[0].borrowCode;
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10);
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // 8. Lưu thông tin mượn sách
    const borrow = {
      borrowCode: nextBorrowCode,
      member: new ObjectId(String(member._id)),
      borrowDate: new Date(),
      bookId: new ObjectId(String(bookId)),
      expectedReturnDate: new Date(
        new Date().setDate(new Date().getDate() + 60)
      ),
      is_fine_paid: false,
      status: "Pending",
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);

    // Get the newly created borrow object
    const newBorrow = await db
      .collection("borrows")
      .findOne({ _id: result.insertedId });

    return new Response(JSON.stringify({ success: true, data: newBorrow }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

}






import { connectToDatabase } from "@/lib/dbConnect.js";
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






import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { message: "Missing book ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const ratings = db.collection("ratings");
    const members = db.collection("members");

    // Pipeline cho MongoDB aggregation
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          // Tính toán điểm trung bình
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          averageRating: 1, // Hiển thị điểm trung bình
          reviews: 1,
        },
      },
    ];

    const book = await books.aggregate(aggregatePipeline).toArray();

    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: book[0], message: "Book fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// POST: Đánh giá mới và trả về những đánh giá đã có
export async function POST(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const body = await request.json();
    const { rating, text, memberId } = body;

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // 👉 Gọi lại aggregation pipeline như trong GET
    const members = db.collection("members");
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },

                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          reviews: 1,
          averageRating: 1,
        },
      },
    ];

    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    return NextResponse.json(
      {
        success: true,
        data: updatedBook[0],
        message: "Review added and book updated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );

  }
}





import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     // Lấy dữ liệu từ request body
//     const { bookId, userId, returnDate } = await req.json();
//     // Kết nối đến cơ sở dữ liệu
//     const { db } = await connectToDatabase();

//     // Tìm sách theo ID
//     const book = await db
//       .collection("books")
//       .findOne({ _id: new ObjectId(String(bookId)) });
//     if (!book) {
//       console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Book not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra số lượng sách còn lại
//     if (book.availableQuantity <= 0) {
//       console.log("Book is not available with ID:", bookId);
//       return new Response(JSON.stringify({ error: "Book is not available" }), {
//         status: 400,
//       });
//     }

//     // Tìm thành viên theo ID tài khoản
//     const member = await db
//       .collection("members")
//       .findOne({ accountId: new ObjectId(String(userId)) });
//     if (!member) {
//       console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Member not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra xem người dùng đã mượn cuốn sách này chưa
//     const existingBorrow = await db.collection("borrows").findOne({
//       member: member._id,
//       bookId: new ObjectId(String(bookId)),
//       status: { $in: ["Pending", "Borrowed"] }, // Kiểm tra cả trạng thái "Pending" và "Borrowed"
//     });

//     if (existingBorrow) {
//       console.log("User has already borrowed this book");
//       return new Response(
//         JSON.stringify({ error: "User has already borrowed this book" }),
//         {
//           status: 400,
//         }
//       );
//     }

//     // Kiểm tra người dùng có sách quá hạn hay không
//     const overdueBorrows = await db
//       .collection("borrows")
//       .find({
//         member: member._id,
//         status: "Overdue",
//       })
//       .toArray();
//     if (overdueBorrows.length > 0) {
//       console.log("User has overdue borrows");
//       return new Response(
//         JSON.stringify({ error: "User has overdue borrows" }),
//         { status: 400 }
//       );
//     }

//     // Cập nhật số lượng sách đã mượn và số lượng sách còn lại
//     await db
//       .collection("books")
//       .updateOne(
//         { _id: new ObjectId(String(bookId)) },
//         { $inc: { borrowedCount: +1, availableQuantity: -1 } }
//       );

//     // Tìm borrowCode lớn nhất hiện tại
//     const lastBorrow = await db
//       .collection("borrows")
//       .find()
//       .sort({ borrowCode: -1 })
//       .limit(1)
//       .toArray();
//     let nextBorrowCode = "MUON001"; // Giá trị mặc định nếu chưa có bản ghi nào
//     if (lastBorrow.length > 0) {
//       const lastCode = lastBorrow[0].borrowCode; // Lấy borrowCode cuối cùng
//       const lastNumber = parseInt(lastCode.replace("MUON", ""), 10); // Loại bỏ "MUON" và chuyển thành số
//       nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`; // Tăng giá trị và định dạng lại
//     }

//     // Lưu thông tin mượn sách vào bảng borrow
//     const borrow = {
//       borrowCode: nextBorrowCode,
//       member: new ObjectId(String(member._id)),
//       borrowDate: new Date(),
//       bookId: new ObjectId(String(bookId)),
//       expectedReturnDate: new Date(
//         new Date().setDate(new Date().getDate() + 60)
//       ),
//       is_fine_paid: false,
//       status: "Pending",
//       renewCount: 0,
//     };
//     const result = await db.collection("borrows").insertOne(borrow);
//     // Trả về kết quả
//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }

export async function POST(req) {
  try {
    const { bookId, userId, returnDate } = await req.json();
    const { db } = await connectToDatabase();

    // 1. Kiểm tra sách tồn tại
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(String(bookId)) });
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    // 2. Kiểm tra số lượng sách còn lại
    if (book.availableQuantity <= 0) {
      return new Response(JSON.stringify({ error: "Book is not available" }), {
        status: 400,
      });
    }

    // 3. Kiểm tra thành viên tồn tại
    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(String(userId)) });
    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // 4. Không cho mượn lại sách nếu đã mượn (Pending/Borrowed)
    const existingBorrow = await db.collection("borrows").findOne({
      member: member._id,
      bookId: new ObjectId(String(bookId)),
      status: { $in: ["Pending", "Borrowed"] },
    });
    if (existingBorrow) {
      return new Response(
        JSON.stringify({ error: "User has already borrowed this book" }),
        { status: 400 }
      );
    }

    // 5. Không cho mượn nếu còn sách quá hạn
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        member: member._id,
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      return new Response(
        JSON.stringify({ error: "User has overdue borrows" }),
        { status: 400 }
      );
    }

    // 6. Cập nhật số lượng sách
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(String(bookId)) },
        { $inc: { borrowedCount: 1, availableQuantity: -1 } }
      );

    // 7. Sinh mã mượn tự động
    const lastBorrow = await db
      .collection("borrows")
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001";
    if (lastBorrow.length > 0) {
      const lastCode = lastBorrow[0].borrowCode;
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10);
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // 8. Lưu thông tin mượn sách
    const borrow = {
      borrowCode: nextBorrowCode,
      member: new ObjectId(String(member._id)),
      borrowDate: new Date(),
      bookId: new ObjectId(String(bookId)),
      expectedReturnDate: new Date(
        new Date().setDate(new Date().getDate() + 60)
      ),
      is_fine_paid: false,
      status: "Pending",
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);

    // Get the newly created borrow object
    const newBorrow = await db
      .collection("borrows")
      .findOne({ _id: result.insertedId });

    return new Response(JSON.stringify({ success: true, data: newBorrow }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

}






import { connectToDatabase } from "@/lib/dbConnect.js";
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






import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { message: "Missing book ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");
    const ratings = db.collection("ratings");
    const members = db.collection("members");

    // Pipeline cho MongoDB aggregation
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          // Tính toán điểm trung bình
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          averageRating: 1, // Hiển thị điểm trung bình
          reviews: 1,
        },
      },
    ];

    const book = await books.aggregate(aggregatePipeline).toArray();

    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: book[0], message: "Book fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// POST: Đánh giá mới và trả về những đánh giá đã có
export async function POST(request, { params }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const body = await request.json();
    const { rating, text, memberId } = body;

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      );
    }

    // 👉 Gọi lại aggregation pipeline như trong GET
    const members = db.collection("members");
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) },
      },

      {
        $lookup: {
          from: "members",
          localField: "reviews.memberId",
          foreignField: "_id",
          as: "memberInfo",
        },
      },

      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "review",
              in: {
                text: "$$review.text",
                rating: "$$review.rating",
                memberId: "$$review.memberId",
                createdAt: "$$review.createdAt",
                memberName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$memberInfo",
                            as: "member",
                            cond: {
                              $eq: ["$$member._id", "$$review.memberId"],
                            },
                          },
                        },
                        as: "member",
                        in: {
                          $concat: [
                            "$$member.firstName",
                            " ",
                            "$$member.lastName",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },

                memberImage: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$memberInfo",
                                as: "member",
                                cond: {
                                  $eq: ["$$member._id", "$$review.memberId"],
                                },
                              },
                            },
                            as: "member",
                            in: "$$member.avatar",
                          },
                        },
                        0,
                      ],
                    },
                    "/images/avatar.png",
                  ],
                },
              },
            },
          },
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          reviews: 1,
          averageRating: 1,
        },
      },
    ];

    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    return NextResponse.json(
      {
        success: true,
        data: updatedBook[0],
        message: "Review added and book updated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );

  }
}





