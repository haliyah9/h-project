"use client";

import "./globals.css";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center dark:bg-slate-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 animate-badge-pulse">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-200 dark:bg-red-800/40 text-2xl font-bold text-red-600 dark:text-red-400">
            !
          </div>
        </div>

        <div className="max-w-md">
          <p className="font-semibold text-sm text-red-600 dark:text-red-400 uppercase tracking-widest">
            Application Error
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Something broke at the root.
          </h1>
          <p className="mx-auto mt-3 text-base text-slate-600 dark:text-slate-400">
            Reloading usually fixes this. If it keeps happening, contact IT with
            the reference code below.
          </p>
          {error.digest && (
            <div className="mt-4 inline-block rounded-md bg-slate-200 px-3 py-1.5 text-xs font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-50">
              Ref: {error.digest}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
