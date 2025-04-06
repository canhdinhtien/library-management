"use client";
import BookCard from "./BookCard";

const BookList = ({ books, title }) => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>

      {/* Lưới hiển thị sách */}
      <div className="grid grid-cols-4 gap-6 justify-center">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default BookList;