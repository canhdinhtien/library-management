"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { BookOpen, Mail, RefreshCw, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [topBooks, setTopBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({
    message: "",
    type: "",
  });

  const fetchTopBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/books?featured=true");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTopBooks(data);
    } catch (e) {
      console.error("Failed to fetch top books:", e);
      setError(e.message || "Failed to load books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopBooks();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubscribeStatus({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setSubscribeStatus({ message: "Subscribing...", type: "loading" });

    setTimeout(() => {
      setSubscribeStatus({
        message: "Thank you for subscribing!",
        type: "success",
      });
      setEmail("");
      setTimeout(() => setSubscribeStatus({ message: "", type: "" }), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                  Discover Your Next Favorite Book
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Explore our curated collection of top-rated books and find
                  your perfect read today.
                </p>
                <button
                  onClick={() => router.push("/catalog")}
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse Catalog <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-64 h-80 md:w-80 md:h-96">
                  <div className="absolute top-0 right-0 w-48 h-64 md:w-56 md:h-72 bg-amber-100 rounded-lg transform rotate-6"></div>
                  <div className="absolute top-0 right-0 w-48 h-64 md:w-56 md:h-72 bg-gray-200 rounded-lg transform -rotate-6"></div>
                  <div className="absolute top-0 right-0 w-48 h-64 md:w-56 md:h-72 bg-white rounded-lg shadow-lg z-10">
                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=400&width=300"
                        alt="Featured Book"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Highest Rated Books
              </h2>
              <button
                onClick={() => router.push("/catalog")}
                className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="bg-gray-300 h-64 w-full"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-lg">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchTopBooks}
                  className="flex items-center gap-2 mx-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
              </div>
            ) : topBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topBooks.map((book) => (
                  <BookCard
                    key={book._id}
                    id={book._id}
                    title={book.title}
                    author={book.authorName || "Unknown Author"}
                    image={book.coverImage || "/images/book-placeholder.jpg"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-xl mb-2">
                  No top-rated books found
                </p>
                <p className="text-gray-500">
                  Check back later for our featured selections
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-amber-50">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-amber-800" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-700 max-w-lg mx-auto">
                Stay updated with our latest book recommendations, author
                interviews, and special offers.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 focus:outline-none"
                    aria-label="Email address"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Subscribe
                </button>
              </div>

              {subscribeStatus.message && (
                <div
                  className={`mt-3 text-sm ${
                    subscribeStatus.type === "error"
                      ? "text-red-600"
                      : subscribeStatus.type === "success"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {subscribeStatus.message}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
