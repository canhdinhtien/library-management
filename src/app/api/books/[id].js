import dbConnect from "../../../lib/dbConnect";
import Book from "../../../models/Book";

export default async function handler(req, res) {
  await dbConnect(); // Kết nối tới MongoDB

  if (req.method === "GET") {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Error fetching books", error });
    }
  } else if (req.method === "POST") {
    const { coverImage, bookCode, title, category, price, quantity, author, publisher } = req.body;

    if (!coverImage || !bookCode || !title || !category || !price || !quantity || !author || !publisher) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const newBook = new Book({
        coverImage,
        bookCode,
        title,
        category,
        price,
        quantity,
        author,
        publisher,
      });

      await newBook.save();
      res.status(201).json(newBook); 
    } catch (error) {
      res.status(500).json({ message: "Error creating book", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
