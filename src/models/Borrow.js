import mongoose from "mongoose";

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
    expectedReturnDate: { type: Date, required: true }, // Ngay_tra_du_kien
    returnDate: { type: Date }, // Ngay_tra

    status: {
      type: String,
      enum: ["Borrowed", "Returned", "Overdue"],
      default: "Borrowed",
    }, // Trang_thai
    fine: { type: Number, default: 0 }, // Phi_phat

    books: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  {
    collection: "borrows",
    timestamps: true,
  }
);

export default mongoose.models.Borrow || mongoose.model("Borrow", BorrowSchema);
