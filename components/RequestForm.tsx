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
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const RequestForm = ({
  initialTitle = "",
  initialFormat = "pdf",
  showFileUpload = true,
  loading,
  submitLabel,
  onSubmit,
  onCancel,
}: RequestProps) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [format, setFormat] = useState<"pdf" | "word">(initialFormat);
  const [file, setFile] = useState<File | null>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Title / Description
        </label>
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
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Requested Format
        </label>
        <select
          className={`${inputClass} cursor-pointer`}
          value={format}
          required
          onChange={(e) => setFormat(e.target.value as "pdf" | "word")}
        >
          <option value="" disabled>
            Select a format for the document to be prepared
          </option>
          <option value="pdf">PDF Document (.pdf)</option>
          <option value="word">Word Document (.docx)</option>
        </select>
      </div>

      {showFileUpload && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Upload Source File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
            required
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <button
            type="button"
            onClick={handleClearFile}
            className="ml-3 text-sm font-medium text-red-500 hover:text-red-700 cursor-pointer"
          >
            Clear
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Accepted: Images, PDF, Word, Excel.
          </p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
          loading ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loading ? "Processing..." : submitLabel}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default RequestForm;
