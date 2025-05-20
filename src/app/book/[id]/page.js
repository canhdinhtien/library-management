"use client";

import React from "react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import RelatedBooks from "../../../components/RelatedBooks";
import Navbar from "@/components/Navbar";
import {
  Star,
  StarHalf,
  Calendar,
  User,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

import Image from "next/image";
import { toast } from "sonner";

// Review component to display community reviews
function Review({ reviews, book }) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Community Reviews
        </h2>
        <div className="flex flex-col items-center mt-4 p-6 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 text-yellow-400 mb-4 transition-transform transform hover:scale-110" />
          <p className="text-gray-600 text-lg font-medium">
            No reviews available for this book.
          </p>
          <p className="text-gray-500 mt-2 text-center">
            Be the first to leave a review and share your thoughts!
          </p>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
        Community Reviews
      </h2>
      <div className="flex items-center mt-4 space-x-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((starValue) => {
            if (starValue <= Math.floor(averageRating)) {
              return (
                <Star
                  key={starValue}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              );
            } else if (
              starValue - 0.5 <= averageRating &&
              starValue > averageRating
            ) {
              return (
                <StarHalf
                  key={starValue}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              );
            } else {
              return <Star key={starValue} className="w-5 h-5 text-gray-300" />;
            }
          })}
        </div>

        <span className="text-yellow-500 text-xl font-bold">
          {averageRating.toFixed(2)}
        </span>
        <span className="text-gray-500">({book.reviews.length} reviews)</span>
      </div>
      <ul className="mt-8 space-y-4 divide-y divide-gray-200">
        {reviews.map((review, index) => (
          <li key={index} className="pt-4 first:pt-0">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={
                    review.memberImage || "/placeholder.svg?height=48&width=48"
                  }
                  alt={review.memberName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full shadow-md object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {review.memberName}
                  </span>
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-gray-700">{review.text}</p>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {review.rating} / 5
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthorDetail({ authorName, authorBio, authorImage }) {
  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
        Author Details
      </h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
        <Image
          src={authorImage || "/placeholder.svg?height=64&width=64"}
          alt={authorName}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
        />
        <h3 className="text-lg font-semibold text-gray-700">{authorName}</h3>
      </div>
      <p className="text-gray-700 mt-4">{authorBio}</p>
    </div>
  );
}

// Main BookDetail component
export default function BookDetail({ params }) {
  const paramsData = React.use(params);
  const { id } = paramsData;
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [userId, setUserId] = useState(null);

  const fetchBookData = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch book data");
      }
      const body = await response.json();
      const book = body.data;
      if (book.reviews) {
        const average =
          book.reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.reviews.length;

        setAverageRating(average.toFixed(2));
      }
      if (!body.success) {
        throw new Error(book.message || "Book not found");
      }

      setBook(book);
    } catch (error) {
      console.error("Error fetching book data:", error);
      setBook(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookData(id);
    }
  }, [id]);

  const handleBorrowClick = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("❌ " + "You need to log in to borrow this book.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
      setShowBorrowModal(true);
    } catch (error) {
      console.error("Invalid token:", error);
      toast.error("❌ " + "Your session has expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-48 w-32 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <section className="p-5">
          <div className="max-w-7xl mx-auto text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Book Not Found</h2>
            <p className="mt-4 text-gray-600">
              The book you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <section className="px-4 py-6 md:px-6 md:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
          {/* Book Cover and Actions - Left Column */}
          <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col items-center  lg:sticky lg:top-24 self-start">
            <div className="w-full max-w-xs flex flex-col items-center">
              <Image
                src={book.coverImage || "/placeholder.svg?height=384&width=256"}
                width={256}
                height={384}
                alt={book.title}
                className=" min-w-[256px] min-h-[384px] aspect-[2/3] object-cover rounded-lg shadow-md mx-auto"
              />
              <button
                className="min-w-[256px] mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center cursor-pointer"
                onClick={handleBorrowClick}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Borrow Now
              </button>
            </div>
          </div>

          {/* Book Details - Right Column */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {book.title}
            </h1>
            <p className="text-lg text-gray-600 mt-2 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">{book.authorName}</span>
            </p>

            <div className="mt-6 prose prose-orange max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {book.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-gray-900 font-semibold">Genres:</span>
              {Array.isArray(book.genres)
                ? book.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-orange-500 hover:text-white transition duration-200 cursor-pointer"
                    >
                      {genre.trim()}
                    </span>
                  ))
                : book.genres?.split(",").map((genre, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-orange-500 hover:text-white transition duration-200 cursor-pointer"
                    >
                      {genre.trim()}
                    </span>
                  ))}
            </div>

            <hr className="my-8" />

            <div className="space-y-8">
              <AuthorDetail
                authorName={book.authorName}
                authorBio={book.authorBio}
                authorImage={book.authorImage}
              />
            </div>
            <RelatedBooks bookGenres={book.genres} bookId={book._id} />
            <hr className="my-6" />
            <div>
              <Review reviews={book.reviews || []} book={book} />
            </div>
          </div>
        </div>

        {/* Borrow Modal */}
        {showBorrowModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              {book.availableQuantity === 0 && (
                <div className="text-red-500 mb-4 bg-red-100 p-3 rounded-md flex items-start">
                  <span className="font-bold mr-2">Sorry!</span>
                  <span>This book is currently not available.</span>
                </div>
              )}

              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Borrow Book
              </h2>

              <div className="mb-4 space-y-2">
                <p className="text-gray-700">
                  <strong>Book Title:</strong> {book.title}
                </p>
                <p className="text-gray-700">
                  <strong>Available Quantity:</strong>{" "}
                  {book.availableQuantity || 0}
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  try {
                    const response = await fetch("/api/borrow", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                          "authToken"
                        )}`,
                      },
                      body: JSON.stringify({
                        bookId: book._id,
                        userId,
                      }),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      toast.success(
                        `Book borrowed successfully! You can pick it up at the library.`
                      );
                      setShowBorrowModal(false);
                      fetchBookData(book._id);
                    } else {
                      const data = await response.json();
                      toast.error(
                        "❌ " + (data.error || "Failed to borrow book.")
                      );
                      setShowBorrowModal(false);
                    }
                  } catch (error) {
                    console.error("Error borrowing book:", error);
                    toast.error(
                      "❌ " + "An error occurred while borrowing the book."
                    );
                  }
                }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-500">
                  You can borrow the book for a maximum of 60 days.
                </p>
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your book reservation will be valid for
                  the next <strong>3 days</strong>. Please visit the library to
                  collect your book.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBorrowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={book.availableQuantity === 0}
                    className={`px-4 py-2 rounded-md transition ${
                      book.availableQuantity === 0
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    Confirm Borrow
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
