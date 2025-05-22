import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";

// export async function POST(req) {
//   try {
//     // Lấy dữ liệu từ request body
//     const { bookId, userId, returnDate } = await req.json();
//     // Kết nối đến cơ sở dữ liệu
//     const { db } = await connectToDatabase();

//     // Tìm sách theo ID
//     const book = await db
//       .collection("books")
//       .findOne({ _id: new ObjectId(String(bookId)) });
//     if (!book) {
//       console.log("Book not found with ID:", bookId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Book not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra số lượng sách còn lại
//     if (book.availableQuantity <= 0) {
//       console.log("Book is not available with ID:", bookId);
//       return new Response(JSON.stringify({ error: "Book is not available" }), {
//         status: 400,
//       });
//     }

//     // Tìm thành viên theo ID tài khoản
//     const member = await db
//       .collection("members")
//       .findOne({ accountId: new ObjectId(String(userId)) });
//     if (!member) {
//       console.log("Member not found with accountId:", userId); // Log thông tin chi tiết
//       return new Response(JSON.stringify({ error: "Member not found" }), {
//         status: 404,
//       });
//     }

//     // Kiểm tra xem người dùng đã mượn cuốn sách này chưa
//     const existingBorrow = await db.collection("borrows").findOne({
//       member: member._id,
//       bookId: new ObjectId(String(bookId)),
//       status: { $in: ["Pending", "Borrowed"] }, // Kiểm tra cả trạng thái "Pending" và "Borrowed"
//     });

//     if (existingBorrow) {
//       console.log("User has already borrowed this book");
//       return new Response(
//         JSON.stringify({ error: "User has already borrowed this book" }),
//         {
//           status: 400,
//         }
//       );
//     }

//     // Kiểm tra người dùng có sách quá hạn hay không
//     const overdueBorrows = await db
//       .collection("borrows")
//       .find({
//         member: member._id,
//         status: "Overdue",
//       })
//       .toArray();
//     if (overdueBorrows.length > 0) {
//       console.log("User has overdue borrows");
//       return new Response(
//         JSON.stringify({ error: "User has overdue borrows" }),
//         { status: 400 }
//       );
//     }

//     // Cập nhật số lượng sách đã mượn và số lượng sách còn lại
//     await db
//       .collection("books")
//       .updateOne(
//         { _id: new ObjectId(String(bookId)) },
//         { $inc: { borrowedCount: +1, availableQuantity: -1 } }
//       );

//     // Tìm borrowCode lớn nhất hiện tại
//     const lastBorrow = await db
//       .collection("borrows")
//       .find()
//       .sort({ borrowCode: -1 })
//       .limit(1)
//       .toArray();
//     let nextBorrowCode = "MUON001"; // Giá trị mặc định nếu chưa có bản ghi nào
//     if (lastBorrow.length > 0) {
//       const lastCode = lastBorrow[0].borrowCode; // Lấy borrowCode cuối cùng
//       const lastNumber = parseInt(lastCode.replace("MUON", ""), 10); // Loại bỏ "MUON" và chuyển thành số
//       nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`; // Tăng giá trị và định dạng lại
//     }

//     // Lưu thông tin mượn sách vào bảng borrow
//     const borrow = {
//       borrowCode: nextBorrowCode,
//       member: new ObjectId(String(member._id)),
//       borrowDate: new Date(),
//       bookId: new ObjectId(String(bookId)),
//       expectedReturnDate: new Date(
//         new Date().setDate(new Date().getDate() + 60)
//       ),
//       is_fine_paid: false,
//       status: "Pending",
//       renewCount: 0,
//     };
//     const result = await db.collection("borrows").insertOne(borrow);
//     // Trả về kết quả
//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST /api/borrow:", error); // Log lỗi chi tiết
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }

export async function POST(req) {
  try {
    const { bookId, userId, returnDate } = await req.json();
    const { db } = await connectToDatabase();

    // 1. Kiểm tra sách tồn tại
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(String(bookId)) });
    if (!book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    // 2. Kiểm tra số lượng sách còn lại
    if (book.availableQuantity <= 0) {
      return new Response(JSON.stringify({ error: "Book is not available" }), {
        status: 400,
      });
    }

    // 3. Kiểm tra thành viên tồn tại
    const member = await db
      .collection("members")
      .findOne({ accountId: new ObjectId(String(userId)) });
    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
      });
    }

    // 4. Không cho mượn lại sách nếu đã mượn (Pending/Borrowed)
    const existingBorrow = await db.collection("borrows").findOne({
      member: member._id,
      bookId: new ObjectId(String(bookId)),
      status: { $in: ["Pending", "Borrowed"] },
    });
    if (existingBorrow) {
      return new Response(
        JSON.stringify({ error: "User has already borrowed this book" }),
        { status: 400 }
      );
    }

    // 5. Không cho mượn nếu còn sách quá hạn
    const overdueBorrows = await db
      .collection("borrows")
      .find({
        member: member._id,
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      return new Response(
        JSON.stringify({ error: "User has overdue borrows" }),
        { status: 400 }
      );
    }

    // 6. Cập nhật số lượng sách
    await db
      .collection("books")
      .updateOne(
        { _id: new ObjectId(String(bookId)) },
        { $inc: { borrowedCount: 1, availableQuantity: -1 } }
      );

    // 7. Sinh mã mượn tự động
    const lastBorrow = await db
      .collection("borrows")
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001";
    if (lastBorrow.length > 0) {
      const lastCode = lastBorrow[0].borrowCode;
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10);
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // 8. Lưu thông tin mượn sách
    const borrow = {
      borrowCode: nextBorrowCode,
      member: new ObjectId(String(member._id)),
      borrowDate: new Date(),
      bookId: new ObjectId(String(bookId)),
      expectedReturnDate: new Date(
        new Date().setDate(new Date().getDate() + 60)
      ),
      is_fine_paid: false,
      status: "Pending",
      renewCount: 0,
    };
    const result = await db.collection("borrows").insertOne(borrow);

    // Get the newly created borrow object
    const newBorrow = await db
      .collection("borrows")
      .findOne({ _id: result.insertedId });

    return new Response(JSON.stringify({ success: true, data: newBorrow }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in POST /api/borrow:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

}






