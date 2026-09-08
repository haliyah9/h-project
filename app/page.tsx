"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  const [signUpForm, setSignUpForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [department, setDepartment] = useState("");
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const handleSignUpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpForm({ ...signUpForm, [event.target.name]: event.target.value });
  };

  const handleDepartment = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartment(event.target.value);
  };

  const handleSignInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignInForm({ ...signInForm, [event.target.name]: event.target.value });
  };

  const handleSignUp = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!department) {
      console.log("Select a department to continue");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        data: {
          username: signUpForm.username,
          department: department,
        },
      },
    });

    if (error) {
      console.log(error);
    }

    setSignUpForm({
      username: "",
      email: "",
      password: "",
    });
    setDepartment("");
  };

  const handleSignIn = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });

    if (authError) {
      console.log(authError);
      return;
    }

    if (authData?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.log(profileError);
        return;
      }

      if (profile.role === "staff") {
        router.push("/staff/home");
      } else if (profile.role === "admin") {
        router.push("/admin/home");
      } else {
        router.refresh();
      }
    }
  };
  return (
    <div>
      <div>
        <h1>Sign In</h1>
        <div>
          <form onSubmit={handleSignUp}>
            <div>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={signUpForm.username}
                required
                onChange={handleSignUpChange}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={signUpForm.email}
                required
                onChange={handleSignUpChange}
              />
            </div>
            <div>
              <select
                name="department"
                value={department}
                required
                onChange={handleDepartment}
              >
                <option value="" disabled>
                  Select a department
                </option>
                <option value="Admin / HR">Admin / HR</option>
                <option value="Finance">Finance</option>
                <option value="Environment">Environment</option>
                <option value="Works">Works</option>
                <option value="Tourism">Tourism</option>
              </select>
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={signUpForm.password}
                required
                onChange={handleSignUpChange}
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>

      <div>
        <h1>Sign In</h1>
        <form onSubmit={handleSignIn}>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={signInForm.email}
              required
              onChange={handleSignInChange}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={signInForm.password}
              required
              onChange={handleSignInChange}
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}
