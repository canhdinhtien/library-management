import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    memberCode: { type: String, required: true, unique: true },
    username: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    avatar: { type: String },

    birthDate: { type: Date, required: false },
    address: { type: String },
    phone: { type: String },

    registeredAt: { type: Date, default: Date.now },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,

      unique: true,
    },
  },
  { collection: "members", timestamps: true }
);

MemberSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.firstName}`.trim();
});

MemberSchema.index({ accountId: 1 });

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
