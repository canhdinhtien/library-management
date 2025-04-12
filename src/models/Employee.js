import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true }, // Ma_NV

    firstName: { type: String, required: true }, // Ten
    middleName: { type: String }, // Ten_dem
    lastName: { type: String, required: true }, // Ho

    birthDate: { type: Date, required: true }, // Ngay_sinh
    gender: { type: String, enum: ["Male", "Female", "Other"] }, // Gioi_tinh
    salary: { type: Number }, // Luong
    position: { type: String }, // Chuc_vu

    phone: { type: String },
    email: { type: String },
    address: { type: String },

    // Nhân viên phụ trách (liên kết đến chính Employee)
    inChargeBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // Liên kết đến tài khoản
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { collection: "employees", timestamps: true }
);

// Virtual: Họ tên đầy đủ
EmployeeSchema.virtual("fullName").get(function () {
  return `${this.lastName} ${this.middleName || ""} ${this.firstName}`.trim();
});

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
