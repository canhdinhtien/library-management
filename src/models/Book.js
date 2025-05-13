import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    coverImage: { type: String, required: true },
    bookCode: { type: String, required: true, unique: true }, // Ma_sach
    title: { type: String, required: true }, // Ten_sach
    genres: { type: String, required: true }, // The_loai
    description: { type: String }, // Mo_ta
    price: { type: Number, required: true }, // Gia
    quantity: { type: Number, required: true }, // So_luong
    availableQuantity: { type: Number, required: true }, // So_luong_con_lai
    borrowedCount: { type: Number, default: 0 }, // So_luong_da_muon
    reviews: [
      {
        text: {
          type: String,
        },
        rating: { type: Number, min: 1, max: 5 },
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        }, // ma_thanh_vien
        createdAt: { type: Date }, // Ngay_tao_danh_gia
      },
    ], // Review
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    }, // ma_tacgia
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    }, // Ma_NXB
  },
  { collection: "books" }
);
export default mongoose.models.Book || mongoose.model("Book", BookSchema);
