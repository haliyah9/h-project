"use client";

import DownloadButton from "@/components/DownloadButton";
import { getStatusColor } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const AllRequestsClientPage = ({ requests }: { requests: Request[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [selected, setSelected] = useState<Request | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const openModal = (req: Request) => {
    setSelected(req);
    setMessage(null);
  };

  const closeModal = () => {
    setSelected(null);
    setMessage(null);
  };

  const handleDeleteDocument = async () => {
    if (!selected || !selected.document_url) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/revert", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selected.id,
          documentUrl: selected.document_url,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessage({
        type: "success",
        text: "Document deleted successfully and request reverted back to pending",
      });

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsDeleting(false);
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

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-slate-400 opacity-50 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          No Requests Found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No requests have been submitted to the system yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            All Requests
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            System-wide overview of all document digitization requests.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reference
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Format
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
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
              Request Details
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
                    <div className="flex items-center gap-2">
                      <DownloadButton filePath={selected.document_url} />
                      <div className="ml-2 h-4 w-px bg-slate-200 dark:bg-slate-700" />
                      <button
                        type="button"
                        onClick={handleDeleteDocument}
                        disabled={isDeleting}
                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        title="Delete Document & Revert to Pending"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm italic text-slate-400 dark:text-slate-500">
                      Pending Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRequestsClientPage;
