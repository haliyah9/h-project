"use client";

import { getStatusColor, Profile } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, Mail, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserClientPage = ({ users }: { users: Profile[] }) => {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleInvite = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      setMessage({ type: "success", text: "Invitation sent successfully" });
      setEmail("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("realtime_profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage system administrators and staff accounts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Invite New Administrator
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Send an email invitation to grant administrative access.
          </p>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm ${
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                  : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <form
            onSubmit={handleInvite}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  required
                  placeholder="admin@gmail.com"
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-transparent py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="inline-flex h-10.5 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto dark:focus:ring-offset-slate-900"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Registered Users ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No users found in the system
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {user.username ?? "Guest User"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {user.email ?? "No Email Registered"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Dept: {user.department ?? "None"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {user.role}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                        user.account_status,
                      )}`}
                    >
                      {user.account_status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserClientPage;
