import Navbar from "../../components/Navbar";
import BookCard from "../../components/BookCard";

const books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "/books/mockingbird.jpg",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    image: "/books/1984.jpg",
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "/books/pride.jpg",
  },
  {
    id: 4,
    title: "Moby-Dick",
    author: "Herman Melville",
    image: "/books/mobydick.jpg",
  },
];

export default function CatalogPage() {
  return (
    <div>
      <Navbar />
      <section className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Explore Our Book Catalog
        </h2>

        {/* Hiển thị danh sách sách */}
        <div className="grid grid-cols-4 gap-6 justify-center">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
