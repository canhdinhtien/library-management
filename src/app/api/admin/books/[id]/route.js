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
