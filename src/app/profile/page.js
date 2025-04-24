"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  Book,
  Clock,
  Calendar,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";

function BorrowedBookItem({ book, onRenew, onReturn }) {
  const isRenewable = book.renewalsLeft > 0;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 md:w-1/5 p-4 flex items-center justify-center bg-gray-50">
          <div className="relative w-32 h-48 sm:w-full sm:h-56">
            <Image
              src={book.coverImage || "/placeholder.svg?height=300&width=200"}
              alt={book.title}
              fill
              className="object-cover rounded-md shadow-sm"
              sizes="(max-width: 640px) 128px, 200px"
            />
          </div>
        </div>
        <div className="sm:w-3/4 md:w-4/5 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-4">
                by {book.authorName || "Unknown Author"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end flex-shrink-0">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  Due: {new Date(book.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onReturn(book._id)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Return Book
                </button>
                <button
                  onClick={() => onRenew(book._id)}
                  disabled={!isRenewable}
                  className={`px-3 py-1 rounded-md text-sm flex items-center ${
                    isRenewable
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Renew
                  {isRenewable && (
                    <span className="ml-1">({book.renewalsLeft} left)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverdueBookItem({ book, onPayFine, onReturn }) {
  const canPayFine = book.fineAmount > 0 && !book.finePaid;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-200">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 md:w-1/5 p-4 flex items-center justify-center bg-red-50">
          <div className="relative w-32 h-48 sm:w-full sm:h-56">
            <Image
              src={book.coverImage || "/placeholder.svg?height=300&width=200"}
              alt={book.title}
              fill
              className="object-cover rounded-md shadow-sm"
              sizes="(max-width: 640px) 128px, 200px"
            />
          </div>
        </div>
        <div className="sm:w-3/4 md:w-4/5 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {book.title}
                </h3>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                by {book.authorName || "Unknown Author"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end flex-shrink-0">
              <div className="flex items-center text-red-600 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Due: {new Date(book.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-red-600 mb-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {Math.max(
                    0,
                    Math.floor(
                      (new Date() - new Date(book.dueDate)) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}{" "}
                  days overdue
                </span>
              </div>
              {book.fineAmount > 0 && (
                <div className="flex items-center text-red-600 mb-4">
                  <span className="text-sm font-medium">
                    Fine: ${book.fineAmount.toFixed(2)}
                  </span>
                  {book.finePaid && (
                    <span className="ml-2 text-xs text-green-600">(Paid)</span>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {canPayFine && (
                  <button
                    onClick={() => onPayFine(book._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    Pay Fine (${book.fineAmount.toFixed(2)})
                  </button>
                )}
                <button
                  onClick={() => onReturn(book._id, true)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  Return Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("borrowed");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Authentication token not found.");
      setIsLoading(false);
      logout();
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
        console.log("Profile data:", data.data);
      } else {
        throw new Error(data.message || "Failed to fetch profile data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load your profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewBook = async (bookId) => {
    console.log("Attempting to renew book:", bookId);
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to renew book");

      fetchProfileData();
    } catch (error) {
      console.error("Renew failed:", error);
      alert(`Renew failed: ${error.message}`);
    }
  };

  const handleReturnBook = async (bookId, isOverdue = false) => {
    console.log(
      `Attempting to return ${isOverdue ? "overdue" : ""} book:`,
      bookId
    );
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}/return`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to return book");

      fetchProfileData();
    } catch (error) {
      console.error("Return failed:", error);
      alert(`Return failed: ${error.message}`);
    }
  };

  const handlePayFine = async (bookId) => {
    console.log("Attempting to pay fine for book:", bookId);
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return;
    }

    try {
      const response = await fetch(`/api/fines/${bookId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to pay fine");

      fetchProfileData();
    } catch (error) {
      console.error("Pay fine failed:", error);
      alert(`Pay fine failed: ${error.message}`);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { profile, stats, borrowedBooks, overdueBooks } = profileData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <>
          {" "}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-32 relative">
              <div className="absolute -bottom-16 left-6 sm:left-8">
                <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <Image
                    src={
                      profile.avatar || "/placeholder.svg?height=128&width=128"
                    }
                    alt={profile.name || user.username}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              </div>
            </div>
            <div className="pt-20 pb-6 px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.name || user.username}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                    {profile.membershipType && (
                      <div className="flex items-center">
                        <span>{profile.membershipType} Member</span>
                      </div>
                    )}
                    {profile.memberSince && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          Member since{" "}
                          {new Date(profile.memberSince).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {stats && profile && profile.maxBooksAllowed && (
                  <div className="mt-4 sm:mt-0">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {Math.max(
                          0,
                          profile.maxBooksAllowed -
                            (stats.currentlyBorrowed || 0)
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {profile.maxBooksAllowed}
                      </span>{" "}
                      book slots available
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("borrowed")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                  activeTab === "borrowed"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Book className="h-4 w-4" />
                <span>Borrowed</span>
                {borrowedBooks && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {borrowedBooks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                  activeTab === "overdue"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Overdue</span>
                {overdueBooks && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {overdueBooks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>
          {/* Nội dung các Tabs */}
          {activeTab === "borrowed" && (
            <div className="space-y-6">
              {borrowedBooks?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  {" "}
                  {/* Message khi không có sách */}{" "}
                </div>
              ) : (
                borrowedBooks?.map((book) => (
                  <BorrowedBookItem
                    key={book._id}
                    book={book}
                    onRenew={handleRenewBook}
                    onReturn={handleReturnBook}
                  />
                ))
              )}
            </div>
          )}
          {activeTab === "overdue" && (
            <div className="space-y-6">
              {overdueBooks?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  {" "}
                  {/* Message khi không có sách */}{" "}
                </div>
              ) : (
                <>
                  {/* Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    {" "}
                    {/* ... */}{" "}
                  </div>
                  {overdueBooks?.map((book) => (
                    <OverdueBookItem
                      key={book._id}
                      book={book}
                      onPayFine={handlePayFine}
                      onReturn={handleReturnBook}
                    />
                  ))}
                </>
              )}
            </div>
          )}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </h3>
                  <p className="text-gray-900">
                    {profile.name || user.username}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </h3>
                  <p className="text-gray-900">{profile.email || user.email}</p>
                </div>
                {profile.memberSince && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Member Since
                    </h3>
                    <p className="text-gray-900">
                      {new Date(profile.memberSince).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.membershipType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Membership Type
                    </h3>
                    <p className="text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {profile.membershipType}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              {stats && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">
                    Reading Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Borrowed</p>
                      <p className="text-xl font-semibold text-orange-700">
                        {stats.totalBorrowed || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Currently Borrowed
                      </p>
                      <p className="text-xl font-semibold text-blue-700">
                        {stats.currentlyBorrowed || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Overdue</p>
                      <p className="text-xl font-semibold text-red-700">
                        {stats.overdue || 0}
                      </p>
                    </div>
                    {stats.favoriteGenres?.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Favorite Genres</p>
                        <p className="text-sm font-medium text-green-700">
                          {stats.favoriteGenres.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-end space-x-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  Upgrade Membership
                </button>
              </div>
            </div>
          )}
        </>
      </main>
    </div>
  );
}
