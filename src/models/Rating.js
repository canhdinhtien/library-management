import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true }, // Người đánh giá
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },     // Sách được đánh giá

  rating: { type: Number, min: 1, max: 5, required: true },                        // Số sao (1-5)
  comment: { type: String },                                                      // Nhận xét (tuỳ chọn)
  
  ratedAt: { type: Date, default: Date.now }                                       // Ngày đánh giá
}, {
  collection: "ratings",
  timestamps: true
});

RatingSchema.index({ member: 1, book: 1 }, { unique: true });
export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
