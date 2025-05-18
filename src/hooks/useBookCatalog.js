// "use client";
// import { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import {
//   CheckCircleIcon,
//   XCircleIcon,
//   ExclamationCircleIcon,
// } from "@heroicons/react/solid";
// import Navbar from "@/components/Navbar";

// function PaymentSuccessContent() {
//   const searchParams = useSearchParams();
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [updatedBookStatus, setUpdatedBookStatus] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPaymentStatus = async () => {
//       try {
//         const response = await fetch(
//           `/api/fines/payment-success?${searchParams.toString()}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//             },
//           }
//         );
//         const result = await response.json();

//         if (result.success) {
//           setPaymentStatus(result.paymentStatus);
//         } else {
//           setPaymentStatus("error");
//         }
//       } catch (error) {
//         console.error("Error fetching payment status:", error);
//         setPaymentStatus("error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchUpdatedBookStatus = async (borrowId) => {
//       try {
//         const response = await fetch(`/api/fines/update-status`, {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//           },
//           body: JSON.stringify({ borrowId }),
//         });
//         const result = await response.json();

//         if (result.success) {
//           setUpdatedBookStatus(result.updatedBookStatus);
//         } else {
//           setUpdatedBookStatus("error");
//         }
//       } catch (error) {
//         console.error("Error updating book status:", error);
//         setUpdatedBookStatus("error");
//       }
//     };

//     const borrowId = localStorage.getItem("borrowId");
//     fetchUpdatedBookStatus(borrowId);
//     fetchPaymentStatus(); // Gọi fetchPaymentStatus sau khi fetchUpdatedBookStatus
//   }, [searchParams]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
//         <div className="text-lg font-medium text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {paymentStatus === "success" ? (
//         <>
//           <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-green-600 mb-2">
//             Payment Successful!
//           </h1>
//           <p className="text-gray-600">
//             Thank you for your payment. Your transaction has been completed
//             successfully.
//           </p>
//         </>
//       ) : paymentStatus === "failed" ? (
//         <>
//           <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-red-600 mb-2">
//             Payment Failed
//           </h1>
//           <p className="text-gray-600">
//             Unfortunately, your payment could not be processed. Please try
//             again.
//           </p>
//         </>
//       ) : (
//         <>
//           <ExclamationCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-orange-600 mb-2">
//             Error Occurred
//           </h1>
//           <p className="text-gray-600">
//             An error occurred while processing your payment. Please contact
//             support.
//           </p>
//         </>
//       )}
//     </div>
//   );
// }

// export default function PaymentSuccess() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 overflow-hidden">
//       <Navbar />
//       <div className="min-h-screen flex flex-col items-center justify-center">
//         <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
//           <Suspense fallback={<div>Đang tải...</div>}>
//             <PaymentSuccessContent />
//           </Suspense>
//         </div>
//       </div>
//     </div>
//   );
// }
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

  // Fetch filter options (genres, authors)
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

  // Fetch books on mount and when filters change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchGenre("");
    setSearchAuthor("");
    setSearchTitle("");
  };

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
