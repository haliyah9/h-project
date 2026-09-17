"use client";

import { useAuth } from "@/context/AuthContext";
import { Request } from "@/utils/types";
import Link from "next/link";

const StaffHomeClientPage = ({
  totalRequests,
  pendingRequests,
  resolvedRequests,
  cancelledRequests,
  recentRequest,
}: {
  totalRequests: number | null;
  pendingRequests: number | null;
  resolvedRequests: number | null;
  cancelledRequests: number | null;
  recentRequest: Request[];
}) => {
  const { username, department } = useAuth();

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div>
      <div>
        <h1>
          Welcome <span>{username}</span>
        </h1>
        <h3>
          <span>{department}</span> {" - "} <span>{greeting}</span>
        </h3>
      </div>

      <div className="flex gap-4">
        <div>
          <h1>{totalRequests}</h1>
          <h3>
            {totalRequests === 0 || totalRequests === null
              ? "No Requests Submitted"
              : "Total Requests"}
          </h3>
        </div>
        <div>
          <h1>{pendingRequests}</h1>
          <h3>
            {pendingRequests === 0 || pendingRequests === null
              ? "No Pending Request"
              : "Pending Requests"}
          </h3>
        </div>
        <div>
          <h1>{resolvedRequests}</h1>
          <h3>
            {resolvedRequests === 0 || resolvedRequests === null
              ? "No Resolved Request"
              : "Resolved Requests"}
          </h3>
        </div>
        <div>
          <h1>{cancelledRequests}</h1>
          <h3>
            {cancelledRequests === 0 || cancelledRequests === null
              ? "No Cancelled Request"
              : "Cancelled Requests"}
          </h3>
        </div>
      </div>

      <div>
        <Link href="/staff/submit-requests">Submit Requests</Link>
      </div>

      <div>
        <h1>Recent Requests</h1>
        {recentRequest?.map((req) => (
          <div key={req.id}>
            <h1>{req.title}</h1>
            <div>
              <p>{req.reference}</p>
              <p>{req.requested_format}</p>
            </div>
            <h3>{req.status}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffHomeClientPage;
