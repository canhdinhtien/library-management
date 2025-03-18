import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";

const books = [
  { title: "The Silent Patient", author: "Alex Michaelides" },
  { title: "Where the Crawdads Sing", author: "Delia Owens" },
  { title: "Educated", author: "Tara Westover" },
  { title: "Becoming", author: "Michelle Obama" },
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
          {books.map((book, index) => (
            <BookCard key={index} title={book.title} author={book.author} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
