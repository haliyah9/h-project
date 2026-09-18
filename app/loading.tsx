import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50 px-6 dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 animate-badge-pulse motion-reduce:animate-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800/40">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400 motion-reduce:animate-none" />
        </div>
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
        Loading&hellip;
      </p>
    </div>
  );
};

export default Loading;
