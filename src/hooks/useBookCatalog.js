import { useState, useEffect, useCallback } from "react";

export default function useBookCatalog() {
  const [books, setBooks] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [searchGenre, setSearchGenre] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optionsLoadingError, setOptionsLoadingError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoadingError(null);
        const [genresRes, authorsRes] = await Promise.all([
          fetch("/api/genres"),
          fetch("/api/authors"),
        ]);
        if (!genresRes.ok || !authorsRes.ok) {
          throw new Error("Failed to load filter options");
        }
        const genres = await genresRes.json();
        const authorsData = await authorsRes.json();
        const authors = authorsData.data;
        setGenreOptions(genres || []);
        setAuthorOptions(authors || []);
      } catch (err) {
        setOptionsLoadingError(err.message || "Failed to load filter options");
      }
    };
    fetchOptions();
  }, []);

  // Fetch books (with filters)
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchGenre) params.append("genre", searchGenre);
      if (searchAuthor) params.append("author", searchAuthor);
      if (searchTitle) params.append("title", searchTitle);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch books");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchGenre, searchAuthor, searchTitle]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleClearFilters = () => {
    setSearchGenre("");
    setSearchAuthor("");
    setSearchTitle("");
    // setTimeout(() => {
    //   fetchBooks();
    // }, 0);
  };

  useEffect(() => {
    if (searchGenre === "" && searchAuthor === "" && searchTitle === "") {
      fetchBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchGenre, searchAuthor, searchTitle]);

  return {
    books,
    genreOptions,
    authorOptions,
    searchGenre,
    setSearchGenre,
    searchAuthor,
    setSearchAuthor,
    searchTitle,
    setSearchTitle,
    isLoading,
    error,
    optionsLoadingError,
    fetchBooks, // dùng để refetch khi cần
    handleClearFilters,
  };
}
