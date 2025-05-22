"use client";

import useBookCatalog from "../../hooks/useBookCatalog";
import Navbar from "../../components/Navbar";
import BookCard from "../../components/BookCard";
import { Search, X, BookOpen, RefreshCw } from "lucide-react";

export default function CatalogPage() {
  const {
    searchGenre,
    searchAuthor,
    searchTitle,
    setSearchGenre,
    setSearchAuthor,
    setSearchTitle,
    genreOptions,
    authorOptions,
    books,
    isLoading,
    error,
    optionsLoadingError,
    handleClearFilters,
    retryFetchBooks,
    fetchBooks,
  } = useBookCatalog();

  const handleSearch = (e) => {
    e.preventDefault();
    // const genre = document.getElementById("genre-input").value;
    // const author = document.getElementById("author-input").value;
    // const title = document.getElementById("title-input").value;
    // setSearchGenre(genre);
    // setSearchAuthor(author);
    // setSearchTitle(title);
    fetchBooks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Navbar />
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center mb-6 sm:mb-8 text-gray-900">
          Explore Our Book Catalog
        </h2>
        <div className="flex justify-center px-4 mb-10">
          <p className="text-center text-gray-700 text-lg sm:text-xl max-w-3xl">
            Easily filter and find the perfect read by genre, author, or title.
            Browse through our diverse categories and discover your next
            favorite book today!
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-center text-gray-800 text-2xl sm:text-3xl mb-6">
            Book Search
          </h3>

          {optionsLoadingError && (
            <div className="text-center p-4 mb-6 bg-red-50 text-red-600 rounded-lg max-w-3xl mx-auto">
              <p>Error loading filter options: {optionsLoadingError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center text-red-700 hover:text-red-800"
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh page
              </button>
            </div>
          )}

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="w-full">
                <label
                  htmlFor="genre-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Genre
                </label>
                <select
                  id="genre-input"
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-800"
                  value={searchGenre}
                  onChange={(e) => setSearchGenre(e.target.value)}
                >
                  <option value="">All Genres</option>
                  {genreOptions.map((genre, index) => (
                    <option key={index} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="author-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Author
                </label>
                <select
                  id="author-input"
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-800"
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                >
                  <option value="">All Authors</option>
                  {authorOptions.map((author, index) => (
                    <option key={index} value={author.name}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="title-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <div className="relative">
                  <input
                    id="title-input"
                    type="text"
                    className="w-full p-2 pl-10 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-800"
                    placeholder="Search by title..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                <Search className="h-5 w-5 inline mr-2" />
                Search Books
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2 border border-gray-600 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <X className="h-5 w-5 inline mr-2" />
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        <div className="px-4">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg max-w-3xl mx-auto">
              <p className="text-lg">Error: {error}</p>
              <button
                onClick={() => fetchBooks()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && books.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-2xl mb-2">No books found</p>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}

          {!isLoading && !error && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {books.map((book) => (
                <BookCard
                  key={book._id || book.id}
                  id={book._id || book.id}
                  title={book.title}
                  author={book.author?.name || book.authorName || "Unknown"}
                  image={book.coverImage || "/images/book-placeholder.jpg"}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
