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
  username: string;
  department: string;
  role: string;
  created_at: string;
};

export const DEPARTMENTS = [
  "Admin / HR",
  "Works",
  "Environment",
  "Tourism",
  "Finance",
];
