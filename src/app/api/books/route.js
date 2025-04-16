import express from "express";
import Book from "../models/Book.js";
import Rating from "../models/Rating.js";

const router = express.Router();

router.get("/rates", async (req, res) => {
  try {
    if(numberOfRating==0) {
        res.status(200).json({message: "The book hasn't been rated yet."})

    }
    const bookId = req.params.id;

    const book = await Book.findById(bookId)
      .populate("author", "name")
      .populate("publisher", "name");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const ratings = await Rating.find({ book: bookId })
      .populate("member", "name email")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      book,
      ratingStats: {
        average: book.rating,
        total: book.numberOfRating
      },
      ratings
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching book rates", error: err.message });
  }
});

export default router;
