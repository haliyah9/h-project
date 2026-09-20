"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";

type UrgentRequest = {
  id: string;
  reference: string;
  title: string;
  requested_format: string;
  created_at: string;
};

const AdminHomeClient = ({
  totalRequests,
  pendingRequests,
  resolvedRequests,
  cancelledRequests,
  urgentRequests,
}: {
  totalRequests: number | null;
  pendingRequests: number | null;
  resolvedRequests: number | null;
  cancelledRequests: number | null;
  urgentRequests: UrgentRequest[];
}) => {
  const { username, department } = useAuth();

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const StatCard = ({
    title,
    count,
    icon: Icon,
    colorTheme,
  }: {
    title: string;
    count: number | null;
    icon: any;
    colorTheme: "blue" | "amber" | "green" | "red";
  }): React.ReactElement => {
    const themes = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
      },
      amber: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
      },
      red: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
      },
    };

    return (
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${themes[colorTheme].bg}`}
          >
            <Icon className={`h-5 w-5 ${themes[colorTheme].text}`} />
          </div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </h3>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {count ?? 0}
          </h1>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {greeting}, {username}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {department} Department &bull; Admin Command Center
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Overview of all system document requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          count={totalRequests}
          icon={FileText}
          colorTheme="blue"
        />

        <StatCard
          title="Needs Action (Pending)"
          count={pendingRequests}
          icon={Clock}
          colorTheme="amber"
        />

        <StatCard
          title="Resolved"
          count={resolvedRequests}
          icon={CheckCircle}
          colorTheme="green"
        />

        <StatCard
          title="Cancelled"
          count={cancelledRequests}
          icon={XCircle}
          colorTheme="red"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Action Queue
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Oldest pending requests needing fixing.
            </p>
          </div>
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All
            <span aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {urgentRequests && urgentRequests.length > 0 ? (
            urgentRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div>
                  <h1 className="font-medium text-slate-900 dark:text-slate-50">
                    {req.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs dark:bg-slate-800">
                      Ref: {req.reference}
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold uppercase text-slate-400">
                      {req.requested_format}
                    </span>
                    <span>&bull;</span>
                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/admin/fix-requests"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    <Wrench className="h-4 w-4" />
                    Fix Request
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500 opacity-50" />
              <p className="font-medium text-slate-900 dark:text-slate-50">
                You are all caught up!
              </p>
              <p className="mt-1 text-sm">No pending requests in the queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHomeClient;
