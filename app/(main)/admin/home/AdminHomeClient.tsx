"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
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
    colorClass,
    bgClass,
  }: {
    title: string;
    count: number | null;
    icon: any;
    colorClass: string;
    bgClass: string;
  }): React.ReactElement => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{count || 0}</h3>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Overview of all system document requests.
        </p>
      </div>

      <div>
        <h1>
          Welcome <span>{username}</span>
        </h1>
        <h3>
          <span>{department}</span> {" - "} <span>{greeting}</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          count={totalRequests}
          icon={FileText}
          bgClass="bg-blue-50"
          colorClass="text-blue-600"
        />

        <StatCard
          title="Needs Action (Pending)"
          count={pendingRequests}
          icon={Clock}
          bgClass="bg-amber-50"
          colorClass="text-amber-600"
        />

        <StatCard
          title="Resolved"
          count={resolvedRequests}
          icon={CheckCircle}
          bgClass="bg-emerald-50"
          colorClass="text-emerald-600"
        />

        <StatCard
          title="Cancelled"
          count={cancelledRequests}
          icon={XCircle}
          bgClass="bg-red-50"
          colorClass="text-red-600"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Action Queue</h2>
          <p className="text-sm text-gray-500">
            Oldest pending requests needing fixing.
          </p>
        </div>
        <Link
          href="/admin/requests"
          className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          View All Requests <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {urgentRequests && urgentRequests.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-100">
          <tbody className="divide-y divide-gray-100">
            {urgentRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-medium text-emerald-700 w-32">
                  {req.reference}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {req.title}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-500 uppercase w-24">
                  {req.requested_format}
                </td>
                <td className="px-6 py-4 text-right w-32">
                  <span className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <Link href="/admin/fix-requests">Fix</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You are all caught up!</p>
          <p className="text-sm text-gray-400">
            No pending requests in the queue.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminHomeClient;
