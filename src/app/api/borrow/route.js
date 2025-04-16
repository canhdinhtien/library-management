import express from "express";
import Borrow from "../models/Borrow.js";
import Book from "../models/Book.js";
import Member from "../models/Member.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {member, employee, books } = req.body;

    const borrowCode = await generateBorrowCode();

    if (!member || !book) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const memberExists = await Member.findById(member);
    if (!memberExists) {
      return res.status(404).json({ message: "Member not found" });
    }

    for (let item of books) {
        const book = await Book.findById(item.book);
        if (!book) {
          return res.status(404).json({ message: `Book with ID ${item.book} not found` });
        }
  
        if (book.quantity < item.quantity) {
          return res.status(400).json({ message: `Not enough copies of ${book.title} available` });
        }
    }  
    
    const newBorrow = new Borrow({borrowCode, member, employee, books});
    const savedBorrow = await newBorrow.save();

    //Cajp nhat
    for (let item of books) {
        const book = await Book.findById(item.book);
        book.quantity -= item.quantity;  // Giảm số lượng sách
        await book.save();
      }
      res.status(201).json(savedBorrow);

    } catch (err) {
      res.status(500).json({ message: "Error borrowing books", error: err.message });
    }
  });
  
  export default router;