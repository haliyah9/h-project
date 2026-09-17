"use client";

import DownloadButton from "@/components/DownloadButton";
import { useEffect, useState } from "react";
import Tiptap from "@/components/Tiptap";
import { createClient } from "@/utils/supabase/client";
import { X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { asBlob } from "html-docx-js-typescript";
import {
  formatForPdf,
  formatForWord,
  getPdfOptions,
} from "@/utils/DocumentFormatters";
import { useRouter } from "next/navigation";

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
  const supabase = createClient();
  const router = useRouter();

  const [selected, setSelected] = useState<Request | null>(null);
  const [documentHtml, setDocumentHtml] = useState<string>(
    "<p>Start typing the official document here...</p>",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchImage = async (filepath: string) => {
    setImageLoading(true);
    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(filepath, 3600);

    if (error) {
      console.error("Error loading image:", error);
      setImageLoading(false);
      return;
    }

    setImageUrl(data.signedUrl);
    setImageLoading(false);
  };

  const openModal = async (req: Request): Promise<void> => {
    setSelected(req);
    setImageUrl(null);
    fetchImage(req.original_file_url);
  };

  const handleCloseModal = () => {
    setSelected(null);
    setImageUrl(null);
  };

  const handleSaveDocument = async () => {
    if (!selected) {
      return;
    }
    setIsSaving(true);

    try {
      let generatedFile: File;
      const cleanReference = selected.reference.replace(/\s+/g, "_");

      if (selected.requested_format === "pdf") {
        const styledHtml = formatForPdf(documentHtml);
        const pdfOptions = getPdfOptions(`${cleanReference}_final.pdf`);

        const pdfBlob = await html2pdf()
          .set(pdfOptions)
          .from(styledHtml)
          .outputPdf("blob");
        generatedFile = new File([pdfBlob], `${cleanReference}_final.pdf`, {
          type: "application/pdf",
        });
      } else if (selected.requested_format === "word") {
        const wordHtml = formatForWord(documentHtml);

        const docxBlob = await asBlob(wordHtml);
        generatedFile = new File(
          [docxBlob as Blob],
          `${cleanReference}_final.docx`,
          {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        );
      } else {
        throw new Error("Unknown Format Requested");
      }

      const filePath = `resolved/${Date.now()}_${generatedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, generatedFile);
      if (uploadError) {
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      const response = await fetch("/api/admin/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selected.id,
          documentUrl: filePath,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      handleCloseModal();
    } catch (error: any) {
      console.log("Failed to generate document");
    } finally {
      setIsSaving(false);
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
                Action
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

                <td className="px-6 py-4">
                  <button
                    onClick={() => openModal(req)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Start Typing
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex p-4 sm:p-6 items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Draft Document
                </h2>
                <p className="text-sm text-gray-500">
                  Reference:{" "}
                  <span className="font-mono">{selected.reference}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 overflow-hidden bg-gray-50">
              <div className="flex flex-col overflow-y-auto border-r border-gray-200 bg-white p-6">
                <div className="flex-1">
                  <Tiptap content={documentHtml} onChange={setDocumentHtml} />
                </div>

                <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
                  >
                    {isSaving
                      ? "Generating Document..."
                      : `Save and Generate ${selected.requested_format}`}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center overflow-auto p-6">
                {imageLoading ? (
                  <div className="flex flex-col items-center text-gray-400 animate-pulse">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600 mb-4"></div>
                    <p>Loading attachment preview...</p>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Original Upload"
                    className="max-h-full max-w-full rounded-lg object-contain shadow-md border border-gray-200 bg-white"
                  />
                ) : (
                  <p className="text-gray-400">Failed to load preview.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixRequestsClientPage;
