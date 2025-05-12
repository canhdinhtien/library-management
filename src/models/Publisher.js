import mongoose from "mongoose";

const PublisherSchema = new mongoose.Schema(
  {
    publisherCode: { type: String, required: true, unique: true }, // Ma_NXB
    name: { type: String, required: true }, // Ten_NXB
    address: { type: String }, // Dia_chi
    phone: { type: String }, // SDT

    booksPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // Sách đã phát hành
    authorsCollaborated: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
    ], // Tác giả đã hợp tác
  },
  { collection: "publishers" }
);

export default mongoose.models.Publisher ||
  mongoose.model("Publisher", PublisherSchema);
