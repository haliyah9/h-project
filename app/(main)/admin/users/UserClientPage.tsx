"use client";

import { Profile } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <h1>{user.email ?? "Not Registered"}</h1>
          <h1>{user.username ?? "Guest User"}</h1>
          <h2>{user.role}</h2>
          <h3>{user.department ?? "No Department Selected"}</h3>
          <h4>
            {user.account_status.charAt(0).toUpperCase() +
              user.account_status.slice(1)}
          </h4>
          <p>
            {new Date(user.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}

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

      <h2>Invite User</h2>
      <form onSubmit={handleInvite}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={email}
          required
          placeholder="admin@gmail.com"
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit">
          {loading ? "Inviting Admin..." : "Invite Admin"}
        </button>
      </form>
    </div>
  );
};

export default UserClientPage;
