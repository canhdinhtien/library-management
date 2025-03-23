import Navbar from "../../components/Navbar";
import BookCard from "../../components/BookCard";
import Dropdown from "../../components/Dropdown";
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
      <section className="p-6 mt-12">
        <h2 className="text-5xl font-serif text-center mb-6 text-black">
          Explore Our Book Catalog
        </h2>
        <div className="flex justify-center mb-6">
          <span className="text-center text-gray-700 text-xl">
            Easily filter and find the perfect read by genre and author. Browse
            through our diverse categories and discover your next favorite book
            today!
          </span>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-gray-800 text-3xl mb-6">
            Book Filtering Options
          </h2>

          <div className="flex justify-center gap-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center px- mt-12">
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
