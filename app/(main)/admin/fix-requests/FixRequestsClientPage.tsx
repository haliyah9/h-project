"use client";

import DownloadButton from "@/components/DownloadButton";
import { X } from "lucide-react";
import { useState } from "react";

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

const FixRequestsClientPage = ({ requests }: { requests: Request[] }) => {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <p className="text-gray-500">No request have been submitted.</p>
      </div>
    );
  }
  return (
    <div>
      <h1>Pending Requests</h1>
      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Reference
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Format
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Requested Attachment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="cursor-pointer transition-colors hover:bg-gray-50/50"
              >
                <td className="px-6 py-4 font-mono text-sm font-medium text-emerald-700">
                  {req.reference}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {req.title}
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">
                  {req.requested_format}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      req.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : req.status === "Cancelled"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Original Upload:
                      </span>
                      <DownloadButton filePath={req.original_file_url} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixRequestsClientPage;
