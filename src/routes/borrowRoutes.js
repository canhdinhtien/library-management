import express from "express";
import { getUserBorrowedBooks } from "../controllers/borrowController.js";
import { renewBook } from "../controllers/borrowController.js";

const router = express.Router();

router.get("/:memberId", getUserBorrowedBooks); // Lấy danh sách sách mượn của người dùng
router.post("/:borrowId/renew/:bookId", renewBook); // Gia hạn thời gian mượn sách

export default router;
