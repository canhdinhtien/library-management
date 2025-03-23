import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import Image from "next/image";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center px-4">
          {books.map((book, index) => (
            <BookCard
              key={index}
              title={book.title}
              author={book.author}
              image="/images/book-placeholder.jpg"
              id={index}
            />
          ))}
        </div>
        <div className="bg-gray-100 p-6 flex flex-col items-center">
          {/* Container chứa hình ảnh và logo */}
          <div className="flex items-center space-x-4 mt-32">
            <Image
              src="/images/Group.png"
              alt="Reading"
              width={64}
              height={64}
              className="w-auto h-10 object-cover max-w-full"
            />
            <h1 className="text-4xl font-bold">Logo</h1>
          </div>
          <h1 className="text-2xl mt-4 font-bold text-gray-800">
            Subscribe to our newsletter
          </h1>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Input your email"
              className="border-2 border-gray-300 rounded-lg p-2 w-full max-w-md"
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
