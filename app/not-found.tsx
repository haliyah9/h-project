"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NotFound = () => {
  const pathname = usePathname();

  const dashboardPath = pathname.startsWith("/admin")
    ? "/admin/home"
    : pathname.startsWith("/staff")
      ? "/staff/home"
      : "/";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800/60 animate-badge-pulse">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700/60">
          <FileQuestion className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
      </div>

      <div className="max-w-md">
        <p className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          404
        </p>
        <h1 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-3 text-base text-slate-600 dark:text-slate-400">
          The page you're looking for may have moved, or the link might be off.
        </p>
      </div>

      <Link
        href={dashboardPath}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
      >
        Back to dashboard
      </Link>
    </div>
  );
};

export default NotFound;
