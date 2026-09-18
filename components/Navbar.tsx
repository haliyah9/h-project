"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

type NavBarProps = {
  onOpenSidebar: () => void;
};

const Navbar = ({ onOpenSidebar }: NavBarProps) => {
  const pathname = usePathname();
  const { username, department, handleSignout } = useAuth();

  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments[segments.length - 1] || "Home";
  const formattedPageName =
    currentPage.charAt(0).toUpperCase() +
    currentPage.slice(1).replace("-", " ");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {formattedPageName}
        </h3>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
            {username || "Guest User"}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {department || "No Department Selected"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
