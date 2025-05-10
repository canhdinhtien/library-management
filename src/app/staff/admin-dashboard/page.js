"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  RefreshCw,
  BookOpen,
  Users,
  UserCog,
  UserPlus,
  BookPlus,
  BookCopy,
} from "lucide-react";

import DashboardHeader from "../../../components/Dashboard/DashboardHeader";
import DashboardStats from "../../../components/Dashboard/DashboardStats";
import DashboardControls from "../../../components/Dashboard/DashboardControls";
import BooksManagementSection from "../../../components/Dashboard/BooksManagementSection";
import UsersManagementSection from "../../../components/Dashboard/UsersManagementSection";
import StaffManagementSection from "../../../components/Dashboard/StaffsManagementSection";
import BorrowsManagementSection from "../../../components/Dashboard/BorrowsManagementSection";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("books");
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [users, setUsers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddBorrowModal, setShowAddBorrowModal] = useState(false);
  const [showEditBorrowModal, setShowEditBorrowModal] = useState(false);
  const [editingBorrow, setEditingBorrow] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        console.log(
          `AdminDashboard: Role (${user.role}) not admin. Redirecting.`
        );
        // router.replace("/unauthorized");
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

      // Gọi API để lấy danh sách sách
      const booksResponse = await fetch("/api/admin/books", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const booksData = await booksResponse.json();
      console.log("Books data:", booksData);

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

      // Gọi API để lấy danh sách nhân viên
      const staffsResponse = await fetch("/api/employees", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const staffsData = await staffsResponse.json();

      // Cập nhật state với dữ liệu từ API
      setStats(statsData);
      setBooks(booksData);
      setBorrows(borrowsData);
      setUsers(usersData);
      setStaffs(staffsData);

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

  const handleAddBook = () => console.log("Admin: Add Book");
  const handleAddBorrow = () => {
    console.log("Admin: Add Borrow");
    setShowAddBorrowModal(true);
  };
  const handleAddUser = () => {
    console.log("Admin: Add User");
    setShowAddUserModal(true);
  };
  const handleAddStaff = () => {
    console.log("Admin: Add Staff");
    setShowAddStaffModal(true);
  };

  const handleSaveBorrow = async (newBorrow) => {
    try {
      const response = await fetch("/api/admin/borrows", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newBorrow),
      });
      if (!response.ok) {
        throw new Error("Failed to add borrow.");
      }
      const savedBorrow = await response.json();
      setBorrows((prevBorrows) => [...prevBorrows, savedBorrow]);
      alert("Borrow added successfully!");
      setShowAddBorrowModal(false);
      loadAdminDashboardData(); // Refresh the data after adding a new borrow
    } catch (error) {
      console.error("Failed to add borrow:", error);
    }
  };

  const handleSaveStaff = async (newStaff) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newStaff),
      });

      if (!response.ok) {
        throw new Error("Failed to add staff member.");
      }

      const savedStaff = await response.json();
      setStaffs((prevStaffs) => [...prevStaffs, savedStaff]);
      alert("Staff added successfully!");
      setShowAddStaffModal(false);
      loadAdminDashboardData(); // Refresh the data after adding a new staff member
    } catch (error) {
      console.error("Failed to add staff:", error);
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
      if (!response.ok) {
        throw new Error("Failed to add user.");
      }
      const savedUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, savedUser]);
      alert("User added successfully!");
      setShowAddUserModal(false);
      loadAdminDashboardData(); // Refresh the data after adding a new user
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleEditBook = (bookId) => console.log("Admin: Edit book:", bookId);
  const handleDeleteBook = (bookId) =>
    console.log("Admin: Delete book:", bookId);

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
      setBorrows((prevBorrows) =>
        prevBorrows.map((borrow) =>
          borrow.id === updatedBorrow.id ? updatedBorrow : borrow
        )
      );
      alert("Borrow updated successfully!");
      setShowEditBorrowModal(false);
      loadAdminDashboardData(); // Refresh the data after updating a borrow
    } catch (error) {
      console.error("Failed to update borrow:", error);
    }
  };

  const handleDeleteBorrow = async (borrowId) => {
    if (!window.confirm("Are you sure you want to delete this borrow?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/borrows/${borrowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete borrow.");
      }

      // Cập nhật danh sách mượn sách sau khi xóa thành công
      setBorrows((prevBorrows) =>
        prevBorrows.filter((borrow) => borrow.id !== borrowId)
      );
      alert("Borrow deleted successfully!");
      loadAdminDashboardData(); // Refresh the data after deleting a borrow
    } catch (error) {
      console.error("Failed to delete borrow:", error);
      alert("Failed to delete borrow. Please try again.");
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
      const response = await fetch(`/api/admin/members/${editedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update user.");
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      alert("User updated successfully!");
      setShowEditUserModal(false);
      loadAdminDashboardData(); // Refresh the data after updating a user
      console.log("User updated successfully:", updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  const handleDeleteUser = async (userId) => {
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

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      // Cập nhật danh sách người dùng sau khi xóa thành công
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("User deleted successfully!");
      loadAdminDashboardData(); // Refresh the data after deleting a user
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleEditStaff = (staffId) => {
    const staffToEdit = staffs.find((staff) => staff.id === staffId);
    console.log("Admin: Edit staff:", staffToEdit);

    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setShowEditStaffModal(true);
    }
  };
  const handleSaveEditedStaff = async (editedStaff) => {
    try {
      const response = await fetch(`/api/employees/${editedStaff.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(editedStaff),
      });

      if (!response.ok) {
        throw new Error("Failed to update staff member.");
      }

      const updatedStaff = await response.json();
      setStaffs((prevStaffs) =>
        prevStaffs.map((staff) =>
          staff.id === updatedStaff.id ? updatedStaff : staff
        )
      );
      alert("Staff updated successfully!");
      setShowEditStaffModal(false);
      loadAdminDashboardData(); // Refresh the data after updating a staff member
    } catch (error) {
      console.error("Failed to update staff:", error);
    }
  };
  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${staffId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete staff member.");
      }

      // Cập nhật danh sách nhân viên sau khi xóa thành công
      setStaffs((prevStaffs) =>
        prevStaffs.filter((staff) => staff.id !== staffId)
      );
      alert("Staff deleted successfully!");
      loadAdminDashboardData(); // Refresh the data after deleting a staff member
    } catch (error) {
      console.error("Failed to delete staff:", error);
      alert("Failed to delete staff. Please try again.");
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
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#fffdf5]">
      <DashboardHeader onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            Manage library resources and personnel
          </p>
        </div>

        <DashboardStats stats={stats} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex bg-[#fff8e1] rounded-md p-1.5 self-start">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
                activeTab === "books"
                  ? "bg-[#FF9800] text-white"
                  : "text-gray-700"
              }`}
            >
              <BookOpen className="h-5 w-5" /> Books
            </button>

            <button
              onClick={() => setActiveTab("borrows")}
              className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
                activeTab === "borrows"
                  ? "bg-[#FF9800] text-white"
                  : "text-gray-700"
              }`}
            >
              <BookCopy className="h-5 w-5" /> Borrows
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
                activeTab === "users"
                  ? "bg-[#FF9800] text-white"
                  : "text-gray-700"
              }`}
            >
              <Users className="h-5 w-5" /> Users
            </button>

            <button
              onClick={() => setActiveTab("staffs")}
              className={`flex items-center gap-2 px-5 py-3 rounded-md text-base font-medium ${
                activeTab === "staffs"
                  ? "bg-[#FF9800] text-white"
                  : "text-gray-700"
              }`}
            >
              <UserCog className="h-5 w-5" /> Staffs
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
              >
                <BookPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Book</span>
              </button>
            )}
            {activeTab === "borrows" && (
              <button
                onClick={handleAddBorrow}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
              >
                <BookPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Borrow</span>
              </button>
            )}
            {activeTab === "users" && (
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            )}
            {activeTab === "staffs" && (
              <button
                onClick={handleAddStaff}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base font-medium"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Staff</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          {activeTab === "books" && (
            <BooksManagementSection
              books={books || []}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
            />
          )}

          {activeTab === "borrows" && (
            <BorrowsManagementSection
              borrows={borrows || []}
              onEditBorrow={handleEditBorrow}
              onDeleteBorrow={handleDeleteBorrow}
            />
          )}

          {activeTab === "users" && (
            <UsersManagementSection
              users={users || []}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "staffs" && (
            <StaffManagementSection
              staffs={staffs || []}
              onEditStaff={handleEditStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
        </div>
      </main>
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Add New Staff
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newStaff = {
                  staffCode: formData.get("staffCode"),
                  username: formData.get("username"),
                  password: formData.get("password"),
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  birthDate: formData.get("birthDate"),
                };
                handleSaveStaff(newStaff);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Staff Code
                </label>
                <input
                  type="text"
                  name="staffCode"
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
                  onClick={() => setShowAddStaffModal(false)}
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
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Staff</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedStaff = {
                  ...editingStaff,
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  birthDate: formData.get("birthDate"),
                  address: formData.get("address"),
                };
                handleSaveEditedStaff(updatedStaff);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={editingStaff.firstName}
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
                  defaultValue={editingStaff.lastName}
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
                  defaultValue={editingStaff.email}
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
                  defaultValue={editingStaff.phone}
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
                    new Date(editingStaff.birthDate).toISOString().split("T")[0]
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
                  defaultValue={editingStaff.address || ""}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
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
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Edit Borrow
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedBorrow = {
                  ...editingBorrow,
                  borrowDate: formData.get("borrowDate"),
                  expectedReturnDate: formData.get("expectedReturnDate"),
                  returnDate: formData.get("returnDate"),
                  status: formData.get("status"),
                  is_fine_paid: formData.get("is_fine_paid"),
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
                  defaultValue={editingBorrow.userName}
                  readOnly
                  required
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
                  defaultValue={editingBorrow.bookTitle}
                  readOnly
                  required
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
                    new Date(editingBorrow.borrowDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
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
                    new Date(editingBorrow.expectedReturnDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
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
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingBorrow.status}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
                >
                  <option value="Pending">Pending</option>
                  <option value="Borrowed">Borrowed</option>
                  <option value="Returned">Returned</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Fine Amount
                </label>
                <input
                  type="number"
                  name="fineAmount"
                  defaultValue={editingBorrow.fine}
                  readOnly
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border cursor-not-allowed bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Fine Paid
                </label>
                <select
                  name="is_fine_paid"
                  defaultValue={editingBorrow.is_fine_paid}
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>

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
      {showAddBorrowModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add Borrow</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newBorrow = {
                  borrowCode: formData.get("borrowCode"),
                  member: formData.get("memberId"),
                  bookId: formData.get("bookId"),
                  borrowDate: formData.get("borrowDate"),
                  expectedReturnDate: formData.get("expectedReturnDate"),
                  status: "Borrowed",
                  renewCount: 0,
                  is_fine_paid: false,
                  fine: 0,
                  returnDate: null,
                };
                handleSaveBorrow(newBorrow);
              }}
            >
              {/* Member Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Borrow Code
                </label>
                <input
                  type="text"
                  name="borrowCode"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>
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

              {/* Book Dropdown */}
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

              {/* Borrow Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Borrow Date
                </label>
                <input
                  type="date"
                  name="borrowDate"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
                />
              </div>

              {/* Expected Return Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  name="expectedReturnDate"
                  required
                  className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2 border"
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
      )}
    </div>
  );
}
