import Borrow from "../models/Borrow.js";
import Author from "../models/Author.js";

export const getUserBorrowedBooks = async (req, res) => {
  try {
    const memberId = req.params.memberIdId;
    const borrowedBooks = await Borrow.find({ memberId })
      .populate({
        path: "books.book",
        populate: {
          path: "author",
          model: "Author",
        },
      })
      .exec();
    res.status(200).json(borrowedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renewBook = async (req, res) => {
  try {
    const { borrowId, bookId } = req.params;
    const { newDueDate } = req.body;

    console.log("Renewing book with ID:", bookId);
    console.log("New due date:", newDueDate);
    console.log("Borrow ID:", borrowId);

    // Tìm bản ghi mượn sách
    const borrow = await Borrow.findById(borrowId);
    const bookToRenew = borrow.books.find(
      (book) => book.book.toString() === bookId
    );
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
    res.status(200).json({ message: "Due date updated successfully", borrow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
