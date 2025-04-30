"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { RefreshCw, BookOpen, Users, UserCog } from "lucide-react";

import DashboardHeader from "../../../components/Dashboard/DashboardHeader";
import DashboardStats from "../../../components/Dashboard/DashboardStats";
import DashboardControls from "../../../components/Dashboard/DashboardControls";
import BooksManagementSection from "../../../components/Dashboard/BooksManagementSection";
import UsersManagementSection from "../../../components/Dashboard/UsersManagementSection";

import StaffManagementSection from "../../../components/Dashboard/StaffsManagementSection";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("books");
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [staffs, setStaffs] = useState([]);

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
      console.log(
        "Placeholder: Load ADMIN dashboard data (stats, books, users, staffs)"
      );

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
  const handleAddUser = () => console.log("Admin: Add User");
  const handleAddStaff = () => console.log("Admin: Add Staff");
  const handleBookSearch = (event) =>
    console.log("Admin: Search books:", event.target.value);
  const handleBookFilter = () => console.log("Admin: Filter books");
  const handleEditBook = (bookId) => console.log("Admin: Edit book:", bookId);
  const handleDeleteBook = (bookId) =>
    console.log("Admin: Delete book:", bookId);

  const handleUserSearch = (event) =>
    console.log("Admin: Search users:", event.target.value);
  const handleUserFilter = () => console.log("Admin: Filter users");
  const handleEditUser = (userId) => console.log("Admin: Edit user:", userId);
  const handleDeleteUser = (userId) =>
    console.log("Admin: Delete user:", userId);
  const handleStaffSearch = (event) =>
    console.log("Admin: Search staff:", event.target.value);
  const handleStaffFilter = () => console.log("Admin: Filter staff");
  const handleEditStaff = (staffId) =>
    console.log("Admin: Edit staff:", staffId);
  const handleDeleteStaff = (staffId) =>
    console.log("Admin: Delete staff:", staffId);

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
              className="..."
            >
              <RefreshCw className={`... ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ...">Refresh</span>
            </button>
          </div>
        </div>

        <div className="w-full">
          {activeTab === "books" && (
            <BooksManagementSection
              books={books}
              onSearchChange={handleBookSearch}
              onFilterClick={handleBookFilter}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
            />
          )}

          {activeTab === "users" && (
            <UsersManagementSection
              users={users}
              onSearchChange={handleUserSearch}
              onFilterClick={handleUserFilter}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "staffs" && (
            <StaffManagementSection
              staffs={staffs}
              onSearchChange={handleStaffSearch}
              onFilterClick={handleStaffFilter}
              onEditStaff={handleEditStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
        </div>
      </main>
    </div>
  );
}
