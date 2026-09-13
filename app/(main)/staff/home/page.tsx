"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const StaffHomePage = () => {
  const { handleSignout } = useAuth();
  return (
    <div>
      <h1>This is the staff home page</h1>
      <Link href="/staff/submit-requests">Submit Attachments</Link>
      <button type="button" onClick={handleSignout}>
        Sign Out
      </button>
    </div>
  );
};

export default StaffHomePage;
