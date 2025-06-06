import mongoose from "mongoose";
import Book from "./Book.js"; // Đảm bảo model Book được import

const BorrowSchema = new mongoose.Schema(
  {
    borrowCode: { type: String, required: true, unique: true }, // Ma_muon

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    }, // liên kết tới thành viên
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // nếu cần ghi nhận nhân viên xử lý
    borrowDate: { type: Date, required: true }, // Ngay_muon

    status: {
      type: String,
      enum: ["Pending", "Borrowed", "Returned", "Overdue"],
      default: "Pending",
    }, // Trang_thai
    fine: { type: Number, default: 0 }, // Phi_phat
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    }, // Ma_sach
    renewCount: { type: Number, default: 0 }, // Số lần gia hạn
    expectedReturnDate: { type: Date, required: true }, // Ngay_tra_du_kien
    is_fine_paid: { type: Boolean, default: false }, // Đã thanh toán phí phạt
    returnDate: { type: Date }, // Ngày trả thực tế
    userRating: { type: Number, default: 0 },
  },
  {
    collection: "borrows",
    timestamps: true,
  }
);

export default mongoose.models.Borrow || mongoose.model("Borrow", BorrowSchema);
