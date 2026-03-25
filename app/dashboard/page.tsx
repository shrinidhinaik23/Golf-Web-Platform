"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/layout/LogoutButton";
import DashboardNav from "@/components/layout/DashboardNav";

type Profile = {
  full_name: string;
  email: string;
  charity_percentage: number;
  selected_charity_id: string | null;
};

type Subscription = {
  plan: string;
  status: string;
  renewal_date: string;
};

type ScoreRow = {
  id: string;
  score: number;
  played_on: string;
};

export default function DashboardPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCharity, setSelectedCharity] = useState("Not selected");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, charity_percentage, selected_charity_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setMessage(profileError.message);
        return;
      }

      setProfile(profileData);

      if (profileData?.selected_charity_id) {
        const { data: charityData } = await supabase
          .from("charities")
          .select("name")
          .eq("id", profileData.selected_charity_id)
          .single();

        if (charityData) setSelectedCharity(charityData.name);
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("plan, status, renewal_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subscriptionData) setSubscription(subscriptionData);

      const { data: scoreData } = await supabase
        .from("scores")
        .select("id, score, played_on")
        .eq("user_id", user.id)
        .order("played_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      setScores(scoreData || []);
    }

    fetchDashboardData();
  }, [supabase]);

  return (
    <main className="page-wrap">
      <DashboardNav />

      <div className="card-ui p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="section-title">User Dashboard</h1>
            <p className="section-subtitle">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}.
            </p>
            {message && <p className="mt-2 text-sm text-rose-300">{message}</p>}
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Subscription</p>
          <h2 className="mt-2 text-2xl font-semibold">{subscription?.status ?? "N/A"}</h2>
        </div>
        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Selected Charity</p>
          <h2 className="mt-2 text-2xl font-semibold">{selectedCharity}</h2>
        </div>
        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Contribution</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {profile?.charity_percentage ?? 0}%
          </h2>
        </div>
        <div className="card-ui p-5">
          <p className="text-sm text-slate-400">Scores Stored</p>
          <h2 className="mt-2 text-2xl font-semibold">{scores.length} / 5</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-ui p-6">
          <h2 className="text-xl font-semibold">Profile Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p><span className="font-medium text-white">Name:</span> {profile?.full_name ?? "N/A"}</p>
            <p><span className="font-medium text-white">Email:</span> {profile?.email ?? "N/A"}</p>
            <p><span className="font-medium text-white">Plan:</span> {subscription?.plan ?? "N/A"}</p>
            <p><span className="font-medium text-white">Renewal Date:</span> {subscription?.renewal_date ?? "N/A"}</p>
          </div>
        </div>

        <div className="card-ui p-6">
          <h2 className="text-xl font-semibold">Latest Scores</h2>
          {scores.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No scores added yet.</p>
          ) : (
            <div className="mt-4 table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Played On</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((item) => (
                    <tr key={item.id}>
                      <td>{item.score}</td>
                      <td>{item.played_on}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}