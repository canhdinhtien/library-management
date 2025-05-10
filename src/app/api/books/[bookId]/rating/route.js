import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy chi tiết sách kèm đánh giá và thông tin liên quan
export async function GET(request, { params }) {
  // Lấy ID sách từ params
  const { bookId } = params;

  // Kiểm tra xem có ID sách không
  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    // Kết nối đến cơ sở dữ liệu
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

    // Lấy thông tin sách
    const book = await books.aggregate(aggregatePipeline).toArray();

    // Kiểm tra xem có tìm thấy sách không
    if (!book || book.length === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    // Trả về thông tin sách
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
  // Lấy ID sách từ params
  const { bookId } = params;

  // Kiểm tra xem có ID sách không
  if (!bookId) {
    return NextResponse.json({ message: "Missing book ID" }, { status: 400 });
  }

  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    // Lấy dữ liệu từ request body
    const body = await request.json();
    const { rating, text, memberId } = body;

    // Kiểm tra dữ liệu đầu vào
    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      !text ||
      !memberId
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Tạo đánh giá mới
    const newReview = {
      rating,
      text,
      memberId: new ObjectId(memberId),
      createdAt: new Date(),
    };

    // Cập nhật thông tin sách
    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $push: { reviews: newReview } }
    );

    // Kiểm tra xem có cập nhật được không
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
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

    // Lấy thông tin sách đã cập nhật
    const updatedBook = await books.aggregate(aggregatePipeline).toArray();

    // Trả về thông tin sách đã cập nhật
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
