import { useState, useEffect } from "react";
import { fetchAuthors, fetchBooks, fetchGenres } from "../services/bookService";

export const useBookCatalog = () => {
  const [searchGenre, setSearchGenre] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [searchTitle, setSearchTitle] = useState("");

  const [searchQuery, setSearchQuery] = useState({
    genre: "",
    author: "",
    title: "",
  });

  const [books, setBooks] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optionsLoadingError, setOptionsLoadingError] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
        const [genres, authors] = await Promise.all([
          fetchGenres(),
          fetchAuthors(token), // Truyền token vào đây
        ]);
        setGenreOptions(genres);
        setAuthorOptions(authors);
      } catch (err) {
        setOptionsLoadingError(
          err.message || "Could not load filtering options."
        );
      }
    };
    loadOptions();
  }, []);

  const handleFetchBooks = async (queryParams = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBooks(queryParams || searchQuery);
      setBooks(data);
    } catch (err) {
      setError(err.message);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const newQuery = {
      genre: searchGenre,
      author: searchAuthor,
      title: searchTitle,
    };
    setSearchQuery(newQuery);
    handleFetchBooks(newQuery);
  };

  const handleClearFilters = () => {
    setSearchGenre("");
    setSearchAuthor("");
    setSearchTitle("");
    const emptyQuery = { genre: "", author: "", title: "" };
    setSearchQuery(emptyQuery);
    handleFetchBooks(emptyQuery);
  };

  return {
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
    handleSearch,
    handleClearFilters,
    retryFetchBooks: handleFetchBooks,
  };
};
