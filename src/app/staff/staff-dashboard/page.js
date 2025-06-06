"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import AddBookModal from "@/components/Dashboard/AddBookModal";
import {
  RefreshCw,
  BookOpen,
  Users,
  UserPlus,
  BookPlus,
  BookCopy,
} from "lucide-react";

import DashboardHeader from "../../../components/Dashboard/DashboardHeader";
import DashboardStats from "../../../components/Dashboard/DashboardStats";
import BooksManagementSection from "../../../components/Dashboard/BooksManagementSection";
import UsersManagementSection from "../../../components/Dashboard/UsersManagementSection";
import BorrowsManagementSection from "../../../components/Dashboard/BorrowsManagementSection";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("books");
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [users, setUsers] = useState([]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddBorrowModal, setShowAddBorrowModal] = useState(false);
  const [showEditBorrowModal, setShowEditBorrowModal] = useState(false);
  const [editingBorrow, setEditingBorrow] = useState(null);
  const [editBorrowStatus, setEditBorrowStatus] = useState(null);

  useEffect(() => {
    if (showEditBorrowModal && editingBorrow) {
      setEditBorrowStatus(editingBorrow.status || "");
    }
  }, [showEditBorrowModal, editingBorrow]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "employee") {
        console.log(
          `StaffDashboard: Role (${user.role}) not staff. Redirecting.`
        );
      } else {
        loadAdminDashboardData();
      }
    }
  }, [user, authLoading, router]);

  const loadAdminDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading ADMIN dashboard data...");
      const token = localStorage.getItem("authToken");

      // Gọi API để lấy thống kê
      const statsResponse = await fetch("/api/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const statsData = await statsResponse.json();
      console.log("AdminDashboard: statsData", statsData);

      // Gọi API để lấy danh sách sách
      const booksResponse = await fetch("/api/admin/books", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const booksData = await booksResponse.json();

      // Gọi API để lấy danh sách bản ghi mượn sách
      const borrowsResponse = await fetch("/api/admin/borrows", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const borrowsData = await borrowsResponse.json();

      // Gọi API để lấy danh sách người dùng
      const usersResponse = await fetch("/api/admin/members", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usersData = await usersResponse.json();

      // Cập nhật state với dữ liệu từ API
      setStats(statsData);
      setBooks(booksData);
      setBorrows(borrowsData);
      setUsers(usersData);

      console.log("ADMIN dashboard data loaded successfully.");

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to load ADMIN dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Admin Dashboard: Logout failed:", error);
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing ADMIN dashboard data...");
    loadAdminDashboardData();
  };

  const [showAddBookModal, setShowAddBookModal] = useState(false);

  const handleAddBook = () => {
    setShowAddBookModal(true);
  };

  const handleCloseAddBookModal = () => {
    setShowAddBookModal(false);
  };

  const handleAddBorrow = () => {
    console.log("Admin: Add Borrow");
    setShowAddBorrowModal(true);
  };
  const handleAddUser = () => {
    console.log("Admin: Add User");
    setShowAddUserModal(true);
  };

  const handleSaveBorrow = async (newBorrow) => {
    try {
      const response = await fetch("/api/admin/borrows", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBorrow),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to add borrow.");
        return;
      }
      setBorrows((prevBorrows) => [
        ...(Array.isArray(prevBorrows) ? prevBorrows : []),
        result.data || result,
      ]);
      toast.success("✔️ Borrow added successfully!");
      setShowAddBorrowModal(false);
      loadAdminDashboardData();
    } catch (error) {
      console.error("Failed to add borrow:", error);
      toast.error("❌ " + (error.message || "Failed to add borrow."));
    }
  };

  const handleSaveUser = async (newUser) => {
    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newUser),
      });

      const savedUser = await response.json();
      if (!response.ok) {
        // alert(savedUser.error || "Failed to add user.");
        toast.error(
          (savedUser && ("❌ " + savedUser.error || savedUser.message)) ||
            "Failed to add user."
        );
        return;
      }

      setUsers((prevUsers) => [...prevUsers, savedUser]);
      toast.success("✔️ User added successfully!");
      setShowAddUserModal(false);
      loadAdminDashboardData(); // Refresh the data after adding a new user
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleEditBook = (bookId) => console.log("Admin: Edit book:", bookId);

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;
      if (response.status !== 204) {
        try {
          data = await response.json();
        } catch (e) {
          data = {};
        }
      }

      if (!response.ok) {
        toast.error(
          (data && (data.error || data.message)) || "Failed to delete book."
        );
        return;
      }
      toast.success("✔️ Book deleted successfully!");
      await loadAdminDashboardData();
    } catch (error) {
      console.error("Failed to delete book:", error);
      toast.error(
        "❌ " + (error.message || "An error occurred while deleting the book.")
      );
    }
  };

  const handleEditBorrow = (borrowId) => {
    const borrowToEdit = borrows.find((borrow) => borrow._id === borrowId);
    console.log("Admin: Edit borrow:", borrowToEdit);

    if (borrowToEdit) {
      setEditingBorrow(borrowToEdit);
      setShowEditBorrowModal(true);
    }
  };
  const handleSaveEditedBorrow = async (editedBorrow) => {
    try {
      console.log("Saving edited borrow:", editedBorrow);
      const response = await fetch(`/api/admin/borrows/${editedBorrow._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(editedBorrow),
      });

      if (!response.ok) {
        throw new Error("Failed to update borrow.");
      }
      const updatedBorrow = await response.json();
      // Note: Assuming updatedBorrow has an _id field consistent with borrows array
      setBorrows((prevBorrows) =>
        prevBorrows.map((borrow) =>
          borrow._id === updatedBorrow._id ? updatedBorrow : borrow
        )
      );
      toast.success("Borrow updated successfully!");
      setShowEditBorrowModal(false);
      await loadAdminDashboardData(); // Refresh the data after updating a borrow
    } catch (error) {
      console.error("Failed to update borrow:", error);
    }
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    console.log("Admin: Edit user:", userToEdit);

    if (userToEdit) {
      setEditingUser(userToEdit);
      setShowEditUserModal(true);
    }
  };
  const handleSaveEditedUser = async (editedUser) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }
      const response = await fetch(`/api/admin/members/${editedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(editedUser),
      });

      const updatedUser = await response.json();
      console.log("AdminDashboard: handleSaveEditedUser", updatedUser);

      if (!response.ok) {
        // alert(updatedUser.message || "Failed to update user.");
        toast.error(
          (updatedUser && "❌ " + updatedUser.error) || "Failed to update user."
        );
        return;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      toast.success("✔️ User updated successfully!");
      setShowEditUserModal(false);
      loadAdminDashboardData();
      console.log("User updated successfully:", updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("❌ No authorization token found.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        toast.error(data.error || "Failed to delete user. Please try again.");
        return;
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("✔️ User deleted successfully!");
      loadAdminDashboardData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        "❌ " + (error.message || "An error occurred while deleting the user.")
      );
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fffdf5]">
        <RefreshCw className="h-8 w-8 animate-spin text-[#FF9800]" />
        <span className="ml-3 text-gray-600">Verifying Admin Access...</span>
      </div>
    );
  }
  if (!user) return null; // Should not happen if !user redirects, but for safety

  return (
    <div className="flex flex-col min-h-screen bg-[#fffdf5]">
      <DashboardHeader onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            Manage library resources and personnel
          </p>
        </div>

        <DashboardStats stats={stats} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row bg-[#fff8e1] rounded-md p-1.5 self-start w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex items-center gap-2 px-5 py-3 text-base font-medium transition-colors
                ${
                  activeTab === "books"
                    ? "bg-[#FF9800] text-white"
                    : "text-gray-700"
                }
                border-b sm:border-b-0 sm:border-r border-gray-300
                ${activeTab === "books" ? "z-10" : ""}
                // Apply top radius to the first tab
                rounded-t-md sm:rounded-tr-none sm:rounded-l-md
              `}
            >
              <BookOpen className="h-5 w-5" /> Books
            </button>
            <button
              onClick={() => setActiveTab("borrows")}
              className={`flex items-center gap-2 px-5 py-3 text-base font-medium transition-colors
                ${
                  activeTab === "borrows"
                    ? "bg-[#FF9800] text-white"
                    : "text-gray-700"
                }
                border-b sm:border-b-0 sm:border-r border-gray-300
                ${activeTab === "borrows" ? "z-10" : ""}
              `}
            >
              <BookCopy className="h-5 w-5" /> Borrows
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-5 py-3 text-base font-medium transition-colors
                ${
                  activeTab === "users"
                    ? "bg-[#FF9800] text-white"
                    : "text-gray-700"
                }
                // This is now the last tab, adjust borders and radius
                border-b-0 sm:border-b-0 sm:border-r-0
                ${activeTab === "users" ? "z-10" : ""}
                // Apply bottom radius to the last tab
                rounded-b-md sm:rounded-bl-none sm:rounded-r-md
              `}
            >
              <Users className="h-5 w-5" /> Users
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 self-end sm:self-center w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`text-gray-500 h-5 w-5 mr-2 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline text-gray-700">Refresh</span>
            </button>
            {activeTab === "books" && (
              <button
                onClick={handleAddBook}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
              >
                <BookPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Book</span>
              </button>
            )}
            {showAddBookModal && (
              <AddBookModal
                isOpen={showAddBookModal}
                onClose={handleCloseAddBookModal}
              />
            )}

            {activeTab === "borrows" && (
              <button
                onClick={handleAddBorrow}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
              >
                <BookPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Borrow</span>
              </button>
            )}
            {activeTab === "users" && (
              <button
                onClick={handleAddUser}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium transition-colors w-full sm:w-auto"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          {activeTab === "books" && (
            <BooksManagementSection
              books={books}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
            />
          )}

          {activeTab === "borrows" && (
            <BorrowsManagementSection
              borrows={borrows || []}
              onEditBorrow={handleEditBorrow}
              // onDeleteBorrow={handleDeleteBorrow} // This was commented out
            />
          )}

          {activeTab === "users" && (
            <UsersManagementSection
              users={users || []}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </div>
      </main>
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Add New User
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newUser = {
                  userCode: formData.get("userCode"),
                  username: formData.get("username"),
                  password: formData.get("password"),
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  birthDate: formData.get("birthDate"),
                };
                handleSaveUser(newUser);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  User Code
                </label>
                <input
                  type="text"
                  name="userCode"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Password
                </label>
                <input
                  type="text"
                  name="password"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthDate"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#F57C00] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedUser = {
                  ...editingUser,
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  birthDate: formData.get("birthDate"),
                  address: formData.get("address"),
                };
                handleSaveEditedUser(updatedUser);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={editingUser.firstName}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={editingUser.lastName}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser.email}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingUser.phone}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthDate"
                  defaultValue={
                    editingUser.birthDate
                      ? new Date(editingUser.birthDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingUser.address || ""}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#F57C00] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditBorrowModal && editingBorrow && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Edit Borrow
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedBorrow = {
                  ...editingBorrow,
                  borrowDate: formData.get("borrowDate"), // Maybe make this readOnly too?
                  expectedReturnDate: formData.get("expectedReturnDate"),
                  returnDate: formData.get("returnDate") || null, // Allow null for not returned
                  status: formData.get("status"),
                  is_fine_paid: formData.get("is_fine_paid") === "true", // Correctly parse boolean
                };
                handleSaveEditedBorrow(updatedBorrow);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  User
                </label>
                <input
                  type="text"
                  name="userName"
                  defaultValue={editingBorrow.userName} // Assumes userName is available
                  readOnly
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border cursor-not-allowed bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Book
                </label>
                <input
                  type="text"
                  name="bookTitle"
                  defaultValue={editingBorrow.bookTitle} // Assumes bookTitle is available
                  readOnly
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border cursor-not-allowed bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Borrow Date
                </label>
                <input
                  type="date"
                  name="borrowDate"
                  defaultValue={
                    editingBorrow.borrowDate
                      ? new Date(editingBorrow.borrowDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  // Assuming borrow date shouldn't change
                  readOnly
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border cursor-not-allowed bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  name="expectedReturnDate"
                  defaultValue={
                    editingBorrow.expectedReturnDate
                      ? new Date(editingBorrow.expectedReturnDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  value={editBorrowStatus}
                  onChange={(e) => setEditBorrowStatus(e.target.value)}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
                >
                  {/* <option value="Pending">Pending</option> */}
                  <option value="Borrowed">Borrowed</option>
                  <option value="Returned">Returned</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {editBorrowStatus === "Returned" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500">
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    defaultValue={
                      editingBorrow.returnDate
                        ? new Date(editingBorrow.returnDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    required
                    className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditBorrowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#F57C00] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddBorrowModal &&
        (() => {
          // Tính ngày hôm nay và ngày trả dự kiến (+60 ngày)
          const today = new Date();
          const borrowDate = today.toISOString().split("T")[0];
          const expectedReturnDate = new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];

          return (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 min-w-0 overflow-y-auto max-h-screen">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Add Borrow
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newBorrow = {
                      member: formData.get("memberId"),
                      bookId: formData.get("bookId"),
                      borrowDate, // ngày hôm nay
                      expectedReturnDate, // +60 ngày
                      status: "Borrowed",
                      renewCount: 0,
                      is_fine_paid: false,
                      fine: 0,
                    };
                    handleSaveBorrow(newBorrow);
                  }}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500">
                      Member
                    </label>
                    <select
                      name="memberId"
                      required
                      className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
                    >
                      <option value="">Select a member</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500">
                      Book
                    </label>
                    <select
                      name="bookId"
                      required
                      className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
                    >
                      <option value="">Select a book</option>
                      {books.map((book) => (
                        <option key={book._id} value={book._id}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500">
                      Borrow Date
                    </label>
                    <input
                      type="text"
                      value={borrowDate}
                      readOnly
                      className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500">
                      Expected Return Date
                    </label>
                    <input
                      type="text"
                      value={expectedReturnDate}
                      readOnly
                      className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBorrowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#F57C00] cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
