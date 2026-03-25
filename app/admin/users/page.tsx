"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/layout/AdminNav";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  charity_percentage: number;
};

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, charity_percentage")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setUsers(data || []);
    }

    fetchUsers();
  }, [supabase]);

  return (
    <main className="page-wrap">
      <AdminNav />

      <div className="card-ui p-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="mt-2 text-sm text-slate-400">View all registered users.</p>
        {message && <p className="mt-2 text-sm text-rose-300">{message}</p>}

        <div className="mt-6 table-wrap">
          <table className="table-ui">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Charity %</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.charity_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}