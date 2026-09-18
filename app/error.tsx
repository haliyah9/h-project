"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const dashboardPath = pathname.startsWith("/admin")
    ? "/admin/home"
    : pathname.startsWith("/staff")
      ? "/staff/home"
      : "/";
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 animate-badge-pulse">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-200 dark:bg-red-800/40">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div className="max-w-md">
        <p className="font-semibold text-sm text-red-600 dark:text-red-400">
          System Error
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          That request hit a snag.
        </h1>
        <p className="mx-auto mt-3 text-base text-slate-600 dark:text-slate-400">
          Try again, or head back to the dashboard. If this keeps happening,
          pass the reference code below to IT.
        </p>
        {error.digest && (
          <div className="mt-4 inline-block rounded-md bg-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-50">
            Ref: {error.digest}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer w-full sm:w-auto"
        >
          Try again
        </button>
        <Link
          href={dashboardPath}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950 w-full sm:w-auto"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default Error;
