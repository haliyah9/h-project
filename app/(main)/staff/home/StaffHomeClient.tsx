"use client";

import { useAuth } from "@/context/AuthContext";
import { getStatusColor, Request } from "@/utils/helpers";
import {
  CheckCircle2,
  Clock,
  FileText,
  MoveRight,
  Plus,
  XCircle,
} from "lucide-react";
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {greeting}, {username}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {department} Department
          </p>
        </div>
        <Link
          href="/staff/submit-requests"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <Plus className="h-4 w-4" />
          Submit Request
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Requests
            </h3>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {totalRequests ?? 0}
            </h1>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending
            </h3>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {pendingRequests ?? 0}
            </h1>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Resolved
            </h3>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {resolvedRequests ?? 0}
            </h1>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Cancelled
            </h3>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {cancelledRequests ?? 0}
            </h1>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Recent Requests
          </h2>
          <Link
            href="/staff/requests"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All{" "}
            <span aria-hidden="true">
              <MoveRight />
            </span>
          </Link>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {recentRequest && recentRequest.length > 0 ? (
            recentRequest.map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <h1 className="font-medium text-slate-900 dark:text-slate-50">
                    {req.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Ref: {req.reference}
                    </span>
                    <span>•</span>
                    <span>Format: {req.requested_format}</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                      req.status,
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              <FileText className="mx-auto h-8 w-8 opacity-50 mb-3" />
              <p>No recent request found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffHomeClientPage;
