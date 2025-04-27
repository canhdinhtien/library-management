// Renew a book
import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request, { params }) {
  const { bookId } = await params;

  if (!JWT_SECRET) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server configuration error.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Authorization header missing or invalid.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const token = authHeader.split(" ")[1];
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    console.log("Decoded token:", decoded);
  } catch (error) {
    console.error("JWT verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid token payload.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");
    const borrowsCollection = db.collection("borrows");
    const membersCollection = db.collection("members");

    // Tìm memberId của người dùng
    const member = await membersCollection.findOne({
      accountId: new ObjectId(userId),
    });
    if (!member) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Member not found.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const memberId = member._id;

    // Tìm bản ghi mượn sách
    const borrowRecord = await borrowsCollection.findOne({
      "books.book": new ObjectId(bookId),
      member: new ObjectId(memberId),
      returnDate: null,
    });
    console.log("UserId: ", userId);

    if (!borrowRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Borrow record not found or book already returned.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const bookToRenew = borrowRecord.books.find(
      (book) => book.book.toString() === bookId
    );
    console.log("Book to renew: ", bookToRenew);

    if (!bookToRenew) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Book not found in borrow record.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (bookToRenew.renewCount >= 2) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Maximum renewals reached.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cập nhật thời gian trả sách và tăng số lần đã gia hạn
    const newExpectedReturnDate = new Date(bookToRenew.expectedReturnDate);
    newExpectedReturnDate.setDate(newExpectedReturnDate.getDate() + 7); // Gia hạn thêm 7 ngày
    bookToRenew.renewCount += 1;

    const updateResult = await borrowsCollection.updateOne(
      {
        _id: borrowRecord._id,
        "books.book": new ObjectId(bookId),
        member: new ObjectId(memberId),
        returnDate: null,
      },
      {
        $set: {
          "books.$.expectedReturnDate": newExpectedReturnDate,
          "books.$.renewCount": bookToRenew.renewCount,
        },
      }
    );
    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to renew the book.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Book renewed successfully.",
        newExpectedReturnDate,
        renewalsLeft: bookToRenew.renewalsLeft - 1,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error renewing book:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Book renewed successfully." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
