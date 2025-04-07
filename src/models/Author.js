import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
  authorCode: { type: String, required: true, unique: true },  // Ma_TG
  name: { type: String, required: true },                      // Ten
  gender: { type: String, enum: ["Male", "Female", "Other"] }, // Gioi_tinh
  birthYear: { type: Number, required: true },                 // Nam_sinh
  deathYear: { type: Number },                                 // Nam_mat
  booksPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // Các sách đã xuất bản
  coopPublisher: { type: mongoose.Schema.Types.ObjectId, ref: "Publisher", required: true } // Ma_NXB hợp tác
}, { collection: "authors" });

export default mongoose.models.Author || mongoose.model("Author", AuthorSchema);
