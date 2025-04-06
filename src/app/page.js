import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import Image from "next/image";

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
      <section className="p-6 mt-6 bg-white text-gray-950">
        <h2 className="font-bold text-center text-xl sm:text-2xl md:text-5xl mt-12 mb-12">
          Highlighted Trending Books
        </h2>
        <div className="gap-6 justify-items-center px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 w-full">
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
          <div className="flex items-center space-x-4 mt-32">
            <Image
              src="/images/Group.png"
              alt="Reading"
              width={64}
              height={64}
              className="w-auto h-10 object-cover max-w-full"
            />
          </div>
          <h1 className="text-2xl mt-4 font-bold text-gray-800">
            Subscribe to our newsletter
          </h1>
          <div className="flex flex-wrap sm:flex-nowrap items-center bg-gray-100 rounded-lg overflow-hidden w-full max-w-lg border-2 border-gray-300">
            <div className="flex items-center pl-3">
              <Image
                src="/images/Mail.png"
                alt="Mail Icon"
                className="w-5 h-5 text-gray-500"
                width={20}
                height={20}
              />
            </div>
            <input
              type="email"
              placeholder="Input your email"
              className="flex-1 bg-transparent p-2 text-gray-600 outline-none w-full sm:w-auto"
            />
            <button className="bg-amber-400 text-brown-900 px-4 py-2 w-full sm:w-auto hover:bg-amber-500 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
