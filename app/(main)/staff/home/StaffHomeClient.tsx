"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Request = {
  id: string;
  reference: string;
  title: string;
  requested_format: string;
  status: string;
  original_file_url: string;
  document_url: string | null;
  created_at: string;
};

const StaffHomeClientPage = ({
  request,
  recentRequest,
}: {
  request: Request[];
  recentRequest: Request[];
}) => {
  const { username, department } = useAuth();

  const totalAttachments = request?.length;
  const pendingAttachments = request?.filter(
    (att) => att.status === "Pending",
  ).length;
  const resolvedAttachments = request?.filter(
    (att) => att.status === "Resolved",
  ).length;
  const cancelledAttachments = request?.filter(
    (att) => att.status === "Cancelled",
  ).length;

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
          <h1>{totalAttachments}</h1>
          <h3>{totalAttachments === 0 ? "Total Request" : "Total Requests"}</h3>
        </div>
        <div>
          <h1>{pendingAttachments}</h1>
          <h3>
            {pendingAttachments === 0
              ? "No Pending Request"
              : "Pending Requests"}
          </h3>
        </div>
        <div>
          <h1>{resolvedAttachments}</h1>
          <h3>
            {resolvedAttachments === 0
              ? "No Resolved Request"
              : "Resolved Requests"}
          </h3>
        </div>
        <div>
          <h1>{cancelledAttachments}</h1>
          <h3>
            {cancelledAttachments === 0
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
