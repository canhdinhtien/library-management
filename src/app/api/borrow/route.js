import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { bookId, userId, quantity, returnDate } = await req.json();
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }
    if (book.quantity < quantity) {
      return new Response(
        JSON.stringify({ error: "Not enough books available" }),
        { status: 400 }
      );
    }

    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(userId) });
    if (!member) {
      console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }
    await db
      .collection("books")
      .updateOne({ _id: bookId }, { $inc: { borrowedCount: +quantity } });

    // Tìm borrowCode lớn nhất hiện tại
    const lastBorrow = await db
      .collection("borrows")
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001"; // Giá trị mặc định nếu chưa có bản ghi nào
    if (lastBorrow.length > 0) {
      const lastCode = lastBorrow[0].borrowCode; // Lấy borrowCode cuối cùng
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10); // Loại bỏ "MUON" và chuyển thành số
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`; // Tăng giá trị và định dạng lại
    }

    // Lưu thông tin mượn sách vào bảng borrow
    const borrow = {
      borrowCode: nextBorrowCode,
      member: new ObjectId(member._id),
      borrowDate: new Date(),
      status: "Borrowed",
      bookId: new ObjectId(bookId),
      quantity,
      expectedReturnDate: new Date(returnDate),
      is_fine_paid: false,
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
