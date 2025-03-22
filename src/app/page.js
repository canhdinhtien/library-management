import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";

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

export default function Home() {
  return (
    <div>
      <Navbar />
      <section className="p-6 mt-12 bg-white text-gray-950">
        <h2 className="text-6xl font-bold text-center mb-6">
          Highlighted Trending Books
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
