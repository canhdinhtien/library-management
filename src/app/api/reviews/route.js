import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    // Lấy dữ liệu từ request body
    const body = await request.json();
    console.log("Request body:", body); // Log the request body to check its content
    const { bookID, selectedRating, reviewText, userId } = body;

    const booksCollection = db.collection("books");
    const membersCollection = db.collection("members");

    // Tìm thành viên dựa trên accountId
    const member = await membersCollection.findOne({
      accountId: new ObjectId(userId),
    });

    // Kiểm tra nếu không tìm thấy thành viên
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 }
      );
    }

    // Thêm review vào sách
    await booksCollection.updateOne(
      { _id: new ObjectId(bookID) },
      {
        $push: {
          reviews: {
            memberId: member._id,
            rating: selectedRating,
            text: reviewText,
            createdAt: new Date(),
          },
        },
      }
    );

    // Trả về thông báo thành công
    return NextResponse.json(
      { success: true, message: "Review added successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review." },
      { status: 500 }
    );
  }
}
