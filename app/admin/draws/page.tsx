"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/layout/AdminNav";

type DrawRow = {
  id: string;
  month: number;
  year: number;
  draw_numbers: number[];
  draw_type: string;
  status: string;
  created_at?: string;
};

type EligibleUser = {
  id: string;
  full_name: string;
  email: string;
};

type ScoreRow = {
  id: string;
  score: number;
  played_on: string;
  created_at: string;
};

type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
  amount: number;
};

export default function AdminDrawsPage() {
  const supabase = createClient();

  const [draws, setDraws] = useState<DrawRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestNumbers, setLatestNumbers] = useState<number[]>([]);
  const [summary, setSummary] = useState<{
    eligibleUsers: number;
    winners3: number;
    winners4: number;
    winners5: number;
    totalPool: number;
  } | null>(null);

  function generateDrawNumbers() {
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }
    return numbers.sort((a, b) => a - b);
  }

  async function fetchDraws() {
    const { data, error } = await supabase
      .from("draws")
      .select("id, month, year, draw_numbers, draw_type, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDraws((data as DrawRow[]) || []);
  }

  useEffect(() => {
    fetchDraws();
  }, []);

  async function handleRunDraw() {
    setLoading(true);
    setMessage("");
    setSummary(null);

    const now = new Date();
    const drawMonth = now.getMonth() + 1;
    const drawYear = now.getFullYear();
    const drawNumbers = generateDrawNumbers();
    setLatestNumbers(drawNumbers);

    // prevent duplicate published draw for same month/year
    const { data: existingDraw } = await supabase
      .from("draws")
      .select("id")
      .eq("month", drawMonth)
      .eq("year", drawYear)
      .eq("status", "published")
      .maybeSingle();

    if (existingDraw) {
      setMessage("A published draw already exists for this month.");
      setLoading(false);
      return;
    }

    // only active subscribers
    const { data: subscriptions, error: subsError } = await supabase
      .from("subscriptions")
      .select("user_id, plan, status, amount")
      .eq("status", "active");

    if (subsError) {
      setMessage(subsError.message);
      setLoading(false);
      return;
    }

    const activeSubs = (subscriptions as SubscriptionRow[]) || [];
    const eligibleUserIds = [...new Set(activeSubs.map((s) => s.user_id))];

    if (eligibleUserIds.length === 0) {
      setMessage("No active subscribers found.");
      setLoading(false);
      return;
    }

    const totalPool = activeSubs.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);

    const { data: drawData, error: drawError } = await supabase
      .from("draws")
      .insert({
        month: drawMonth,
        year: drawYear,
        draw_numbers: drawNumbers,
        draw_type: "random",
        status: "published",
      })
      .select()
      .single();

    if (drawError) {
      setMessage(drawError.message);
      setLoading(false);
      return;
    }

    const drawId = drawData.id;

    const pool5 = totalPool * 0.4;
    const pool4 = totalPool * 0.35;
    const pool3 = totalPool * 0.25;

    await supabase.from("prize_pools").insert({
      draw_id: drawId,
      total_pool: totalPool,
      pool_5_match: pool5,
      pool_4_match: pool4,
      pool_3_match: pool3,
      rollover_amount: 0,
    });

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", eligibleUserIds);

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const eligibleUsers = (profiles as EligibleUser[]) || [];

    const winners5: { userId: string }[] = [];
    const winners4: { userId: string }[] = [];
    const winners3: { userId: string }[] = [];

    for (const user of eligibleUsers) {
      const { data: userScores, error: scoreError } = await supabase
        .from("scores")
        .select("id, score, played_on, created_at")
        .eq("user_id", user.id)
        .order("played_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoreError || !userScores || userScores.length === 0) continue;

      const latestFive = (userScores as ScoreRow[]).map((s) => s.score);
      const matchCount = latestFive.filter((score) => drawNumbers.includes(score)).length;

      if (matchCount === 5) winners5.push({ userId: user.id });
      else if (matchCount === 4) winners4.push({ userId: user.id });
      else if (matchCount === 3) winners3.push({ userId: user.id });
    }

    const prize5 = winners5.length > 0 ? pool5 / winners5.length : 0;
    const prize4 = winners4.length > 0 ? pool4 / winners4.length : 0;
    const prize3 = winners3.length > 0 ? pool3 / winners3.length : 0;

    for (const item of winners5) {
      await supabase.from("winners").insert({
        draw_id: drawId,
        user_id: item.userId,
        match_type: "5-match",
        prize_amount: prize5,
        verification_status: "pending",
        payout_status: "pending",
      });
    }

    for (const item of winners4) {
      await supabase.from("winners").insert({
        draw_id: drawId,
        user_id: item.userId,
        match_type: "4-match",
        prize_amount: prize4,
        verification_status: "pending",
        payout_status: "pending",
      });
    }

    for (const item of winners3) {
      await supabase.from("winners").insert({
        draw_id: drawId,
        user_id: item.userId,
        match_type: "3-match",
        prize_amount: prize3,
        verification_status: "pending",
        payout_status: "pending",
      });
    }

    setSummary({
      eligibleUsers: eligibleUsers.length,
      winners3: winners3.length,
      winners4: winners4.length,
      winners5: winners5.length,
      totalPool,
    });

    setMessage("Monthly draw executed successfully.");
    setLoading(false);
    fetchDraws();
  }

  return (
    <main className="page-wrap">
      <AdminNav />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card-ui p-6">
          <h1 className="text-3xl font-bold">Run Monthly Draw</h1>
          <p className="mt-2 text-sm text-slate-400">
            Evaluates active subscribers using their latest 5 Stableford scores.
          </p>

          <button
            onClick={handleRunDraw}
            disabled={loading}
            className="button-primary mt-6 w-full"
          >
            {loading ? "Running draw..." : "Run Draw"}
          </button>

          {latestNumbers.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Latest Draw Numbers</p>
              <p className="mt-2 text-2xl font-semibold">{latestNumbers.join(", ")}</p>
            </div>
          )}

          {summary && (
            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p><span className="font-medium text-white">Eligible Users:</span> {summary.eligibleUsers}</p>
              <p><span className="font-medium text-white">Total Prize Pool:</span> ₹{summary.totalPool}</p>
              <p><span className="font-medium text-white">3-Match Winners:</span> {summary.winners3}</p>
              <p><span className="font-medium text-white">4-Match Winners:</span> {summary.winners4}</p>
              <p><span className="font-medium text-white">5-Match Winners:</span> {summary.winners5}</p>
            </div>
          )}

          {message && <p className="mt-4 text-sm text-rose-300">{message}</p>}
        </div>

        <div className="card-ui p-6">
          <h2 className="text-2xl font-bold">Draw History</h2>

          <div className="mt-4 table-wrap">
            <table className="table-ui">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Numbers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((draw) => (
                  <tr key={draw.id}>
                    <td>{draw.month}</td>
                    <td>{draw.year}</td>
                    <td>
                      {Array.isArray(draw.draw_numbers)
                        ? draw.draw_numbers.join(", ")
                        : JSON.stringify(draw.draw_numbers)}
                    </td>
                    <td>{draw.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}