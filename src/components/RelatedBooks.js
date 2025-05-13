import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function RelatedBooks({ bookGenres, bookId }) {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const BOOKS_PER_PAGE = 4;

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      try {
        const response = await fetch(
          `/api/books/related?genres=${encodeURIComponent(
            bookGenres.join(",")
          )}&bookId=${encodeURIComponent(bookId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch related books");
        }
        const data = await response.json();
        setRelatedBooks(data.books || []);
        setCurrentIndex(0); // reset khi đổi genres
      } catch (error) {
        console.error("Error fetching related books:", error);
      }
    };

    if (bookGenres && bookGenres.length > 0) {
      fetchRelatedBooks();
    }
  }, [bookGenres]);

  const scrollLeft = () => {
    setCurrentIndex((prev) => Math.max(prev - BOOKS_PER_PAGE, 0));
  };

  const scrollRight = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + BOOKS_PER_PAGE, relatedBooks.length - BOOKS_PER_PAGE)
    );
  };

  if (relatedBooks.length === 0) {
    return <p className="text-gray-500">No related books found.</p>;
  }

  const visibleBooks = relatedBooks.slice(
    currentIndex,
    currentIndex + BOOKS_PER_PAGE
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Related Books
      </h2>
      <div className="relative">
        {/* Nút mũi tên trái */}
        {currentIndex > 0 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white z-10 cursor-pointer w-10 h-10"
          >
            &#8592;
          </button>
        )}

        {/* Danh sách sách */}
        <div className="flex space-x-4 ">
          {visibleBooks.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition w-64"
              onClick={() => router.push(`/book/${book._id}`)}
            >
              <img
                src={book.coverImage || "/images/default-book-cover.jpg"}
                alt={book.title}
                className="w-full h-60 object-cover object-top"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  By {book.author || "Unknown Author"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Nút mũi tên phải */}
        {currentIndex + BOOKS_PER_PAGE < relatedBooks.length && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white z-10 cursor-pointer w-10 h-10"
          >
            &#8594;
          </button>
        )}
      </div>
    </div>
  );
}

export default RelatedBooks;
