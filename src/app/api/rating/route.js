import express from "express";
import Rating from "../models/Rating.js";
import Book from "../models/Book.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { member, book, rating, comment } = req.body;

    if (!member || !book || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRating = new Rating({member, book, rating, comment});
    const savedRating = await newRating.save();

    //Cajp nhat
    const agg = await Rating.aggregate([
      { $match: { book: newRating.book } },
      {
        $group: {
          _id: "$book",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    const avgRating = agg[0]?.avgRating || 0;
    const totalRatings = agg[0]?.count || 0;

    await Book.findByIdAndUpdate(book, {
      rating: avgRating.toFixed(2),
      numberOfRating: totalRatings
    });

    res.status(201).json({
      rating: savedRating,
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalRatings
    });

    res.status(201).json(savedRating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already rating this book before!" });
    }

    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

export default router;
