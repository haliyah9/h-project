"use client";

import { createClient } from "@/utils/supabase/client";
import { DEPARTMENTS, Profile } from "@/utils/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  username: string;
  department: string;
  password: string;
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

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

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
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
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div>
        <h1>Welcome {profile.username}</h1>
        <h3>{profile.role}</h3>
        <p>
          Member since{" "}
          <span>
            {new Date(profile.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </p>
      </div>
      {message && (
        <div
          className={`mb-6 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Account Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            disabled
            title="Email cannot be changed"
            className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Departments
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="" disabled>
              Select a department
            </option>
            {DEPARTMENTS.map((dept) => (
              <option value={dept} key={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="text"
            name="password"
            placeholder="Leave blank to keep current password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            className={inputClass}
          />
          <p className="mt-2 text-xs text-gray-500">
            Only fill this out if you want to change your password
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileClientPage;
