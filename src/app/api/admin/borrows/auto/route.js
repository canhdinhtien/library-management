import { connectToDatabase } from "@/lib/dbConnect.js";

export async function POST() {
  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const finePerDay = 10000;
    const currentDate = new Date();

    // Tìm các bản ghi mượn sách đã quá hạn
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        status: "Borrowed",
        expectedReturnDate: { $lt: currentDate },
      })
      .toArray();
    if (!overdueBorrows || overdueBorrows.length === 0) {
      console.log("No overdue borrows found");
    }

    // Cập nhật trạng thái và tính tiền phạt, xóa borrow có borrow.status là Pending sau 3 ngày tính từ ngày mượn
    const pendingBorrows = await db
      .collection("borrows")
      .find({
        status: "Pending",
        borrowDate: {
          $lt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      })
      .toArray();
    console.log("Pending borrows:", pendingBorrows);
    // Tăng số lượng sách trong kho trước khi xóa các bản ghi mượn sách
    const bookIdsToUpdate = pendingBorrows.map((borrow) => borrow.bookId);
    const updateResult = await db
      .collection("books")
      .updateMany(
        { _id: { $in: bookIdsToUpdate } },
        { $inc: { availableQuantity: 1 } }
      );
    if (updateResult.modifiedCount > 0) {
      console.log(
        `Updated available quantity for ${updateResult.modifiedCount} books`
      );
    }
    if (pendingBorrows.length > 0) {
      // Xóa các bản ghi mượn sách có trạng thái "Pending" và đã quá 3 ngày
      const deleteResult = await db.collection("borrows").deleteMany({
        status: "Pending",
        borrowDate: {
          $lt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      });
      if (deleteResult.deletedCount > 0) {
        console.log(
          `Deleted ${deleteResult.deletedCount} pending borrows older than 3 days`
        );
      }
    }
    // Cập nhật trạng thái và tính tiền phạt cho các bản ghi mượn sách đã quá hạn
    const updates = overdueBorrows.map(async (borrow) => {
      const expectedReturnDate = new Date(borrow.expectedReturnDate);
      expectedReturnDate.setDate(expectedReturnDate.getDate() + 1);
      const overdueDays = Math.ceil(
        (currentDate - expectedReturnDate) / (1000 * 60 * 60 * 24)
      );
      const fine = overdueDays * finePerDay;

      await db
        .collection("borrows")
        .updateOne({ _id: borrow._id }, { $set: { status: "Overdue", fine } });
    });

    await Promise.all(updates);

    return new Response(
      JSON.stringify({
        message: "Overdue and pending borrows updated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating overdue borrows:", error);

    return new Response(
      JSON.stringify({ error: "Failed to update overdue borrows" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
