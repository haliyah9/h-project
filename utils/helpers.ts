export type Request = {
  id: string;
  reference: string;
  title: string;
  requested_format: string;
  status: string;
  original_file_url: string;
  document_url: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  username: string;
  department: string;
  role: string;
  account_status: string;
  created_at: string;
};

export const DEPARTMENTS = [
  "Admin / HR",
  "Works",
  "Environment",
  "Tourism",
  "Finance",
];

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }
};
