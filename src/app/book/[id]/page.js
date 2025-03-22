import Navbar from "../../../components/Navbar";
import Review from "../../../components/Review";

const books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "/books/mockingbird.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    image: "/books/1984.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "/books/pride.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 4,
    title: "Moby-Dick",
    author: "Herman Melville",
    image: "/books/mobydick.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];
export default function BookDetail({ params }) {
  const { id } = params;
  const book = books.find((book) => book.id === parseInt(id));
  return (
    <div>
      <Navbar />
      <section className="p-6">
        <div className="text-center block py-12">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <p className="text-gray-600">By {book.author}</p>
        </div>
        <div className="m-0">
          <p className="mt-4 text-center py-8 mx-20">{book.description}</p>
        </div>

        <Review username="Alice R." rating={4} comment="Highly recommend!" />
      </section>
    </div>
  );
}
