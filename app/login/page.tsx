"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("User not found after login.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="page-wrap flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="card-ui h-full p-8">
            <span className="badge-ui">Welcome back</span>
            <h1 className="mt-4 text-4xl font-bold">
              Continue your golf and impact journey.
            </h1>
            <p className="mt-4 text-slate-300">
              Access your dashboard, update scores, and manage your
              subscription and charity preferences.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="card-ui p-8">
          <h2 className="text-3xl font-bold">Login</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your dashboard.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="input-ui"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="input-ui"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading} className="button-primary w-full">
              {loading ? "Logging in..." : "Login"}
            </button>

            {message && <p className="text-sm text-rose-300">{message}</p>}

            <p className="text-sm text-slate-400">
              New here?{" "}
              <Link href="/signup" className="text-white underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}