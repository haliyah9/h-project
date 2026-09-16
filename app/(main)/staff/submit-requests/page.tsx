"use client";

import RequestForm, { RequestFormData } from "@/components/RequestForm";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SubmitRequestsPage = () => {
  const supabase = createClient();
  const router = useRouter();

  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSubmit = async (data: RequestFormData): Promise<void> => {
    setMessage(null);

    if (!data.file) {
      setMessage({ type: "error", text: "Please select a file to continue" });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to submit a request");
      }

      const cleanFileName = data.file.name.replace(/\s+/g, "_");
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, data.file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const response = await fetch("/api/staff/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          format: data.format,
          fileUrl: filePath,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        await supabase.storage.from("attachments").remove([filePath]);
        throw new Error(result.error);
      }

      setMessage({ type: "success", text: "Request submitted successfully!" });

      setTimeout(() => {
        router.push("/staff/requests");
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm mt-10">
      <h2 className="mb-6 font-serif text-2xl font-semibold text-gray-900">
        New Attachment Request
      </h2>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <RequestForm
        initialFormat="pdf"
        showFileUpload={true}
        loading={loading}
        submitLabel="Submit Request"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/staff/home")}
      />
    </div>
  );
};

export default SubmitRequestsPage;
