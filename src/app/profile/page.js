"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  Book,
  Clock,
  Calendar,
  RefreshCw,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";

function BorrowedBookItem({ book, onRenew }) {
  const isRenewable = book.renewalsLeft > 0;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/4 md:w-1/5 p-4 flex items-center justify-center bg-gray-50">
          <div className="relative w-32 h-48 sm:w-full sm:h-56 max-w-[128px] sm:max-w-full">
            <Image
              src={book.coverImage || "/placeholder.svg?height=300&width=200"}
              alt={book.title}
              fill
              className="object-cover rounded-md shadow-sm"
              sizes="(max-width: 640px) 128px, 200px"
            />
          </div>
        </div>
        <div className="w-full sm:w-3/4 md:w-4/5 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="w-full md:w-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 break-words">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-4">
                by {book.authorName || "Unknown Author"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end flex-shrink-0">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-sm">
                  Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Due: {new Date(book.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onRenew(book.borrowRecordId)}
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

function OverdueBookItem({ book, onPayFine }) {
  const canPayFine = book.fineAmount > 0 && !book.isFinePaid;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-200">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/4 md:w-1/5 p-4 flex items-center justify-center bg-red-50">
          <div className="relative w-32 h-48 sm:w-full sm:h-56 max-w-[128px] sm:max-w-full">
            <Image
              src={book.coverImage || "/placeholder.svg?height=300&width=200"}
              alt={book.title}
              fill
              className="object-cover rounded-md shadow-sm"
              sizes="(max-width: 640px) 128px, 200px"
            />
          </div>
        </div>
        <div className="w-full sm:w-3/4 md:w-4/5 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="w-full md:w-auto">
              <div className="flex items-center mb-1 flex-wrap">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words mr-2">
                  {book.title}
                </h3>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                by {book.authorName || "Unknown Author"}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end flex-shrink-0">
              <div className="flex items-center text-red-600 mb-2">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-sm">
                  Due: {new Date(book.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-red-600 mb-2">
                <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
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
                    Fine: {book.fineAmount.toFixed(2)} VNĐ
                  </span>
                  {book.finePaid && (
                    <span className="ml-2 text-xs text-green-600">(Paid)</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {canPayFine && (
                  <button
                    onClick={() =>
                      onPayFine(book.fineAmount, book.borrowRecordId)
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    Pay Fine ({book.fineAmount.toFixed(2)} VNĐ)
                  </button>
                )}
                {!canPayFine && (
                  <button className="px-3 py-1 bg-gray-200 text-gray-500 cursor-not-allowed rounded-md transition-colors text-sm">
                    Fine Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    birthDate: profile.birthDate
      ? new Date(profile.birthDate).toISOString().split("T")[0]
      : "",
    address: profile.address || "",
    phone: profile.phone || "",
  });

  const [activeTab, setActiveTab] = useState("info");
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatar, setAvatar] = useState(profile.avatar);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      // Kiểm tra nếu đuôi file không hợp lệ
      if (!validExtensions.includes(fileExtension)) {
        alert(
          "Please select a valid image file (e.g., .jpg, .jpeg, .png, .gif)."
        );
        e.target.value = ""; // Reset input file
        return;
      }
      setNewAvatar(file);
      setAvatar(URL.createObjectURL(file)); // Hiển thị ảnh xem trước
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra nếu không có thay đổi
    const isUnchanged =
      formData.firstName === profile.firstName &&
      formData.lastName === profile.lastName &&
      formData.birthDate ===
        (profile.birthDate
          ? new Date(profile.birthDate).toISOString().split("T")[0]
          : "") &&
      formData.address === profile.address &&
      formData.phone === profile.phone;

    if (isUnchanged) {
      alert(
        "No changes detected. Please update your information before saving."
      );
      return; // Dừng việc gửi dữ liệu
    }
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      onSave(); // Refresh profile data
      onClose(); // Close modal
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Edit Profile
        </h2>
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 text-center py-2 font-medium ${
              activeTab === "info"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("avatar")}
            className={`flex-1 text-center py-2 font-medium ${
              activeTab === "avatar"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Change Avatar
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {activeTab === "info" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
                />
              </div>
            </>
          )}
          {activeTab === "avatar" && (
            <div className="flex flex-col items-center">
              <img
                src={avatar || "/images/avatar.png"}
                alt="Current Avatar"
                className="w-32 h-32 rounded-full mb-4 border border-gray-300"
              />
              <div className="relative inline-block">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
                <label
                  htmlFor="fileInput"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-orange-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleRenewBook = async (borrowId) => {
    console.log("Attempting to renew:", borrowId);
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return;
    }

    const confirmRenew = window.confirm(
      "Are you sure you want to renew this book? The due date will be extended by 7 days."
    );
    if (!confirmRenew) {
      console.log("Renew action canceled.");
      return; // Dừng nếu người dùng không xác nhận
    }

    try {
      const response = await fetch(`/api/borrow/renew`, {
        method: "PUT",
        body: JSON.stringify({ borrowId }),
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Renew response:", data);
        alert(data.message);
      }
      if (!response.ok) {
        const error = await response.json();
        console.error("Renewal failed:", error);
        alert(error.error || "Failed to renew book.");
      }

      fetchProfileData();
    } catch (error) {
      console.error("Renew failed:", error);
      alert(`Renew failed: ${error.message}`);
    }
  };

  const handlePayFine = async (fineAmount, borrowId) => {
    console.log("Attempting to pay fine for:", borrowId);
    localStorage.setItem("borrowId", borrowId); // Lưu borrowId vào localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return;
    }

    const confirmRenew = window.confirm(
      "Are you sure you want to pay fine for this book? "
    );
    if (!confirmRenew) {
      console.log("Renew action canceled.");
      return; // Dừng nếu người dùng không xác nhận
    }
    try {
      const res = await fetch("/api/fines/payment/create", {
        method: "POST",
        body: JSON.stringify({
          fineAmount,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        window.location.href = data.paymentUrl; // redirect đến VNPay
      } else {
        throw new Error(data.message || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error.message}`);
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

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    // Refresh profile data here
    alert("Profile updated successfully!");
    setIsEditing(false);
    fetchProfileData(); // Refresh profile data after closing modal
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-6 sm:py-8 overflow-hidden">
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-32 relative">
              <div className="absolute -bottom-16 left-4 sm:left-6 md:left-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <Image
                    src={profile.avatar || "/images/avatar.png"}
                    alt={
                      `${profile.firstName} ${profile.lastName}` ||
                      user.username
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
              </div>
            </div>
            <div className="pt-16 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 md:px-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {`${profile.firstName} ${profile.lastName}` ||
                      user.username}
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
          <div className="mb-6 overflow-x-auto">
            <div className="flex border-b border-gray-200 min-w-max">
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
          {activeTab === "borrowed" && (
            <div className="space-y-6">
              {borrowedBooks?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">You have no borrowed books.</p>
                </div>
              ) : (
                borrowedBooks?.map((book) => (
                  <BorrowedBookItem
                    key={book._id}
                    book={book}
                    onRenew={handleRenewBook}
                  />
                ))
              )}
            </div>
          )}
          {activeTab === "overdue" && (
            <div className="space-y-6">
              {overdueBooks?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">You have no overdue books.</p>
                </div>
              ) : (
                <>
                  {/* Notice */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> You have overdue books. A fine
                        of <strong>10,000 VND per day</strong> is being applied
                        for each overdue book. Please return or renew your books
                        as soon as possible to avoid additional charges.
                      </p>
                    </div>
                  </div>
                  {overdueBooks?.map((book, index) => (
                    <OverdueBookItem
                      key={`${book._id}-${index}`}
                      book={book}
                      onPayFine={handlePayFine}
                    />
                  ))}
                </>
              )}
            </div>
          )}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </h3>
                  <p className="text-gray-900">
                    {`${profile.firstName} ${profile.lastName}` ||
                      user.username}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </h3>
                  <p className="text-gray-900 break-words">
                    {profile.email || user.email}
                  </p>
                </div>
                {profile.birthDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Date of Birth
                    </h3>
                    <p className="text-gray-900">
                      {new Date(profile.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </h3>
                    <p className="text-gray-900">{profile.address}</p>
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-900">{profile.phone}</p>
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
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    Reading Statistics
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Borrowed</p>
                      <p className="text-xl font-semibold text-orange-700">
                        {stats.totalBorrowed || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Currently Borrowed
                      </p>
                      <p className="text-xl font-semibold text-blue-700">
                        {stats.currentlyBorrowed || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Overdue</p>
                      <p className="text-xl font-semibold text-red-700">
                        {stats.overdue || 0}
                      </p>
                    </div>
                    {stats.favoriteGenres?.length > 0 && (
                      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Favorite Genres</p>
                        <p className="text-sm font-medium text-green-700 break-words">
                          {stats.favoriteGenres.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  Upgrade Membership
                </button>
              </div>
            </div>
          )}
          {/* Hiển thị modal chỉnh sửa */}
          {isEditing && (
            <EditProfileModal
              profile={profile}
              onClose={handleCloseModal}
              onSave={handleSaveProfile}
            />
          )}
        </>
      </main>
    </div>
  );
}
