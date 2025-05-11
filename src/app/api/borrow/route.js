import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    // Lấy dữ liệu từ request body
    const { bookId, userId, returnDate } = await req.json();
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    // Tìm sách theo ID
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    // Tìm thành viên theo ID tài khoản
    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(userId) });
    if (!member) {
      console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // Kiểm tra người dùng có sách quá hạn hay không
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        member: new ObjectId(member._id),
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      console.log("User has overdue borrows"); // Log thông tin chi tiết
      return new Response(
        JSON.stringify({ error: "User has overdue borrows" }),
        { status: 400 }
      );
    }

    // Cập nhật số lượng sách đã mượn và số lượng sách còn lại
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(bookId) },
        { $inc: { borrowedCount: +1, availableQuantity: -1 } }
      );

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
      bookId: new ObjectId(bookId),
      expectedReturnDate: new Date(returnDate),
      is_fine_paid: false,
      status: "Pending",
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);
    // Trả về kết quả
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
