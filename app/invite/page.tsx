"use client";

import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const InvitePage = () => {
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pageStatus, setPageStatus] = useState<
    "checking" | "expired" | "valid"
  >("checking");

  useEffect(() => {
    const checkSession = async () => {
      const hash = window.location.hash;
      const queryParams = new URLSearchParams(window.location.search);

      if (
        hash.includes("error_description") ||
        queryParams.has("error_description")
      ) {
        setMessage({
          type: "error",
          text: "Your invitation link has expired or is invalid",
        });
        setPageStatus("expired");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setMessage({
          type: "error",
          text: "No active invitation. Link may have expired",
        });
        setPageStatus("expired");
      } else {
        setPageStatus("valid");
      }
    };

    checkSession();
  }, [supabase]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSetupAccount = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          username: formData.username,
        },
      });
      if (error) {
        throw error;
      }

      setMessage({ type: "success", text: "Account setup successfully" });
      setTimeout(() => {
        router.push("/admin/home");
      }, 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (pageStatus === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500 font-medium">
          Verifying invitation...
        </div>
      </div>
    );
  }

  if (pageStatus === "expired") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-50 p-4 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invitation Expired
          </h1>
          <p className="text-gray-500 mb-6">{message?.text}</p>
          <p className="text-sm text-gray-400">
            Please contact your IT administrator to request a new invitation
            link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
      <UserCheck />
      <h1>Complete your account</h1>
      <p>
        You have been invited to join the IT workspace. Please set your username
        and password to continue.
      </p>
      <form onSubmit={handleSetupAccount}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            required
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Password</label>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              required
              minLength={6}
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="submit">
          {loading ? "Setting Up Account..." : "Setup Account"}
        </button>
      </form>
    </div>
  );
};

export default InvitePage;
