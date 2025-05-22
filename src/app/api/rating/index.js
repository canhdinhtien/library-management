// pages/api/rating/index.js

import Rating from "../../../models/Rating.js";
import Book from "../../../models/Book.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { member, book, rating, comment } = req.body;

      if (!member || !book || !rating) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 🔥 Check trước: thành viên đã đánh giá cuốn sách này chưa?
      const existingRating = await Rating.findOne({ member, book });
      if (existingRating) {
        return res.status(400).json({ message: "You have already rated this book!" });
      }

      const newRating = new Rating({ member, book, rating, comment });
      const savedRating = await newRating.save();

      // Cập nhật trung bình rating
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

      return res.status(201).json({
        rating: savedRating,
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalRatings
      });

    } catch (err) {
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}






