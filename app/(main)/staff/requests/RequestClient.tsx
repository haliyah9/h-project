"use client";

import DownloadButton from "@/components/DownloadButton";
import RequestForm, { RequestFormData } from "@/components/RequestForm";
import { createClient } from "@/utils/supabase/client";
import { Request } from "@/utils/types";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RequestClient = ({ initialRequests }: { initialRequests: Request[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [selected, setSelected] = useState<Request | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const openModal = (req: Request): void => {
    setSelected(req);
    setIsEditing(false);
  };

  const handleCancelRequest = async (): Promise<void> => {
    if (!selected) {
      return;
    }

    setLoading(true);

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
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (data: RequestFormData): Promise<void> => {
    if (!selected) {
      return;
    }
    setLoading(true);

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
    } catch (error: any) {
      console.log(error.message);
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

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <p className="text-gray-500">You haven't submitted any requests yet.</p>
      </div>
    );
  }

  return (
    <>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="cursor-pointer transition-colors hover:bg-gray-50/50"
                onClick={() => openModal(req)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 font-serif text-xl font-bold text-gray-900">
              {isEditing ? "Edit Request" : "Request Details"}
            </h3>

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
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Reference
                    </span>
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {selected.reference}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Status
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selected.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-gray-500">
                      Title
                    </span>
                    <span className="text-sm text-gray-900">
                      {selected.title}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Original Upload:
                    </span>
                    <DownloadButton filePath={selected.original_file_url} />
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm font-medium text-gray-700">
                      Final Document:
                    </span>
                    {selected.document_url ? (
                      <DownloadButton filePath={selected.document_url} />
                    ) : (
                      <span className="text-sm italic text-gray-400">
                        Pending Admin
                      </span>
                    )}
                  </div>
                </div>

                {selected.status === "Pending" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={handleCancelRequest}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
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
