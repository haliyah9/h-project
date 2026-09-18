"use client";

import DownloadButton from "@/components/DownloadButton";
import RequestForm, { RequestFormData } from "@/components/RequestForm";
import { createClient } from "@/utils/supabase/client";
import { getStatusColor, Request } from "@/utils/helpers";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RequestClient = ({ initialRequests }: { initialRequests: Request[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [selected, setSelected] = useState<Request | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const openModal = (req: Request) => {
    setSelected(req);
    setIsEditing(false);
    setMessage(null);
  };

  const closeModal = () => {
    setSelected(null);
    setMessage(null);
  };

  const handleCancelRequest = async () => {
    if (!selected) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/staff/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selected.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      const updatedReq = { ...selected, status: "Cancelled" };
      setRequests(requests.map((r) => (r.id === selected.id ? updatedReq : r)));
      setSelected(updatedReq);
      setMessage({ type: "success", text: "Request cancelled successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (data: RequestFormData) => {
    if (!selected) {
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/staff/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selected.id,
          title: data.title,
          format: data.format,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      const updatedReq = {
        ...selected,
        title: data.title,
        format: data.format,
      };
      setRequests(requests.map((r) => (r.id === selected.id ? updatedReq : r)));
      setSelected(updatedReq);
      setIsEditing(false);
      setMessage({ type: "success", text: "Request updated successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("realtime_attachments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attachments" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const tableHeadClass =
    "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          No Requests Found
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You haven't submitted any document requests yet.
        </p>
        <Link
          href="/staff/submit-requests"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:focus:ring-offset-slate-950"
        >
          <Plus className="w-4 h-4" />
          Submit a Request
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            My Requests
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track the status of your document requests
          </p>
        </div>
        <Link
          href="/staff/submit-requests"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className={tableHeadClass}>Reference</th>
              <th className={tableHeadClass}>Title</th>
              <th className={tableHeadClass}>Format</th>
              <th className={tableHeadClass}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => openModal(req)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-slate-500 dark:text-slate-400">
                  {req.reference}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {req.title}
                  </div>

                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold uppercase text-slate-500 dark:text-slate-400">
                  {req.requested_format}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                      req.status,
                    )}`}
                  >
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isEditing ? "Edit Request" : "Request Details"}
            </h3>

            {message && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-lg border p-3 text-sm ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                    : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <p className="font-medium">{message.text}</p>
              </div>
            )}

            {isEditing ? (
              <RequestForm
                initialTitle={selected.title}
                initialFormat={selected.requested_format as "pdf" | "word"}
                showFileUpload={false}
                loading={loading}
                submitLabel="Save Changes"
                onSubmit={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Reference
                    </span>
                    <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-50">
                      {selected.reference}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Status
                    </span>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                        selected.status,
                      )}`}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Title
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {selected.title}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Original Upload:
                    </span>
                    <DownloadButton filePath={selected.original_file_url} />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Final Document:
                    </span>
                    {selected.document_url ? (
                      <DownloadButton filePath={selected.document_url} />
                    ) : (
                      <span className="text-sm italic text-slate-400 dark:text-slate-500">
                        Pending Admin
                      </span>
                    )}
                  </div>
                </div>

                {selected.status === "Pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setMessage(null);
                      }}
                      className="flex-1 cursor-pointer rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={handleCancelRequest}
                      disabled={loading}
                      className="flex-1 cursor-pointer rounded-lg bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    >
                      {loading ? "Cancelling..." : "Cancel Request"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RequestClient;
