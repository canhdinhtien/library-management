import Book from "../../../models/Book.js";
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Trả về danh sách tất cả các sách
    res.status(200).json(books);
  } else if (req.method === 'POST') {
    // Xử lý tạo sách mới
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    const newBook = {
      id: books.length + 1, // Tạo ID cho sách mới (có thể thay thế bằng một cách tạo ID khác)
      title,
      author,
    };

    books.push(newBook); // Thêm sách vào mảng
    res.status(201).json(newBook); // Trả về sách mới đã được tạo
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}