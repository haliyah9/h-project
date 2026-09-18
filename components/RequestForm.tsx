"use client";

import { useRef, useState } from "react";

export type RequestFormData = {
  title: string;
  format: "pdf" | "word";
  file: File | null;
};

type RequestProps = {
  initialTitle?: string;
  initialFormat: "pdf" | "word";
  showFileUpload?: boolean;
  loading: boolean;
  submitLabel: string;
  onSubmit: (data: RequestFormData) => void;
  onCancel?: () => void;
};

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-100";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const RequestForm = ({
  initialTitle = "",
  initialFormat = "pdf",
  showFileUpload = true,
  loading,
  submitLabel,
  onSubmit,
  onCancel,
}: RequestProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [format, setFormat] = useState<"pdf" | "word">(initialFormat);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({ title, format, file });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Title / Description</label>
        <input
          type="text"
          name="title"
          value={title}
          placeholder="e.g., Memo for the Chairman"
          required
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Requested Format</label>
        <select
          className={`${inputClass} cursor-pointer`}
          value={format}
          required
          onChange={(e) => setFormat(e.target.value as "pdf" | "word")}
        >
          <option value="" disabled className="bg-white dark:bg-slate-900">
            Select a format for the document to be prepared
          </option>
          <option value="pdf" className="bg-white dark:bg-slate-900">
            PDF Document (.pdf)
          </option>
          <option value="word" className="bg-white dark:bg-slate-900">
            Word Document (.docx)
          </option>
        </select>
      </div>

      {showFileUpload && (
        <div>
          <label className={labelClass}>Upload Source File</label>
          <div className="flex items-center gap-3">
            <input
              id="file-upload"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              required
              ref={fileInputRef}
              className="block w-full text-sm text-slate-500 transition-colors file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-400 dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50"
            />
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="shrink-0 cursor-pointer whitespace-nowrap text-sm font-medium text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Accepted: Images, PDF, Word, Excel.
          </p>
        </div>
      )}

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto dark:focus:ring-offset-slate-900"
        >
          {loading ? "Processing..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
