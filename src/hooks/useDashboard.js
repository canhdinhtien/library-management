import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchFeaturedBooks } from "../services/bookService";

export function useDashboard() {
  const router = useRouter();

  const { user, loading: authLoading, logout } = useAuth();

  const [topBooks, setTopBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeaturedBooks = useCallback(async () => {
    if (!user) {
      console.warn("loadFeaturedBooks called without a user.");
      setIsLoading(false);
      setTopBooks([]);
      return;
    }

    // const token = localStorage.getItem("authToken");
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("Auth token missing in localStorage for logged-in user.");
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      logout();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFeaturedBooks(token);
      setTopBooks(data);
    } catch (e) {
      console.error("Failed to load featured books:", e);

      if (e.message.includes("Unauthorized")) {
        setError("Your session has expired. Please log in again.");

        logout();
      } else {
        setError(e.message || "Could not load featured books.");
      }
      setTopBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      console.log(
        "Dashboard Hook: No user found after auth load, redirecting."
      );
      router.push("/login");
      return;
    }

    loadFeaturedBooks();
  }, [authLoading, user, router, loadFeaturedBooks]);

  return {
    user,
    authLoading,
    topBooks,
    isLoading,
    error,
    loadFeaturedBooks,
  };
}
