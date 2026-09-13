"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

const DownloadButton = ({ filePath }: { filePath: string }) => {
  const supabase = createClient();
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async (): Promise<void> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(filePath, 60);

      if (error) {
        throw Error;
      }

      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.log("Download Error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={`text-sm font-medium text-emerald-600 transition hover:text-emerald-800 ${
        loading ? "opacity-50 cursor-wait" : ""
      }`}
    >
      {loading ? "Opening..." : "View File"}
    </button>
  );
};

export default DownloadButton;
