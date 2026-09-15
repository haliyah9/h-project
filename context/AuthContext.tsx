"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type RoleType = "staff" | "admin" | null;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  username: string;
  role: RoleType;
  department: string;
  handleSignout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<RoleType>(null);
  const [department, setDepartment] = useState<string>("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getRole = async (): Promise<void> => {
      if (!user) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, role, department")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Failed to get user role and department:", error);
        setRole(null);
        setDepartment("");
        return;
      }

      setUsername(data.username);
      setRole(data.role as RoleType);
      setDepartment(data.department);
    };
    getRole();
  }, [user]);

  const handleSignout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        username,
        role,
        department,
        handleSignout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside the provider");
  }

  return context;
};
