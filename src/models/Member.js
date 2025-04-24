// import mongoose from "mongoose";

// const MemberSchema = new mongoose.Schema({
//   memberCode: { type: String, required: true, unique: true },
//   username: { type: String, required: true },                 // Ten_thanh_vien

//   firstName: { type: String, required: true },                // Ten
//   // middleName: { type: String },                               // Ten_dem
//   lastName: { type: String, required: true },                 // Ho

//   birthDate: { type: Date, required: true },                  // Ngay_sinh
//   // gender: { type: String, enum: ["Male", "Female", "Other"] },// Gioi_tinh
//   address: { type: String },                                  // Dia_chi
//   phone: { type: String },                                    // SDT

//   registeredAt: { type: Date, default: Date.now },            // Ngay_dang_ky

//   //Liên kết đến tài khoản người dùng
//     accountId: {type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true }

// }, { collection: "members", timestamps: true });

// // Virtual: Họ tên đầy đủ
// MemberSchema.virtual("fullName").get(function () {
//   return `${this.lastName} ${this.middleName || ""} ${this.firstName}`.trim();
// });

// export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {

    memberCode: { type: String, required: true, unique: true }, // Will be generated
    username: { type: String, required: true }, // Corresponds to Account username

    firstName: { type: String, required: true }, // From form
    // middleName: { type: String },                            // Not in form currently
    lastName: { type: String, required: true }, // From form's 'surname'

    birthDate: { type: Date, required: false }, // From form's 'dob' - making optional based on form validation
    // gender: { type: String, enum: ["Male", "Female", "Other"] },// Not in form
    address: { type: String }, // From form
    phone: { type: String }, // From form

    registeredAt: { type: Date, default: Date.now },

    // Liên kết đến tài khoản người dùng

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,

      unique: true,
    }, // Added unique constraint
  },
  { collection: "members", timestamps: true }
);

MemberSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.firstName}`.trim();
});

// Index for faster lookup by accountId if needed
MemberSchema.index({ accountId: 1 });

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
