"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/layout/LogoutButton";
import AdminNav from "@/components/layout/AdminNav";

type AdminStats = {
  totalUsers: number;
  activeSubscribers: number;
  totalSubscriptions: number;
  totalScores: number;
  totalDraws: number;
  totalWinners: number;
  totalDonations: number;
  totalDonationAmount: number;
};

export default function AdminPage() {
  const supabase = createClient();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalSubscriptions: 0,
    totalScores: 0,
    totalDraws: 0,
    totalWinners: 0,
    totalDonations: 0,
    totalDonationAmount: 0,
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchAdminStats() {
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: allSubsCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true });

      const { count: activeSubsCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: scoresCount } = await supabase
        .from("scores")
        .select("*", { count: "exact", head: true });

      const { count: drawsCount } = await supabase
        .from("draws")
        .select("*", { count: "exact", head: true });

      const { count: winnersCount } = await supabase
        .from("winners")
        .select("*", { count: "exact", head: true });

      const { data: donationRows } = await supabase
        .from("donations")
        .select("amount");

      const totalDonationAmount =
        (donationRows || []).reduce(
          (sum: number, row: any) => sum + Number(row.amount || 0),
          0
        ) || 0;

      setStats({
        totalUsers: usersCount || 0,
        activeSubscribers: activeSubsCount || 0,
        totalSubscriptions: allSubsCount || 0,
        totalScores: scoresCount || 0,
        totalDraws: drawsCount || 0,
        totalWinners: winnersCount || 0,
        totalDonations: donationRows?.length || 0,
        totalDonationAmount,
      });
    }

    fetchAdminStats();
  }, [supabase]);

  return (
    <main className="page-wrap">
      <AdminNav />

      <div className="card-ui p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle">
              Reports, analytics, subscriptions, draws, and charity insights.
            </p>
            {message && <p className="mt-2 text-sm text-rose-300">{message}</p>}
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Total Users</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalUsers}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Active Subscribers</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.activeSubscribers}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Total Subscriptions</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalSubscriptions}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Scores Stored</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalScores}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Draws Executed</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalDraws}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Total Winners</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalWinners}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Donation Entries</p>
          <h2 className="mt-2 text-2xl font-semibold">{stats.totalDonations}</h2>
        </div>

        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Donation Amount</p>
          <h2 className="mt-2 text-2xl font-semibold">₹{stats.totalDonationAmount}</h2>
        </div>
      </div>
    </main>
  );
}