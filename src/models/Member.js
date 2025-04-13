import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    memberCode: { type: String, required: true, unique: true }, // Ma_thanh_vien
    username: { type: String, required: true }, // Ten_thanh_vien

    firstName: { type: String /*required: true*/ }, // Ten
    middleName: { type: String }, // Ten_dem
    lastName: { type: String /*required: true*/ }, // Ho

    birthDate: { type: Date /*required: true*/ }, // Ngay_sinh
    gender: { type: String, enum: ["Male", "Female", "Other"] }, // Gioi_tinh
    address: { type: String }, // Dia_chi
    phone: { type: String }, // SDT

    registeredAt: { type: Date, default: Date.now }, // Ngay_dang_ky

    //Liên kết đến tài khoản người dùng
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { collection: "members", timestamps: true }
);

// Virtual: Họ tên đầy đủ
MemberSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.middleName || ""} ${this.firstName}`.trim();
});

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
