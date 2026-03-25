"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(data?.role);
      }
    };

    getUser();
  }, []);

  return (
    <nav className="glass flex items-center justify-between px-6 py-4 mb-6 rounded-2xl">
      
      {/* LOGO */}
      <Link href="/" className="text-xl font-bold tracking-tight">
        ⛳ Golf Charity
      </Link>

      {/* LINKS */}
      <div className="flex items-center gap-4">
        <Link href="/" className="button-secondary">
          Home
        </Link>

        {user && (
          <Link href="/dashboard" className="button-secondary">
            Dashboard
          </Link>
        )}

        {role === "admin" && (
          <Link href="/admin" className="button-secondary">
            Admin
          </Link>
        )}

        {!user ? (
          <Link href="/login" className="button-primary">
            Login
          </Link>
        ) : (
          <LogoutButton />
        )}
      </div>
    </nav>
  );
}