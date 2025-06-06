import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["member", "employee", "admin"],
      default: "member",
      required: true,
    },
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "role",
    },

    isVerified: { type: Boolean, default: false },

    verificationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    verificationTokenExpires: { type: Date },

    passwordResetToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    passwordResetTokenExpires: {
      type: Date,
    },
  },
  {
    collection: "accounts",
    timestamps: true,
  }
);

// AccountSchema.index({ verificationToken: 1 });

export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);
