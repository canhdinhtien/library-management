import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/dbConnect.js"; // Đường dẫn đến tệp kết nối cơ sở dữ liệu của bạn
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const updateData = await req.json();
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const borrowRecord = await borrowsCollection.findOne({
      _id: new ObjectId(id),
    });

    // Loại bỏ trường _id nếu tồn tại trong updateData
    if (updateData._id) {
      delete updateData._id;
    }
    // Đổi ngày tháng năm về định dạng ISO
    if (updateData.expectedReturnDate) {
      updateData.expectedReturnDate = new Date(updateData.expectedReturnDate);
    }
    if (updateData.returnDate) {
      updateData.returnDate = new Date(updateData.returnDate);
    }
    if (updateData.borrowDate) {
      updateData.borrowDate = new Date(updateData.borrowDate);
    }

    if (
      updateData.status === "Returned" &&
      borrowRecord.status !== "Returned"
    ) {
      const bookUpdate = await db
        .collection("books")
        .updateOne(
          { title: updateData.bookTitle },
          { $inc: { availableQuantity: 1 } }
        );
      if (bookUpdate.modifiedCount === 0) {
        throw new Error("Failed to update book record");
      }
    }

    // Cập nhật thông tin thành viên
    const updateResult = await borrowsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update borrow record");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating borrow record:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const borrowRecord = await borrowsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!borrowRecord) {
      throw new Error("Borrow record not found");
    }
    // Cập nhật số lượng sách có sẵn
    if (borrowRecord.status !== "Returned") {
      const bookUpdate = await db
        .collection("books")
        .updateOne(
          { _id: new ObjectId(borrowRecord.bookId) },
          { $inc: { availableQuantity: 1 } }
        );
      if (bookUpdate.modifiedCount === 0) {
        throw new Error("Failed to update book record");
      }
    }

    // Xóa bản ghi mượn sách
    const deleteResult = await borrowsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      throw new Error("Failed to delete borrow record");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting borrow record:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
