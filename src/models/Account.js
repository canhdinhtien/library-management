import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["member", "employee"], required: true },
  ref: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "role" }
}, {
  collection: "accounts",
  timestamps: true
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
