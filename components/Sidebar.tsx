"use client";

import { useAuth } from "@/context/AuthContext";
import {
  CircleUser,
  ClipboardList,
  FilePlus,
  Files,
  Home,
  ToolCase,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const staffNav = [
  { title: "Home", path: "/staff/home", icon: <Home className="h-5 w-5" /> },
  {
    title: "Submit Requests",
    path: "/staff/submit-requests",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    title: "My Requests",
    path: "/staff/requests",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "My Profile",
    path: "/staff/profile",
    icon: <CircleUser className="h-5 w-5" />,
  },
];

const adminNav = [
  { title: "Home", path: "/admin/home", icon: <Home className="h-5 w-5" /> },
  {
    title: "Fix Requests",
    path: "/admin/fix-requests",
    icon: <ToolCase className="h-5 w-5" />,
  },
  {
    title: "All Requests",
    path: "/admin/requests",
    icon: <ClipboardList className="h-5 w-5" />,
  },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role } = useAuth();
  const pathname = usePathname();

  if (!role) {
    return;
  }

  let NavItems;

  if (role === "staff") {
    NavItems = staffNav;
  } else if (role === "admin") {
    NavItems = adminNav;
  } else {
    NavItems = null;
  }
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 dark:border-slate-800 dark:bg-slate-950 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 animate-badge-pulse">
              <Files className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Digitization
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {role === "staff" ? "Staff Dashboard" : "Admin Command Center"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NavItems?.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 animate-badge-pulse">
              <CircleUser className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                Active Session
              </span>
              <span className="truncate text-xs font-medium text-blue-600 capitalize dark:text-blue-400">
                {role} Account
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
