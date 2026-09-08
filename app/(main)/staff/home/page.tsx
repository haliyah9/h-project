"use client";

import { useAuth } from "@/context/AuthContext";

const StaffHomePage = () => {
  const { handleSignout } = useAuth();
  return (
    <div>
      <h1>This is the staff home page</h1>
      <button type="button" onClick={handleSignout}>
        Sign Out
      </button>
    </div>
  );
};

export default StaffHomePage;
