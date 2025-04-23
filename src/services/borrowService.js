import mongoose from "mongoose";
import Borrow from "../models/Borrow.js";
import Book from "../models/Book.js"; // Đảm bảo model Book được import
import Author from "../models/Author.js"; // Đảm bảo model Author được import
import dbConnect from "../lib/dbConnect.js";
import { populate } from "dotenv";

export const getUserBorrowedBooks = async (memberId) => {
  try {
    // Kiểm tra nếu memberId không hợp lệ
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error("Invalid memberId");
    }
    const ObjectId = new mongoose.Types.ObjectId(String(memberId));
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    // Lấy tất cả các bản ghi trong collection Borrow
    const borrowedBooks = await Borrow.find({ member: ObjectId })
      .populate({
        path: "books.book",
        model: "Book",
        populate: {
          path: "author",
          model: "Author",
          select: "name",
        },
      })
      .exec();
    console.log("Borrowed books without populate:", borrowedBooks);
    return borrowedBooks;
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    throw new Error("Error fetching borrowed books");
  }
};

export const renewBook = async (borrowId, bookId, newDueDate) => {
  try {
    console.log("Renewing book with ID:", bookId);
    console.log("New due date:", newDueDate);
    console.log("Borrow ID:", borrowId);

    // Tìm bản ghi mượn sách
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      console.log("Borrow record not found");
      return { message: "Borrow record not found" };
    }
    const bookToRenew = borrow.books.find(
      (book) => book.book.toString() === bookId
    );
    console.log("Book to renew:", bookToRenew);
    if (!borrow) {
      console.log("Borrow record not found");
      return res.status(404).json({ message: "Borrow record not found" });
    }
    if (!bookToRenew) {
      console.log("Book not found in borrow record");
      return res
        .status(404)
        .json({ message: "Book not found in borrow record" });
    }
    // Cập nhật ngày trả dự kiến
    borrow.expectedReturnDate = new Date(newDueDate);
    // Tăng số lần gia hạn lên 1
    bookToRenew.renewCount += 1;

    await borrow.save();
    return borrow;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
