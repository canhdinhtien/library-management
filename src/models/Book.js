import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  coverImage: { type: String, required: true },                     // Bia_sach
  bookCode: { type: String, required: true, unique: true },         // Ma_sach
  title: { type: String, required: true },                          // Ten_sach
  category: { type: String, required: true },                       // The_loai
  price: { type: Number, required: true },                          // Gia
  quantity: { type: Number, required: true },                       // So_luong
  borrowedCount: { type: Number, default: 0 },                      // So_luong_da_muon
  rating: { type: Number, min: 0, max: 5 },                         // Rating
  numberOfRating: { type: Number, default: 0},                      // So_rate
  reviews: [{ type: String }],                                      // Review
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },  // ma_tacgia
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: "Publisher", required: true } // Ma_NXB
}, { collection: "books" });

export default mongoose.models.Book || mongoose.model("Book", BookSchema);