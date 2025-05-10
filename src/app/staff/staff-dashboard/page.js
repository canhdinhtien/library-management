"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw } from "lucide-react";

import DashboardHeader from "../../../components/Dashboard/DashboardHeader";
import DashboardStats from "../../../components/Dashboard/DashboardStats";
import DashboardControls from "../../../components/Dashboard/DashboardControls";
import BooksManagementSection from "../../../components/Dashboard/BooksManagementSection";
import UsersManagementSection from "../../../components/Dashboard/UsersManagementSection";
// import { logout } from "@/lib/auth";

export default function StaffDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("books");
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "employee" && user.role !== "admin") {
        router.replace("/unauthorized");
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("Placeholder: Load dashboard data here");

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Staff Dashboard: Logout failed:", error);
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing dashboard data...");
    loadDashboardData();
  };

  const handleAddBook = () => console.log("Add Book clicked");
  const handleAddUser = () => console.log("Add User clicked");
  const handleBookSearch = (event) =>
    console.log("Search books:", event.target.value);
  const handleBookFilter = () => console.log("Filter books clicked");
  const handleEditBook = (bookId) => console.log("Edit book:", bookId);
  const handleDeleteBook = (bookId) => console.log("Delete book:", bookId);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fffdf5]">
        <RefreshCw className="h-8 w-8 animate-spin text-[#FF9800]" />
        <span className="ml-3 text-gray-600">Verifying...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#fffdf5]">
      <DashboardHeader onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            Manage books and user accounts
          </p>
        </div>

        <DashboardStats stats={stats} />

        <DashboardControls
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          onAddBook={handleAddBook}
          onAddUser={handleAddUser}
        />

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

          {activeTab === "users" && <UsersManagementSection users={users} />}
        </div>
      </main>
    </div>
  );
}
