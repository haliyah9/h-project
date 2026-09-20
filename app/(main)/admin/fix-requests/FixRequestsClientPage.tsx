"use client";

import { useEffect, useState } from "react";
import Tiptap from "@/components/Tiptap";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, Loader2, PenLine, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { asBlob } from "html-docx-js-typescript";
import {
  formatForPdf,
  formatForWord,
  getPdfOptions,
} from "@/utils/DocumentFormatters";
import { useRouter } from "next/navigation";
import { getStatusColor } from "@/utils/helpers";

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
  const [documentHtml, setDocumentHtml] = useState<string>("");
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500 opacity-50" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          You are all caught up!
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No requests require fixing at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Pending Requests
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Action required: Draft and finalize documents from source images.
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
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

                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => openModal(req)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  >
                    <PenLine className="w-4 h-4" />
                    Start Typing
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm sm:p-6">
          <div className="flex h-full w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
            <div className="z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Draft Document
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Reference:{" "}
                  <span className="font-mono font-medium">
                    {selected.reference}
                  </span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 grid-cols-1 flex-col overflow-hidden lg:grid lg:grid-cols-2">
              <div className="flex flex-col overflow-y-auto border-r border-gray-200 bg-white p-6">
                <div className="flex flex-col overflow-y-auto border-b border-slate-200 bg-white p-6 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex-1">
                    <Tiptap content={documentHtml} onChange={setDocumentHtml} />
                  </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto dark:focus:ring-offset-slate-900"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Document...
                      </>
                    ) : (
                      `Save and Generate ${selected.requested_format.toUpperCase()}`
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center overflow-auto bg-slate-50 p-6 dark:bg-slate-950/50">
                {imageLoading ? (
                  <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
                    <p className="text-sm font-medium animate-pulse">
                      Loading attachment preview...
                    </p>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Original Upload"
                    className="max-h-full max-w-full rounded-lg border border-slate-200 bg-white object-contain shadow-md dark:border-slate-700 dark:bg-slate-900"
                  />
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Failed to load preview.
                  </p>
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
