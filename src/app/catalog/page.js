import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import Dropdown from "../components/Dropdown";

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
      <section className="p-4 sm:p-6 mt-8 sm:mt-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center mb-4 sm:mb-6 text-black">
          Explore Our Book Catalog
        </h2>

        <div className="flex justify-center px-4">
          <span className="text-center text-gray-700 text-lg sm:text-xl max-w-3xl">
            Easily filter and find the perfect read by genre and author. Browse
            through our diverse categories and discover your next favorite book
            today!
          </span>
        </div>
        <div className="mt-8 sm:mt-12">
          <h2 className="text-center text-gray-800 text-2xl sm:text-3xl mb-4 sm:mb-6">
            Book Filtering Options
          </h2>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <Dropdown
              label="Genre"
              options={["Fiction", "Non-Fiction", "Fantasy", "Science Fiction"]}
              placeholder="Search Genre"
            />
            <Dropdown
              label="Author"
              options={[
                "Harper Lee",
                "George Orwell",
                "Jane Austen",
                "Herman Melville",
              ]}
              placeholder="Search Author"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center px-4 mt-8 sm:mt-12 text-gray-800">
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
      </section>
    </div>
  );
}
