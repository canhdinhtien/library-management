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
const reviews = [
  {
    id: 1,
    username: "Alice R.",
    rating: 4,
    comment: "Highly recommend!",
    time: "1 day ago",
    avt: "/images/user.png",
  },
  {
    id: 2,
    username: "Bob S.",
    rating: 3,
    comment: "Good book, but could be better.",
    time: "2 days ago",
    avt: "/images/user.png",
  },
  {
    id: 3,
    username: "Charlie M.",
    rating: 5,
    comment: "Absolutely loved it!",
    time: "3 days ago",
    avt: "/images/user.png",
  },
  {
    id: 4,
    username: "David J.",
    rating: 4,
    comment: "Great story, well-written.",
    time: "4 days ago",
    avt: "/images/user.png",
  },
];
export default function BookDetail({ params }) {
  const { id } = params;
  const book = books.find((book) => book.id === parseInt(id));

  if (!book) {
    return (
      <div>
        <Navbar />
        <section className="p-6">
          <h2 className="text-2xl font-bold text-center">Book Not Found</h2>
        </section>
      </div>
    );
  }

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
        <Review reviews={reviews} />
        <div className="mt-4 text-center block py-12 border rounded-lg shadow-md">
          <h2 className="text-2xl font-bold ">Availability</h2>
          <p className="text-gray-600 mt-2">
            Available | Reserved | Checked out until 31/10/2023
          </p>
        </div>
        <div className="mt-4 text-center block py-12 border rounded-lg shadow-md">
          <h2 className="text-2xl font-bold ">Action Options</h2>
          <div className="mt-2 flex justify-center space-x-4">
            <button className="bg-white text-orange-400 px-4 py-2 rounded-lg lg:rounded-2xl w-30 border border-orange-400 hover:bg-orange-400 hover:text-white group hover:scale-110 transition-transform duration-200 w-40">
              Borrow Now
            </button>
            <button className="bg-white text-orange-400 px-4 py-2 rounded-lg lg:rounded-2xl w-30 border border-orange-400 hover:bg-orange-400 hover:text-white group hover:scale-110 transition-transform duration-200 w-40">
              Reserve
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
