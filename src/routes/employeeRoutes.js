import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// Định nghĩa các route
router.post("/", createEmployee); // Tạo nhân viên
router.get("/", getEmployees); // Lấy danh sách nhân viên
router.get("/:id", getEmployeeById); // Lấy thông tin chi tiết nhân viên
router.put("/:id", updateEmployee); // Cập nhật nhân viên
router.delete("/:id", deleteEmployee); // Xóa nhân viên

export default router;
