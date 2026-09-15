"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const { username, role, department, handleSignout } = useAuth();
  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <h3>
          {pathname.slice(7)} <span>page</span>
        </h3>
        <h4>{role}</h4>
      </div>
      <div className="flex gap-2">
        <p>{username}</p>
        <p>{department}</p>
        <button type="button" onClick={handleSignout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
