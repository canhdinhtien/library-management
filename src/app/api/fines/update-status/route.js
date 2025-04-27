import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

async function updateBookStatus(bookId, userId) {
  if (!bookId || !userId) {
    throw new Error("Book ID and User ID are required");
  }
  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const borrowCollection = db.collection("borrows");
    const memberCollection = db.collection("members");

    const member = await memberCollection.findOne({
      accountId: new ObjectId(userId),
    });

    const borrows = await borrowCollection
      .find({ member: member._id })
      .toArray();
    if (!borrows) {
      throw new Error("Borrow record not found");
    }
    console.log("Borrow record found:", borrows);

    for (const borrow of borrows) {
      let isUpdated = false;
      for (const book of borrow.books) {
        console.log("Checking book.book:", book.book);
        console.log("Checking bookId:", bookId);
        if (book.book.equals(new ObjectId(bookId))) {
          book.is_fine_paid = true;
          isUpdated = true;
        }
        if (isUpdated) {
          const result = await borrowCollection.updateOne(
            { _id: new ObjectId(borrow._id) },
            { $set: { books: borrow.books, updatedAt: new Date() } }
          );
          if (result.modifiedCount === 0) {
            throw new Error("Failed to update borrow record");
          }
        }
      }
    }

    return {
      success: true,
      message: "Book status updated successfully",
    };
  } catch (error) {
    console.error("Error updating book status:", error);
    throw new Error("Failed to update book status");
  }
}

export async function POST(request) {
  try {
    // Kết nối đến cơ sở dữ liệu
    await connectToDatabase();
    const { bookId, userId } = await request.json();
    const result = await updateBookStatus(bookId, userId);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
