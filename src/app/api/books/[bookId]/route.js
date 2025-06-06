import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // Lấy ID sách từ params
  const { bookId } = await params;
  console.log("Book ID:", bookId); // Log the bookId to check if it's being received correctly

  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    // Xây dựng aggregate pipeline
    const aggregatePipeline = [
      {
        $match: { _id: new ObjectId(bookId) }, // Tìm sách theo ID
      },
      {
        $lookup: {
          from: "authors", // Liên kết với collection "authors"
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $unwind: "$authorInfo", // Giải nén mảng "authorInfo" thành đối tượng
      },
      {
        $lookup: {
          from: "publishers", // Liên kết với collection "publishers"
          localField: "publisher",
          foreignField: "_id",
          as: "publisherInfo",
        },
      },
      {
        $unwind: "$publisherInfo", // Giải nén mảng "publisherInfo" thành đối tượng
      },
      {
        $lookup: {
          from: "members", // Liên kết với collection "members"
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
        },
      },
      {
        $project: {
          _id: 1, // Loại bỏ trường `_id` khỏi kết quả
          title: 1,
          description: 1,
          reviews: 1,
          rating: 1,
          coverImage: 1,
          authorName: "$authorInfo.name", // Lấy tên tác giả từ "authorInfo"
          authorBio: "$authorInfo.bio", // Lấy tiểu sử tác giả từ "authorInfo"
          authorImage: "$authorInfo.image", // Lấy hình ảnh tác giả từ "authorInfo"
          publisher: "$publisherInfo.name", // Lấy tên nhà xuất bản từ "publisherInfo"
          publishedDate: 1,
          availableQuantity: 1,
          genres: 1,
        },
      },
    ];

    // Lấy thông tin sách
    const book = await books.aggregate(aggregatePipeline).toArray(); // Thực hiện truy vấn và chuyển đổi kết quả thành mảng
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
export async function PUT(request, { params }) {
  // Lấy ID sách từ params
  const { bookId } = await params;
  // Lấy dữ liệu cập nhật từ request body
  const updateData = await request.json();

  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    // Cập nhật thông tin sách
    const result = await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $set: updateData }
    );

    // Kiểm tra xem có cập nhật được không
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Book not found" },
        { status: 404 }
      );
    }

    // Trả về thông báo thành công
    return NextResponse.json(
      { success: true, message: "Book updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
