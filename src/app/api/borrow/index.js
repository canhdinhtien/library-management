// import generateBorrowCode from "../../../lib/generateBorrowCode";
// import Borrow from "../../../models/Borrow.js";
// import Book from "../../../models/Book.js";
// import Member from "../../../models/Member.js";

// export default async function handler(req, res) {
//   // Kiểm tra method của request
//   if (req.method === "POST") {
//     try {
//       // Lấy dữ liệu từ request body
//       const { member, employee, books } = req.body;

//       // Tạo mã mượn sách
//       const borrowCode = await generateBorrowCode(); // bạn phải import hoặc viết hàm generateBorrowCode nhé
//       //reply: Mình viết ở lib lâu rồi á :Đ

//       // Kiểm tra xem có dữ liệu bắt buộc không
//       if (!member || !books) {
//         return res.status(400).json({ message: "Missing required fields" });
//       }

//       // Kiểm tra xem member có tồn tại không
//       const memberExists = await Member.findById(member);
//       if (!memberExists) {
//         return res.status(404).json({ message: "Member not found" });
//       }

//       // Kiểm tra xem sách có tồn tại không và số lượng có đủ không
//       for (let item of books) {
//         const book = await Book.findById(item.book);
//         if (!book) {
//           return res
//             .status(404)
//             .json({ message: `Book with ID ${item.book} not found` });
//         }

//         if (book.quantity < item.quantity) {
//           return res
//             .status(400)
//             .json({ message: `Not enough copies of ${book.title} available` });
//         }
//       }

//       // Tạo bản ghi mượn sách mới
//       const newBorrow = new Borrow({ borrowCode, member, employee, books });
//       const savedBorrow = await newBorrow.save();

//       // Cập nhật số lượng sách
//       for (let item of books) {
//         const book = await Book.findById(item.book);
//         book.quantity -= item.quantity;
//         await book.save();
//       }

//       // Trả về bản ghi mượn sách đã lưu
//       return res.status(201).json(savedBorrow);
//     } catch (err) {
//       return res
//         .status(500)
//         .json({ message: "Error borrowing books", error: err.message });
//     }
//   } else {
//     // Nếu không phải POST method
//     return res.status(405).json({ message: "Method not allowed" });
//   }
// }
