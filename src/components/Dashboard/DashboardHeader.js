"use client";

import { LogOut } from "lucide-react";

export default function DashboardHeader({ onLogout }) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="text-[#FF9800] font-bold text-2xl">
          <span className="text-[#FF9800]">Digital</span> Library Hub
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onLogout}
            className="flex items-center px-4 sm:px-5 py-3 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-md text-base whitespace-nowrap"
            aria-label="Logout"
          >
            <LogOut className="mr-0 sm:mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
