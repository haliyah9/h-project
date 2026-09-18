"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

const DownloadButton = ({ filePath }: { filePath: string }) => {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(filePath, 60);

      if (error) {
        throw Error;
      }

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      setErrorMessage("Failed to open file.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Opening...</span>
          </>
        ) : (
          <>
            <span>View File</span>
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </button>

      {errorMessage && (
        <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default DownloadButton;
