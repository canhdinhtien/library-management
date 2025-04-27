import Book from "../../../models/Book.js";
import Rating from "../../../models/Rating.js";

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query; 

    if (!id) {
      return res.status(400).json({ message: "Missing book ID" });
    }

    const book = await Book.findById(id)
      .populate("author", "name")
      .populate("publisher", "name");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Nếu sách chưa có đánh giá
    if (book.numberOfRating === 0) {
      return res.status(200).json({
        book,
        ratingStats: {
          average: 0,
          total: 0
        },
        ratings: [],
        message: "The book hasn't been rated yet."
      });
    }

    // Lấy danh sách đánh giá
    const ratings = await Rating.find({ book: id })
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
}
