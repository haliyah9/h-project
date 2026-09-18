"use client";

import { createClient } from "@/utils/supabase/client";
import { DEPARTMENTS, Profile } from "@/utils/helpers";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  username: string;
  department: string;
  password: string;
};

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:text-slate-100 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const ProfileClientPage = ({
  profile,
  email,
}: {
  profile: Profile;
  email?: string;
}) => {
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: profile.username ?? "",
    department: profile.department ?? "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          department: formData.department,
        })
        .eq("id", profile.id);
      if (dbError) {
        throw new Error(dbError.message);
      }

      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          department: formData.department,
        },
      });
      if (metaError) {
        throw new Error(metaError.message);
      }

      if (formData.password.trim() !== "") {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passwordError) {
          throw new Error(passwordError.message);
        }

        setFormData((prev) => ({ ...prev, password: "" }));
      }

      setMessage({ type: "success", text: "Profile updated successfully" });
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
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Profile Settings
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {profile.role} Account
            </span>
            <span>&bull;</span>
            <span>
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Account Email</label>
            <input
              type="email"
              name="email"
              value={email}
              disabled
              title="Email cannot be changed"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Your email address is managed by the system and cannot be changed
              here.
            </p>
          </div>

          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Departments</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" disabled className="bg-white dark:bg-slate-900">
                Select a department
              </option>
              {DEPARTMENTS.map((dept) => (
                <option
                  value={dept}
                  key={dept}
                  className="bg-white dark:bg-slate-900"
                >
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 border-t border-slate-200 pt-6 dark:border-slate-800">
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Only fill this out if you want to change your password. Must be at
              least 6 characters.
            </p>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto dark:focus:ring-offset-slate-900"
            >
              {loading ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileClientPage;
