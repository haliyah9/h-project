"use client";

import { useAuth } from "@/context/AuthContext";
import { CircleUser, ClipboardList, FilePlus, Home } from "lucide-react";
import Link from "next/link";

const staffNav = [
  { title: "Home", path: "/staff/home", icon: <Home /> },
  {
    title: "Submit Requests",
    path: "/staff/submit-requests",
    icon: <FilePlus />,
  },
  { title: "My Requests", path: "/staff/requests", icon: <ClipboardList /> },
  { title: "My Profile", path: "/staff/profile", icon: <CircleUser /> },
];

const adminNav = [{ title: "Home", path: "/admin/home", icon: <Home /> }];

const Sidebar = () => {
  const { role } = useAuth();

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
    <div>
      <h1>{role === "staff" ? "Staff Portal" : "Admin Command Center"}</h1>

      <nav>
        {NavItems?.map((item) => (
          <Link key={item.path} href={item.path}>
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
